'use client';
import React, { useEffect, useState, useRef } from "react";
import { useTheme } from "next-themes";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

// Warna pink variatif per index icon
const PINK_PALETTE = [
  { h: 330, s: 90, l: 65 }, // hot pink
  { h: 315, s: 85, l: 62 }, // magenta pink
  { h: 345, s: 88, l: 68 }, // rose
  { h: 300, s: 70, l: 65 }, // pink-purple
  { h: 350, s: 92, l: 60 }, // deep rose
  { h: 320, s: 80, l: 70 }, // light magenta
  { h: 335, s: 95, l: 63 }, // vivid pink
  { h: 310, s: 75, l: 67 }, // orchid pink
  { h: 355, s: 85, l: 65 }, // coral pink
];

type DockItem = {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
  icon: React.ReactNode;
};

function DockIcon({
  item,
  mouseX,
  isActive,
  onClick,
  iconIndex,
  hoveredIndex,
  totalIcons,
}: {
  item: DockItem;
  mouseX: any;
  isActive: boolean;
  onClick: () => void;
  iconIndex: number;
  hoveredIndex: number | null;
  totalIcons: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);

  const distance = useMotionValue(Infinity);
  const widthSync = useTransform(distance, [-140, 0, 140], [36, 56, 36]);
  const width = useSpring(widthSync, { stiffness: 320, damping: 24 });
  const ySync = useTransform(distance, [-140, 0, 140], [0, -14, 0]);
  const y = useSpring(ySync, { stiffness: 320, damping: 24 });
  const iconScale = useSpring(
    useTransform(width, [36, 56], [1, 1.2]),
    { stiffness: 320, damping: 24 }
  );

  useEffect(() => {
    return mouseX.on("change", (val: number) => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        distance.set(val - (rect.left + rect.width / 2));
      }
    });
  }, [mouseX, distance]);

  // Hitung wave intensity dari icon yang sedang di-hover
  // Semakin jauh dari hoveredIndex, semakin redup
  let waveIntensity = 0;
  let waveColor = PINK_PALETTE[0];

  if (hoveredIndex !== null) {
    const dist = Math.abs(iconIndex - hoveredIndex);
    // Wave menyebar max 4 icon ke kiri/kanan
    waveIntensity = Math.max(0, 1 - dist * 0.28);
    // Warna berdasarkan icon yang di-hover, tapi hue sedikit shift per jarak
    const base = PINK_PALETTE[hoveredIndex % PINK_PALETTE.length];
    const hueShift = dist * 8 * (iconIndex < hoveredIndex ? -1 : 1);
    waveColor = {
      h: (base.h + hueShift + 360) % 360,
      s: base.s,
      l: base.l,
    };
  }

  const glowOpacity = hovering ? 0.9 : waveIntensity * 0.85;
  const bgOpacity = hovering ? 0.22 : waveIntensity * 0.16;
  const borderOpacity = hovering ? 0.6 : waveIntensity * 0.45;

  const content = (
    <motion.div
      ref={ref}
      style={{ width, y }}
      className="relative flex flex-col items-center cursor-pointer select-none"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onClick={onClick}
    >
      {/* Tooltip */}
      <motion.span
        animate={{ opacity: hovering ? 1 : 0, y: hovering ? 0 : 5 }}
        transition={{ duration: 0.15 }}
        className="absolute bottom-full mb-2 px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap pointer-events-none font-semibold"
        style={{
          background: `hsla(${waveColor.h}, ${waveColor.s}%, 25%, 0.92)`,
          border: `1px solid hsla(${waveColor.h}, ${waveColor.s}%, 60%, 0.35)`,
          color: `hsl(${waveColor.h}, 80%, 85%)`,
          backdropFilter: "blur(8px)",
        }}
      >
        {item.label}
      </motion.span>

      {/* Icon circle */}
      <motion.div
        style={{
          width: "100%",
          aspectRatio: "1",
          background: `hsla(${waveColor.h}, ${waveColor.s}%, ${waveColor.l}%, ${bgOpacity})`,
          border: `1px solid hsla(${waveColor.h}, ${waveColor.s}%, ${waveColor.l}%, ${borderOpacity})`,
          boxShadow: waveIntensity > 0.05 || hovering
            ? `0 0 ${hovering ? 16 : 10}px ${hovering ? 3 : 1}px hsla(${waveColor.h}, ${waveColor.s}%, ${waveColor.l}%, ${glowOpacity * 0.4}),
               inset 0 0 ${hovering ? 10 : 6}px hsla(${waveColor.h}, ${waveColor.s}%, ${waveColor.l + 10}%, ${glowOpacity * 0.15})`
            : isActive
            ? `0 0 8px 1px hsla(330, 85%, 65%, 0.2)`
            : "none",
          transition: "background 0.25s, border-color 0.25s, box-shadow 0.25s",
        }}
        className="rounded-full flex items-center justify-center"
      >
        <motion.div
          style={{ scale: iconScale }}
          className="text-white"
        >
          {item.icon}
        </motion.div>
      </motion.div>

      {/* Active dot */}
      <motion.div
        animate={{
          opacity: isActive ? 1 : 0,
          scale: isActive ? 1 : 0,
          backgroundColor: isActive
            ? `hsl(${waveColor.h}, ${waveColor.s}%, ${waveColor.l}%)`
            : "rgba(255,255,255,0.5)",
        }}
        transition={{ duration: 0.2 }}
        className="w-1 h-1 rounded-full mt-1"
      />
    </motion.div>
  );

  if (item.href) {
    return (
      <a
        href={item.href}
        target={item.href.startsWith("http") ? "_blank" : undefined}
        rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
        className="no-underline"
      >
        {content}
      </a>
    );
  }
  return content;
}

export default function FloatingDock() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeId, setActiveId] = useState("home");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const mouseX = useMotionValue(Infinity);
  const dockRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const navItems: DockItem[] = [
    {
      id: "home", label: "Home", href: "#",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" /><path d="M9 21V12h6v9" /></svg>,
    },
    {
      id: "about", label: "About", href: "#about",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>,
    },
    {
      id: "projects", label: "Projects", href: "#projects",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
    },
    {
      id: "contact", label: "Contact", href: "#contact",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>,
    },
  ];

  const extraItems: DockItem[] = [
    {
      id: "theme",
      label: mounted ? (theme === "dark" ? "Light mode" : "Dark mode") : "Theme",
      onClick: toggleTheme,
      icon: mounted && theme === "dark" ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      ),
    },
    {
      id: "resume", label: "Resume", href: "/Lifkie-Lie-Resume.pdf",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
    },
    {
      id: "github", label: "GitHub", href: "https://github.com/lifkieh",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" /></svg>,
    },
    {
      id: "linkedin", label: "LinkedIn", href: "https://linkedin.com/in/yourprofile",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>,
    },
  ];

  // Flatten semua items dengan info index asli (null = divider)
  const allItems: (DockItem | null)[] = [...navItems, null, ...extraItems];

  // Hitung flat index hanya untuk icon (skip divider)
  let iconCounter = -1;
  const itemsWithIndex = allItems.map((item) => {
    if (item === null) return { item: null, iconIndex: -1 };
    iconCounter++;
    return { item, iconIndex: iconCounter };
  });
  const totalIcons = iconCounter + 1;

  // Dock border warna ikut hover
  const hoveredColor = hoveredIndex !== null
    ? PINK_PALETTE[hoveredIndex % PINK_PALETTE.length]
    : { h: 330, s: 60, l: 50 };

  return (
    <div className="fixed bottom-5 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <motion.div
        ref={dockRef}
        className="flex items-end gap-1.5 px-3 py-2.5 rounded-2xl pointer-events-auto"
        style={{
          background: "rgba(8, 4, 12, 0.72)",
          backdropFilter: "blur(20px) saturate(180%)",
          border: `1px solid hsla(${hoveredColor.h}, ${hoveredColor.s}%, ${hoveredColor.l}%, ${hoveredIndex !== null ? 0.35 : 0.15})`,
          boxShadow: hoveredIndex !== null
            ? `0 0 30px -6px hsla(${hoveredColor.h}, ${hoveredColor.s}%, ${hoveredColor.l}%, 0.3),
               0 8px 24px -4px rgba(0,0,0,0.5),
               inset 0 1px 0 hsla(${hoveredColor.h}, 70%, 80%, 0.07)`
            : `0 8px 24px -4px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)`,
          transition: "border-color 0.3s, box-shadow 0.3s",
        }}
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => {
          mouseX.set(Infinity);
          setHoveredIndex(null);
        }}
      >
        {itemsWithIndex.map(({ item, iconIndex }, i) => {
          if (item === null) {
            return (
              <div
                key={`div-${i}`}
                className="self-center mx-0.5"
                style={{
                  width: "1px",
                  height: "22px",
                  background: hoveredIndex !== null
                    ? `hsla(${hoveredColor.h}, 60%, 65%, 0.3)`
                    : "rgba(255,255,255,0.12)",
                  transition: "background 0.3s",
                }}
              />
            );
          }

          return (
            <div
              key={item.id}
              onMouseEnter={() => setHoveredIndex(iconIndex)}
            >
              <DockIcon
                item={item}
                mouseX={mouseX}
                isActive={activeId === item.id}
                iconIndex={iconIndex}
                hoveredIndex={hoveredIndex}
                totalIcons={totalIcons}
                onClick={() => {
                  if (item.onClick) item.onClick();
                  else setActiveId(item.id);
                }}
              />
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
