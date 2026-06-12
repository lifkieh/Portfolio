import OpenAI from "openai";

// Hardcoded timeouts — no external dependency needed for portfolio
const TIMEOUTS = {
  firstChunkTimeoutMs: 15_000,
  idleTimeoutMs: 10_000,
};

const FALLBACK_MODELS = [
  "llama-3.3-70b-versatile", // primary fallback
  "llama-3.1-8b-instant",
  "mixtral-8x7b-32768",
  "gemma2-9b-it"
];

let groqClient: OpenAI | null = null;

function getGroqClient(): OpenAI {
  if (!groqClient) {
    groqClient = new OpenAI({
      baseURL: "https://api.groq.com/openai/v1",
      apiKey: process.env.GROQ_API_KEY || "",
      dangerouslyAllowBrowser: false,
    });
  }
  return groqClient;
}

export interface GroqCompletionParams {
  model: string;
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  temperature?: number;
  max_tokens?: number;
  signal?: AbortSignal;
}

export async function getGroqCompletion(
  params: GroqCompletionParams
): Promise<string> {
  const modelsToTry = [params.model];
  for (const fallback of FALLBACK_MODELS) {
    if (!modelsToTry.includes(fallback)) {
      modelsToTry.push(fallback);
    }
  }

  let lastError: any = null;

  for (const currentModel of modelsToTry) {
    const startTime = Date.now();
    const internalController = new AbortController();

    let receivedFirstChunk = false;
    let fullText = "";
    let timeoutTimer: NodeJS.Timeout | null = null;
    let isAborted = false;
    let abortReason: "CONNECTION_TIMEOUT" | "IDLE_TIMEOUT" | "USER_CANCELLED" | null = null;

    const triggerTimeout = (reason: "CONNECTION_TIMEOUT" | "IDLE_TIMEOUT") => {
      isAborted = true;
      abortReason = reason;
      internalController.abort();
      if (timeoutTimer) clearTimeout(timeoutTimer);
    };

    const abortListener = () => {
      isAborted = true;
      abortReason = "USER_CANCELLED";
      internalController.abort();
      if (timeoutTimer) clearTimeout(timeoutTimer);
    };

    if (params.signal) {
      if (params.signal.aborted) {
        throw new Error("USER_CANCELLED");
      }
      params.signal.addEventListener("abort", abortListener);
    }

    try {
      timeoutTimer = setTimeout(() => {
        if (!receivedFirstChunk) triggerTimeout("CONNECTION_TIMEOUT");
      }, TIMEOUTS.firstChunkTimeoutMs);

      const client = getGroqClient();
      const stream = await client.chat.completions.create(
        {
          model: currentModel,
          messages: params.messages as any,
          stream: true,
          temperature: params.temperature ?? 0.8,
          max_tokens: params.max_tokens ?? 1024,
        },
        { signal: internalController.signal }
      );

      for await (const chunk of stream) {
        if (isAborted) throw new Error(abortReason || "ABORTED");

        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          if (!receivedFirstChunk) {
            receivedFirstChunk = true;
            console.log(`[Serenova] (${currentModel}) first chunk — ${Date.now() - startTime}ms`);
          }
          if (timeoutTimer) clearTimeout(timeoutTimer);
          timeoutTimer = setTimeout(
            () => triggerTimeout("IDLE_TIMEOUT"),
            TIMEOUTS.idleTimeoutMs
          );
          fullText += content;
        }
      }

      if (isAborted) throw new Error(abortReason || "ABORTED");
      if (timeoutTimer) clearTimeout(timeoutTimer);
      if (!fullText.trim()) throw new Error("Empty response from Groq.");

      console.log(`[Serenova] (${currentModel}) stream done — ${Date.now() - startTime}ms`);
      
      if (params.signal) params.signal.removeEventListener("abort", abortListener);
      
      return fullText.trim();
    } catch (error: any) {
      if (timeoutTimer) clearTimeout(timeoutTimer);
      if (params.signal) params.signal.removeEventListener("abort", abortListener);

      const reason = (abortReason as string | null) || (error.name === "AbortError" ? "USER_CANCELLED" : null);
      
      // If user cancelled intentionally, we shouldn't fallback, just stop completely.
      if (reason === "USER_CANCELLED") throw new Error("USER_CANCELLED");
      
      // If it's a rate limit or server error, we log and fallback to the next model
      console.warn(`[Serenova] Model ${currentModel} failed: ${error.message || reason}. Trying fallback...`);
      lastError = error;
    }
  }

  // If all models failed
  throw new Error(lastError?.message || "All Groq models failed.");
}
