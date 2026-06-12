import { rateLimit } from "@/lib/serenova/rateLimit";
import { detectLanguage } from "@/lib/serenova/detectLanguage";
import { getGroqCompletion } from "@/lib/serenova/groq";
import { buildPortfolioContext } from "@/lib/serenova/portfolio-context";
import { BASE_ID, BASE_EN } from "@/lib/serenova/prompts/base";
import { SITUATIONS_ID, SITUATIONS_EN } from "@/lib/serenova/prompts/situations";
import { PORTFOLIO_IDENTITY_ID, PORTFOLIO_IDENTITY_EN } from "@/lib/serenova/prompts/identity";
import { getRandomQuote } from "@/lib/serenova/prompts/quotes";
import { SerenovaResponse } from "@/lib/serenova/types";

const GROQ_MODEL = "llama-3.3-70b-versatile";

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

function buildSystemPrompt(lang: "en" | "id"): string {
  const portfolioContext = buildPortfolioContext();
  const quote = getRandomQuote(lang);
  const quoteBlock =
    lang === "id"
      ? `\n\n---\n\n# KUTIPAN HARI INI\n\nSelipkan kutipan ini secara natural jika relevan (jangan paksa):\n"${quote}"`
      : `\n\n---\n\n# TODAY'S QUOTE\n\nSlip this in naturally if relevant (don't force it):\n"${quote}"`;

  const portfolioContextBlock =
    lang === "id"
      ? `\n\n---\n\n# DATA PORTFOLIO LIFKIE\n\n${portfolioContext}`
      : `\n\n---\n\n# LIFKIE'S PORTFOLIO DATA\n\n${portfolioContext}`;

  const sections =
    lang === "id"
      ? [PORTFOLIO_IDENTITY_ID, BASE_ID, SITUATIONS_ID, portfolioContextBlock, quoteBlock]
      : [PORTFOLIO_IDENTITY_EN, BASE_EN, SITUATIONS_EN, portfolioContextBlock, quoteBlock];

  return sections.join("\n\n");
}

function parseSerenovaResponse(raw: string): SerenovaResponse {
  try {
    // Strip markdown code fences kalau ada
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(cleaned);
    if (parsed.type === "action" && parsed.intent) return parsed;
    if (parsed.type === "answer" && parsed.message) return parsed;
    // Fallback: treat as plain answer
    return { type: "answer", message: raw };
  } catch {
    // AI gagal return JSON — treat entire response as answer
    return { type: "answer", message: raw };
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const history: Message[] = Array.isArray(body.messages)
      ? body.messages
      : [{ role: "user", content: body.message ?? "" }];

    const currentMessage = history[history.length - 1];
    if (!currentMessage?.content?.trim()) {
      return Response.json({ error: "Empty message." }, { status: 400 });
    }

    // Language detection
    const lang: "en" | "id" = detectLanguage(currentMessage.content);

    // Rate limiting — 15 messages per 60 seconds per IP
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    const { allowed, retryAfter } = rateLimit(`serenova:${ip}`, 15, 60_000);
    if (!allowed) {
      return Response.json(
        { error: lang === "id" ? "Pelan-pelan dulu ya. Coba lagi sebentar." : "Slow down a bit. Try again shortly." },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      );
    }

    // Abort controller — stop Groq if client disconnects
    const controller = new AbortController();
    req.signal.addEventListener("abort", () => controller.abort());

    // Build system prompt with portfolio context injected
    const systemPrompt = buildSystemPrompt(lang);

    // Keep last 20 messages to avoid context overflow
    const trimmedHistory = history.slice(-20).map(({ role, content }) => ({
      role,
      content,
    }));

    const formattedMessages: Message[] = [
      { role: "system", content: systemPrompt },
      ...trimmedHistory,
    ];

    // SSE Stream
    const readableStream = new ReadableStream({
      async start(streamController) {
        const encoder = new TextEncoder();
        const streamClosed = { value: false };

        const keepAlive = setInterval(() => {
          if (streamClosed.value) return clearInterval(keepAlive);
          try {
            streamController.enqueue(encoder.encode(": keep-alive\n\n"));
          } catch {
            clearInterval(keepAlive);
          }
        }, 3_000);

        function enqueue(payload: string) {
          if (streamClosed.value) return;
          try {
            streamController.enqueue(encoder.encode(payload));
          } catch {
            streamClosed.value = true;
          }
        }

        function close() {
          if (streamClosed.value) return;
          streamClosed.value = true;
          clearInterval(keepAlive);
          try {
            streamController.close();
          } catch {}
        }

        try {
          // Typing indicator
          enqueue(
            `data: ${JSON.stringify({
              indicator: lang === "id" ? "lagi mikir..." : "thinking...",
            })}\n\n`
          );

          // Call Groq
          const text = await getGroqCompletion({
            model: GROQ_MODEL,
            messages: formattedMessages,
            temperature: 0.8,
            max_tokens: 1024,
            signal: controller.signal,
          });

          clearInterval(keepAlive);

          const parsed = parseSerenovaResponse(text);

          if (parsed.type === "action") {
            enqueue(`data: ${JSON.stringify({ action: parsed })}\n\n`);
            enqueue(`data: [DONE]\n\n`);
            close();
          } else {
            // Stream response word by word for natural feel
            const words = parsed.message.split(" ");
            for (let i = 0; i < words.length; i++) {
              if (streamClosed.value || controller.signal.aborted) break;
              const chunk = i === 0 ? words[i] : " " + words[i];
              enqueue(`data: ${JSON.stringify({ token: chunk })}\n\n`);
              // Small delay between words for natural streaming effect
              await new Promise((r) => setTimeout(r, 18));
            }

            enqueue(`data: [DONE]\n\n`);
            close();
          }
        } catch (err: any) {
          clearInterval(keepAlive);
          console.error("[Serenova API] Route Error:", err);
          if (!controller.signal.aborted) {
            const errorMsg =
              lang === "id"
                ? "aduh koneksinya ganggu. coba lagi ya."
                : "something got interrupted. try again.";
            enqueue(`data: ${JSON.stringify({ error: errorMsg })}\n\n`);
          }
          close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("[Serenova API]", error.message);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
