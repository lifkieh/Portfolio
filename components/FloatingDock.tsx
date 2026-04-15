'use client';
import React, { useEffect, useState, useRef } from "react";
import { useTheme } from "next-themes";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

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
  colorAngle,
}: {
  item: DockItem;
  mouseX: any;
  isActive: boolean;
  onClick: () => void;
  colorAngle: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);

  const distance = useMotionValue(Infinity);

  const widthSync = useTransform(distance, [-150, 0, 150], [44, 68, 44]);
  const width = useSpring(widthSync, { stiffness: 300, damping: 22 });

  const ySync = useTransform(distance, [-150, 0, 150], [0, -18, 0]);
  const y = useSpring(ySync, { stiffness: 300, damping: 22 });

  useEffect(() => {
    const unsubscribe = mouseX.on("change", (val: number) => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const center = rect.left + rect.width / 2;
        distance.set(val - center);
      }
    });
    return unsubscribe;
  }, [mouseX, distance]);

  const hue = (colorAngle + (isActive ? 20 : 0)) % 360;
  const glowColor = `hsl(${hue}, 85%, 65%)`;
  const bgColor = hovering
    ? `hsla(${hue}, 80%, 65%, 0.25)`
    : isActive
    ? `hsla(${hue}, 70%, 60%, 0.18)`
    : `rgba(255,255,255,0.07)`;

  const iconScale = useTransform(width, [44, 68], [1, 1.25]);
  const iconScaleSpring = useSpring(iconScale, { stiffness: 300, damping: 22 });

  const content = (
    <motion.div
      ref={ref}
      style={{ width, y }}
      className="relative flex flex-col items-center cursor-pointer"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onClick={onClick}
    >
      {/* Tooltip */}
      <motion.span
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: hovering ? 1 : 0, y: hovering ? 0 : 4 }}
        transition={{ duration: 0.15 }}
        className="absolute bottom-full mb-2 px-3 py-1 rounded-lg text-xs whitespace-nowrap pointer-events-none text-white font-medium"
        style={{
          background: `hsla(${hue}, 70%, 30%, 0.9)`,
          backdropFilter: "blur(8px)",
          border: `1px solid hsla(${hue}, 80%, 60%, 0.3)`,
        }}
      >
        {item.label}
      </motion.span>

      {/* Icon button */}
      <motion.div
        style={{
          width: "100%",
          aspectRatio: "1",
          background: bgColor,
          boxShadow: hovering
            ? `0 0 18px 4px hsla(${hue}, 80%, 60%, 0.35), 0 0 6px 1px hsla(${hue}, 90%, 70%, 0.2)`
            : isActive
            ? `0 0 10px 2px hsla(${hue}, 70%, 60%, 0.2)`
            : "none",
          border: `1px solid hsla(${hue}, 70%, 65%, ${hovering ? 0.5 : 0.2})`,
          transition: "background 0.3s, box-shadow 0.3s, border-color 0.3s",
        }}
        className="rounded-full flex items-center justify-center text-white"
      >
        <motion.div style={{ scale: iconScaleSpring }}>
          {item.icon}
        </motion.div>
      </motion.div>

      {/* Active dot */}
      <motion.div
        animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="w-1 h-1 rounded-full mt-1"
        style={{ background: glowColor }}
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
  const [colorAngle, setColorAngle] = useState(0);
  const mouseX = useMotionValue(Infinity);
  const dockRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    let frame: number;
    const animate = () => {
      setColorAngle((prev) => (prev + 0.4) % 360);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const navItems: DockItem[] = [
    {
      id: "home", label: "Home", href: "#",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" /><path d="M9 21V12h6v9" /></svg>,
    },
    {
      id: "about", label: "About", href: "#about",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>,
    },
    {
      id: "projects", label: "Projects", href: "#projects",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
    },
    {
      id: "contact", label: "Contact", href: "#contact",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>,
    },
  ];

  const extraItems: DockItem[] = [
    {
      id: "theme",
      label: mounted ? (theme === "dark" ? "Light mode" : "Dark mode") : "Theme",
      onClick: toggleTheme,
      icon: mounted && theme === "dark" ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      ),
    },
    {
      id: "resume", label: "Resume", href: "/Lifkie-Lie-Resume.pdf",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
    },
    {
      id: "github", label: "GitHub", href: "https://github.com/lifkieh",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" /></svg>,
    },
    {
      id: "linkedin", label: "LinkedIn", href: "https://linkedin.com/in/yourprofile",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>,
    },
  ];

  const allItems: (DockItem | null)[] = [...navItems, null, ...extraItems];

  const borderHue1 = colorAngle % 360;
  const borderHue2 = (colorAngle + 60) % 360;
  const borderHue3 = (colorAngle + 120) % 360;

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <motion.div
        ref={dockRef}
        className="flex items-end gap-2 px-4 py-3 rounded-3xl pointer-events-auto"
        style={{
          background: "rgba(10, 5, 15, 0.65)",
          backdropFilter: "blur(20px) saturate(180%)",
          border: `1px solid hsla(${borderHue1}, 70%, 65%, 0.25)`,
          boxShadow: `
            0 0 0 1px hsla(${borderHue2}, 60%, 55%, 0.1),
            0 8px 32px -4px rgba(0,0,0,0.4),
            0 0 40px -8px hsla(${borderHue3}, 80%, 60%, 0.2),
            inset 0 1px 0 hsla(${borderHue1}, 70%, 80%, 0.08)
          `,
        }}
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
      >
        {allItems.map((item, i) => {
          if (item === null) {
            return (
              <div
                key={`divider-${i}`}
                className="w-px mx-1 self-center"
                style={{
                  height: "28px",
                  background: `hsla(${(colorAngle + i * 30) % 360}, 60%, 65%, 0.25)`,
                }}
              />
            );
          }

          const itemColorAngle = (colorAngle + i * 22) % 360;

          return (
            <DockIcon
              key={item.id}
              item={item}
              mouseX={mouseX}
              isActive={activeId === item.id}
              colorAngle={itemColorAngle}
              onClick={() => {
                if (item.onClick) item.onClick();
                else setActiveId(item.id);
              }}
            />
          );
        })}
      </motion.div>
    </div>
  );
}
