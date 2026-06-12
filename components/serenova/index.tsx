"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSerenova } from "./useSerenova";
import ChatPanel from "./ChatPanel";
import { SerenovaResponse } from "@/lib/serenova/types";
import { ActionRegistry } from "@/lib/serenova/actions/registry";
import { THEME_REGISTRY, isPresetTheme } from "@/lib/serenova/themes/registry";

type Phase = "intro-center" | "intro-slide" | "peek" | "open" | "dragging";

const PEEK_RIGHT = -172; // px — how much card is hidden off-screen right
const PEEK_TOP = 80;     // px from top when peeking

export default function SerenovaWidget() {
  const [phase, setPhase] = useState<Phase>("intro-center");
  const [pos, setPos] = useState({ x: 0, y: 0 }); // used during drag
  const [isDragging, setIsDragging] = useState(false);
  const [showCTA, setShowCTA] = useState(false);

  const dragRef = useRef({ startX: 0, startY: 0, originX: 0, originY: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  // Register handlers
  useEffect(() => {
    ActionRegistry.register("switch_theme", (payload) => {
      const themeName = payload.theme as string;

      // Clear generated theme dulu apapun yang diminta
      const generatedStyle = document.getElementById("serenova-generated") as HTMLStyleElement | null;
      if (generatedStyle) generatedStyle.innerHTML = "";

      const html = document.documentElement;

      // Add transition class briefly untuk smooth switch
      html.classList.add("theme-transitioning");

      // Remove semua theme classes
      Object.values(THEME_REGISTRY).forEach(t => {
        if (t.cssClass) html.classList.remove(t.cssClass);
      });

      if (isPresetTheme(themeName)) {
        const config = THEME_REGISTRY[themeName];
        if (config.available && config.cssClass) {
          html.classList.add(config.cssClass);
        } else if (!config.available) {
          console.warn(`Theme ${themeName} is registered but not yet implemented`);
        }
      }

      setTimeout(() => html.classList.remove("theme-transitioning"), 500);
    });

    ActionRegistry.register("filter_projects", (payload) => {
      // Dispatch custom event — Projects component listen ini
      window.dispatchEvent(new CustomEvent("serenova:filter", { detail: payload }));
    });

    ActionRegistry.register("show_section", (payload) => {
      const sectionId = payload.section as string;
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    });

    ActionRegistry.register("generate_theme", async (payload) => {
      const prompt = payload.prompt as string;
      if (!prompt) return;

      try {
        const res = await fetch("/api/serenova/generate-theme", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });

        if (!res.ok) throw new Error("Generate failed");

        const { css, themeName } = await res.json();

        // Inject CSS ke browser — replace kalau sudah ada
        let styleTag = document.getElementById("serenova-generated") as HTMLStyleElement | null;
        if (!styleTag) {
          styleTag = document.createElement("style");
          styleTag.id = "serenova-generated";
          document.head.appendChild(styleTag);
        }
        styleTag.innerHTML = css;

        // Add transitioning class before change
        document.documentElement.classList.add("theme-transitioning");

        // Remove semua preset theme classes — generated theme override segalanya
        Object.values(THEME_REGISTRY).forEach(t => {
          if (t.cssClass) document.documentElement.classList.remove(t.cssClass);
        });

        setTimeout(() => document.documentElement.classList.remove("theme-transitioning"), 500);

        console.log(`[Serenova] Generated theme applied: ${themeName}`);
      } catch (err) {
        console.error("[Serenova] Failed to generate theme:", err);
      }
    });

  }, []);

  // Pass handler ke hook
  const handleAction = useCallback((action: SerenovaResponse & { type: "action" }) => {
    ActionRegistry.execute(action.intent, action.payload);
  }, []);

  const { messages, isLoading, isOpen, toggleOpen, sendMessage, clearMessages } =
    useSerenova(handleAction);

  // — Intro sequence —
  useEffect(() => {
    // Phase 1: appear at center (instant)
    const t1 = setTimeout(() => {
      // Phase 2: spring slide to top-right peek position
      setPhase("intro-slide");
    }, 800);

    const t2 = setTimeout(() => {
      setPhase("peek");
      setShowCTA(true);
    }, 2000);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // — Sync open state with phase —
  useEffect(() => {
    if (isOpen && phase === "peek") setPhase("open");
    if (!isOpen && phase === "open") setPhase("peek");
  }, [isOpen, phase]);

  // — Drag logic —
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (phase !== "peek") return;
    e.preventDefault();
    setIsDragging(true);
    setPhase("dragging");

    const rect = cardRef.current?.getBoundingClientRect();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: rect?.left ?? 0,
      originY: rect?.top ?? 0,
    };
    setPos({ x: rect?.left ?? 0, y: rect?.top ?? 0 });
  }, [phase]);

  useEffect(() => {
    if (!isDragging) return;

    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setPos({
        x: dragRef.current.originX + dx,
        y: dragRef.current.originY + dy,
      });
    };

    const onUp = () => {
      setIsDragging(false);
      setPhase("peek");
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isDragging]);

  // — Touch drag —
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (phase !== "peek") return;
    const touch = e.touches[0];
    setIsDragging(true);
    setPhase("dragging");
    const rect = cardRef.current?.getBoundingClientRect();
    dragRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      originX: rect?.left ?? 0,
      originY: rect?.top ?? 0,
    };
    setPos({ x: rect?.left ?? 0, y: rect?.top ?? 0 });
  }, [phase]);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      setPos({
        x: dragRef.current.originX + (touch.clientX - dragRef.current.startX),
        y: dragRef.current.originY + (touch.clientY - dragRef.current.startY),
      });
    };
    const onUp = () => { setIsDragging(false); setPhase("peek"); };
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [isDragging]);

  const handleCTAClick = () => {
    setShowCTA(false);
    toggleOpen();
  };

  // — Compute styles per phase —
  const cardStyle = (): React.CSSProperties => {
    if (phase === "dragging") {
      return {
        position: "fixed",
        left: pos.x,
        top: pos.y,
        transition: "none",
        zIndex: 9999,
        cursor: "grabbing",
      };
    }
    if (phase === "intro-center") {
      return {
        position: "fixed",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%) scale(0.85)",
        opacity: 0,
        transition: "opacity 0.4s ease, transform 0.4s ease",
        zIndex: 9999,
      };
    }
    if (phase === "intro-slide") {
      return {
        position: "fixed",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%) scale(1)",
        opacity: 1,
        transition: "all 1.1s cubic-bezier(0.34, 1.56, 0.64, 1)",
        zIndex: 9999,
      };
    }
    if (phase === "peek") {
      return {
        position: "fixed",
        right: PEEK_RIGHT,
        top: PEEK_TOP,
        transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        zIndex: 9999,
        cursor: "grab",
      };
    }
    if (phase === "open") {
      return {
        position: "fixed",
        right: 24,
        top: PEEK_TOP,
        transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        zIndex: 9999,
      };
    }
    return {};
  };

  return (
    <>
      <div
        ref={cardRef}
        style={cardStyle()}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        {/* CTA label — visible in peek phase */}
        {showCTA && phase === "peek" && (
          <button
            onClick={handleCTAClick}
            style={{
              position: "absolute",
              left: -110,
              top: 24,
              background: "linear-gradient(135deg, #c8a84b 0%, #e8c96a 100%)",
              color: "#1a1400",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.06em",
              padding: "6px 14px",
              borderRadius: "20px 0 0 20px",
              border: "none",
              cursor: "pointer",
              whiteSpace: "nowrap",
              boxShadow: "0 4px 16px rgba(200,168,75,0.35)",
              animation: "ctaPulse 2.2s ease-in-out infinite",
              userSelect: "none",
            }}
          >
            ✦ try me
          </button>
        )}

        {/* Main card */}
        <div
          style={{
            width: 320,
            height: phase === "open" ? 520 : 72,
            background: "linear-gradient(160deg, #1c1a10 0%, #12100a 100%)",
            border: "1px solid rgba(200,168,75,0.22)",
            borderRadius: 18,
            overflow: "hidden",
            transition: "height 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease",
            boxShadow: phase === "open"
              ? "0 24px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(200,168,75,0.15), inset 0 1px 0 rgba(200,168,75,0.1)"
              : "0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(200,168,75,0.1)",
          }}
        >
          {/* Header — always visible */}
          <div
            onClick={phase !== "dragging" ? handleCTAClick : undefined}
            style={{
              height: 72,
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "0 16px",
              cursor: phase === "open" ? "default" : "pointer",
              flexShrink: 0,
              borderBottom: phase === "open" ? "1px solid rgba(200,168,75,0.12)" : "none",
            }}
          >
            {/* Avatar */}
            <div style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #c8a84b 0%, #7c5c1e 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              color: "#1a1400",
              fontWeight: 700,
              flexShrink: 0,
              boxShadow: "0 0 0 2px rgba(200,168,75,0.2)",
            }}>
              ✦
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#e8c96a", letterSpacing: "0.01em" }}>
                Serenova
              </div>
              <div style={{ fontSize: 11, color: "rgba(200,168,75,0.55)", marginTop: 1 }}>
                {isLoading ? "typing..." : phase === "open" ? "online" : "click to chat"}
              </div>
            </div>

            {phase === "open" && (
              <button
                onClick={(e) => { e.stopPropagation(); toggleOpen(); }}
                style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: "rgba(200,168,75,0.08)",
                  border: "1px solid rgba(200,168,75,0.15)",
                  color: "rgba(200,168,75,0.6)",
                  cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  fontSize: 16, lineHeight: 1,
                }}
              >
                ×
              </button>
            )}
          </div>

          {/* Chat content — only when open */}
          {phase === "open" && (
            <div style={{ height: 448, display: "flex", flexDirection: "column" }}>
              <ChatPanel
                messages={messages}
                isLoading={isLoading}
                onSend={sendMessage}
                onClose={toggleOpen}
                onClear={clearMessages}
                theme="dark-gold"
              />
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes ctaPulse {
          0%, 100% { transform: translateX(0) scale(1); box-shadow: 0 4px 16px rgba(200,168,75,0.35); }
          50% { transform: translateX(-4px) scale(1.03); box-shadow: 0 6px 22px rgba(200,168,75,0.5); }
        }
      `}</style>
    </>
  );
}
