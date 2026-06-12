"use client";

import { useState, useCallback, useRef } from "react";
import { SerenovaResponse } from "@/lib/serenova/types";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

interface SerenovaState {
  messages: ChatMessage[];
  isLoading: boolean;
  isOpen: boolean;
  error: string | null;
  pendingAction: (SerenovaResponse & { type: "action" }) | null;
}

export function useSerenova(onAction?: (action: SerenovaResponse & { type: "action" }) => void) {
  const [state, setState] = useState<SerenovaState>({
    messages: [],
    isLoading: false,
    isOpen: false,
    error: null,
    pendingAction: null,
  });

  const abortRef = useRef<AbortController | null>(null);

  const toggleOpen = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: !prev.isOpen, error: null }));
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: content.trim(),
    };

    const assistantId = crypto.randomUUID();
    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      isStreaming: true,
    };

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage, assistantMessage],
      isLoading: true,
      error: null,
    }));

    // Build history for API (exclude the empty assistant message we just added)
    const historyForApi = [...state.messages, userMessage].map(({ role, content }) => ({
      role,
      content,
    }));

    // Abort any in-flight request
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    try {
      const response = await fetch("/api/serenova", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historyForApi }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No response body");

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (raw === "[DONE]") break;
          if (raw.startsWith(":")) continue; // keep-alive

          try {
            const parsed = JSON.parse(raw);

            if (parsed.error) {
              setState((prev) => ({
                ...prev,
                error: parsed.error,
                isLoading: false,
                messages: prev.messages.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: parsed.error, isStreaming: false }
                    : m
                ),
              }));
              return;
            }

            if (parsed.indicator) {
              // Typing indicator — show as placeholder, will be replaced
              setState((prev) => ({
                ...prev,
                messages: prev.messages.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: parsed.indicator, isStreaming: true }
                    : m
                ),
              }));
            }
            
            if (parsed.action) {
              const action = parsed.action as SerenovaResponse & { type: "action" };
              
              if (action.confirmationMessage) {
                setState((prev) => ({
                  ...prev,
                  messages: prev.messages.map((m) =>
                    m.id === assistantId
                      ? { ...m, content: action.confirmationMessage!, isStreaming: false }
                      : m
                  ),
                }));
              }
              
              onAction?.(action);
            }

            if (parsed.token) {
              setState((prev) => ({
                ...prev,
                messages: prev.messages.map((m) => {
                  if (m.id !== assistantId) return m;
                  // Clear indicator on first real token
                  const isFirstToken =
                    m.content === "lagi mikir..." || m.content === "thinking...";
                  return {
                    ...m,
                    content: isFirstToken ? parsed.token : m.content + parsed.token,
                    isStreaming: true,
                  };
                }),
              }));
            }
          } catch {
            // Malformed JSON line — skip
          }
        }
      }

      // Mark streaming complete
      setState((prev) => ({
        ...prev,
        isLoading: false,
        messages: prev.messages.map((m) =>
          m.id === assistantId ? { ...m, isStreaming: false } : m
        ),
      }));
    } catch (err: any) {
      if (err.name === "AbortError") return;
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Gagal konek. Coba lagi.",
        messages: prev.messages.map((m) =>
          m.id === assistantId
            ? { ...m, content: "aduh, ada yang ganggu. coba lagi ya.", isStreaming: false }
            : m
        ),
      }));
    }
  }, [state.messages, onAction]);

  const clearMessages = useCallback(() => {
    setState((prev) => ({ ...prev, messages: [], error: null }));
  }, []);

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    isOpen: state.isOpen,
    error: state.error,
    toggleOpen,
    sendMessage,
    clearMessages,
  };
}
