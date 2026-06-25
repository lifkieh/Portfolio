'use client';

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Menu, X, Sun, Moon, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [playTheme, setPlayTheme] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Observer JANGAN mengubah class <html> di dalam callback-nya,
  // karena dia sendiri memantau atribut 'class' -> infinite loop -> RangeError.
  useEffect(() => {
    const check = () => {
      const cls = document.documentElement.className;
      const isPlay = cls.includes('theme-ghibli') || cls.includes('theme-undersea');

      // Hanya update kalau benar-benar berubah -> hindari render storm
      setPlayTheme((prev) => (prev !== isPlay ? isPlay : prev));

      if (!isPlay) {
        // cukup reset flag; biarkan effect [hidden] yang mengurus class play-focus
        setHidden((prev) => (prev ? false : prev));
      }
    };

    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  // Satu-satunya tempat yang menambah/menghapus class play-focus
  useEffect(() => {
    if (hidden) document.documentElement.classList.add('play-focus');
    else document.documentElement.classList.remove('play-focus');
  }, [hidden]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const navLinks = [
    { name: "About", href: "#about" },
    { name: "Skills", href: "#skills" },
    { name: "Projects", href: "#projects" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <header className="fixed w-full z-[100] top-4 px-6">
      <div className="max-w-6xl mx-auto flex items-center justify-between glass py-2 px-4 rounded-2xl relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full gradient-ring flex items-center justify-center font-bold text-slate-900 dark:text-white">
            L
          </div>
          <div className="text-sm font-semibold text-slate-900 dark:text-white">Hello</div>
        </div>

        <nav className="hidden md:flex gap-6 items-center text-sm font-medium text-slate-700 dark:text-slate-200">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} className="hover:text-pink-500 hover:scale-105 transition-all duration-200">
              {link.name}
            </a>
          ))}

          {playTheme && (
            <button
              onClick={() => setHidden((v) => !v)}
              aria-pressed={hidden}
              className="ml-2 px-3 py-1 rounded-full glass border border-white/20 hover:brightness-110 transition-all flex items-center gap-2 text-slate-900 dark:text-white"
              title={hidden ? "Tampilkan konten" : "Sembunyikan konten & fokus bermain"}
            >
              {hidden ? <><Eye size={14} /> Show</> : <><EyeOff size={14} /> Play</>}
            </button>
          )}

          <button
            onClick={toggleTheme}
            className="ml-2 px-3 py-1 rounded-full glass border border-white/20 hover:brightness-110 transition-all flex items-center gap-2 text-slate-900 dark:text-white"
          >
            {mounted && theme === "dark" ? (
              <><Sun size={14} /> Light</>
            ) : (
              <><Moon size={14} /> Dark</>
            )}
          </button>
        </nav>

        <div className="flex md:hidden items-center gap-4">
          {playTheme && (
            <button
              onClick={() => setHidden((v) => !v)}
              aria-pressed={hidden}
              className="p-2 rounded-full glass border border-white/10 text-slate-900 dark:text-white"
              title={hidden ? "Tampilkan konten" : "Sembunyikan konten"}
            >
              {hidden ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          )}

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full glass border border-white/10 text-slate-900 dark:text-white"
          >
            {mounted && theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-full glass border border-white/10 text-slate-900 dark:text-white"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="absolute top-full left-0 right-0 mt-4 p-4 glass rounded-2xl flex flex-col gap-4 border border-white/10 shadow-2xl md:hidden"
            >
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-3 rounded-xl hover:bg-white/10 text-slate-900 dark:text-white font-medium transition"
                >
                  {link.name}
                </a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}