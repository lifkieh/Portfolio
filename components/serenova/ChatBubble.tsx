"use client";

import type { ChatMessage } from "./useSerenova";

interface ChatBubbleProps {
  message: ChatMessage;
  theme?: "default" | "dark-gold";
}

export default function ChatBubble({ message, theme = "default" }: ChatBubbleProps) {
  const isUser = message.role === "user";
  const isGold = theme === "dark-gold";
  const isIndicator =
    message.content === "lagi mikir..." || message.content === "thinking...";

  const userBubbleStyle: React.CSSProperties = isGold
    ? {
        background: "linear-gradient(135deg, #c8a84b, #9a7a2e)",
        color: "#1a1400",
      }
    : {
        background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
        color: "#fff",
      };

  const assistantBubbleStyle: React.CSSProperties = isGold
    ? {
        background: "rgba(200,168,75,0.08)",
        border: "1px solid rgba(200,168,75,0.15)",
        color: "#e8d9a0",
      }
    : {
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "#e2e8f0",
      };

  const avatarStyle: React.CSSProperties = isGold
    ? {
        background: "linear-gradient(135deg, #c8a84b, #7c5c1e)",
        color: "#1a1400",
      }
    : {
        background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
        color: "#fff",
      };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 8,
        flexDirection: isUser ? "row-reverse" : "row",
      }}
    >
      {/* Avatar — only for assistant */}
      {!isUser && (
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            marginBottom: 2,
            fontSize: 10,
            fontWeight: 700,
            ...avatarStyle,
          }}
        >
          ✦
        </div>
      )}

      {/* Bubble */}
      <div
        style={{
          maxWidth: "78%",
          padding: "9px 13px",
          borderRadius: isUser ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
          fontSize: 13,
          lineHeight: 1.55,
          wordBreak: "break-word",
          whiteSpace: "pre-wrap",
          ...(isUser ? userBubbleStyle : assistantBubbleStyle),
        }}
      >
        {isIndicator ? (
          <TypingDots isGold={isGold} />
        ) : (
          <span>{message.content}</span>
        )}

        {/* Streaming cursor */}
        {message.isStreaming && !isIndicator && (
          <span
            style={{
              display: "inline-block",
              width: 2,
              height: 14,
              background: isGold ? "#c8a84b" : "#a78bfa",
              marginLeft: 2,
              verticalAlign: "middle",
              animation: "cursorBlink 1s ease-in-out infinite",
              borderRadius: 1,
            }}
          />
        )}
      </div>

      <style>{`
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
      `}</style>
    </div>
  );
}

function TypingDots({ isGold }: { isGold: boolean }) {
  const dotColor = isGold ? "#c8a84b" : "#a78bfa";
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 4, height: 16 }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: dotColor,
            opacity: 0.6,
            animation: `dotBounce 0.8s ease-in-out ${i * 150}ms infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
        }
      `}</style>
    </span>
  );
}
