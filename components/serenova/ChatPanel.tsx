"use client";

import { useEffect, useRef, useState, KeyboardEvent } from "react";
import type { ChatMessage } from "./useSerenova";
import ChatBubble from "./ChatBubble";

interface ChatPanelProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSend: (message: string) => void;
  onClose: () => void;
  onClear: () => void;
  theme?: "default" | "dark-gold";
}

export default function ChatPanel({
  messages,
  isLoading,
  onSend,
  onClose,
  onClear,
  theme = "default",
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isGold = theme === "dark-gold";

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when panel mounts
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 200);
  }, []);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setInput("");
    // Reset textarea height
    if (inputRef.current) inputRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Messages area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {messages.length === 0 ? (
          <EmptyState isGold={isGold} />
        ) : (
          messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} theme={theme} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div
        style={{
          padding: "10px 14px 12px",
          borderTop: isGold
            ? "1px solid rgba(200,168,75,0.12)"
            : "1px solid rgba(255,255,255,0.1)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="say something..."
            rows={1}
            disabled={isLoading}
            style={{
              flex: 1,
              resize: "none",
              background: isGold ? "rgba(200,168,75,0.06)" : "rgba(255,255,255,0.06)",
              border: isGold
                ? "1px solid rgba(200,168,75,0.18)"
                : "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12,
              padding: "10px 12px",
              fontSize: 13,
              lineHeight: 1.5,
              color: isGold ? "#e8d9a0" : "#e2e8f0",
              outline: "none",
              minHeight: 40,
              maxHeight: 96,
              transition: "border-color 0.2s",
              fontFamily: "inherit",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = isGold
                ? "rgba(200,168,75,0.4)"
                : "rgba(139,92,246,0.5)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = isGold
                ? "rgba(200,168,75,0.18)"
                : "rgba(255,255,255,0.12)";
            }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = Math.min(el.scrollHeight, 96) + "px";
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              flexShrink: 0,
              background: isGold
                ? "linear-gradient(135deg, #c8a84b, #9a7a2e)"
                : "linear-gradient(135deg, #7c3aed, #5b21b6)",
              border: "none",
              cursor: !input.trim() || isLoading ? "not-allowed" : "pointer",
              opacity: !input.trim() || isLoading ? 0.35 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "opacity 0.2s, transform 0.1s",
            }}
            onMouseDown={(e) => {
              if (input.trim() && !isLoading)
                e.currentTarget.style.transform = "scale(0.93)";
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={isGold ? "#1a1400" : "#fff"} strokeWidth="2.5" strokeLinecap="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <div
          style={{
            fontSize: 10,
            color: isGold ? "rgba(200,168,75,0.35)" : "rgba(255,255,255,0.3)",
            textAlign: "center",
            marginTop: 6,
            userSelect: "none",
          }}
        >
          Enter to send · Shift+Enter for newline
        </div>
      </div>
    </div>
  );
}

function EmptyState({ isGold }: { isGold: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        padding: "32px 0",
        textAlign: "center",
        userSelect: "none",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: isGold
            ? "linear-gradient(135deg, rgba(200,168,75,0.15), rgba(200,168,75,0.05))"
            : "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(79,70,229,0.15))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 10,
          fontSize: 18,
        }}
      >
        ✦
      </div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: isGold ? "#e8c96a" : "#e2e8f0",
        }}
      >
        hey, i&apos;m Serenova
      </div>
      <div
        style={{
          fontSize: 11,
          color: isGold ? "rgba(200,168,75,0.45)" : "rgba(255,255,255,0.4)",
          marginTop: 4,
          maxWidth: 180,
          lineHeight: 1.5,
        }}
      >
        ask me about Lifkie&apos;s work, or just say hi
      </div>
    </div>
  );
}
