"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink, 
  Github,
  Lock, 
  AlertCircle 
} from "lucide-react";
import { projects } from "@/data/projects";

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [direction, setDirection] = useState<number>(0);
  
  // State Toast Notification
  const [toast, setToast] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  });

  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) =>
      prev === projects.length - 1 ? 0 : prev + 1
    );
  }, []);

  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex((prev) =>
      prev === 0 ? projects.length - 1 : prev - 1
    );
  };

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(timer);
  }, [nextSlide, currentIndex]);

  const modernSlideVariants: Variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '120%' : '-120%',
      scale: 0.85,
      opacity: 0,
      zIndex: 0,
      filter: "blur(10px)",
    }),
    center: {
      x: 0,
      scale: 1,
      opacity: 1,
      zIndex: 1,
      filter: "blur(0px)",
      transition: {
        x: { type: "spring", stiffness: 300, damping: 25 },
        scale: { type: "spring", stiffness: 350, damping: 30 },
        opacity: { duration: 0.4 },
        filter: { duration: 0.4 },
      },
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '80%' : '-80%',
      scale: 0.9,
      opacity: 0,
      zIndex: 0,
      filter: "blur(10px)",
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    }),
  };

  const project = projects[currentIndex];

  // 1. Cek Link GitHub (Menggunakan properti 'github' dari data)
  const hasGithubLink = project.github && project.github.trim() !== "" && project.github !== "#";
  
  // 2. Cek Link Demo/Project (Menggunakan properti 'link' dari data)
  const hasProjectLink = project.link && project.link.trim() !== "" && project.link !== "#";


  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-transparent transition-colors duration-500">
      
      {/* Background Glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-[-10%] top-0 w-[60vw] max-w-[900px] aspect-square rounded-full opacity-30 blur-[120px] bg-gradient-to-br from-pink-300 to-transparent animate-pulse-slow"></div>
        <div className="absolute right-[-10%] bottom-0 w-[60vw] max-w-[900px] aspect-square rounded-full opacity-25 blur-[160px] bg-gradient-to-br from-sky-200 to-transparent animate-pulse-slower"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20 w-full relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          
          {/* KIRI */}
          <div className="md:col-span-7 space-y-6">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-bold tracking-[0.2em] text-pink-500 uppercase"
            >
              Hello, I'm
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 dark:text-white leading-[0.9]"
            >
              Lifkie Lie{" "}
              <span className="text-slate-300 dark:text-slate-700">—</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-slate-600 dark:text-slate-400 max-w-lg"
            >
              A STUDENT OF{" "}
              <span className="font-medium text-slate-900 dark:text-white">
                MULTIMEDIA NUSANTARA UNIVERSITY
              </span>
              , 2023 – 2027.
            </motion.p>

            <div className="mt-10 flex gap-4">
              <a
                href="https://github.com/lifkiss"
                target="_blank"
                rel="noopener noreferrer"
                className="px-7 py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-xl hover:scale-105 active:scale-95 transition"
              >
                GitHub
              </a>

              <a
                href="#contact"
                className="px-7 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition"
              >
                Contact me
              </a>
            </div>
          </div>

          {/* KANAN (SLIDER) */}
          <div className="md:col-span-5 flex flex-col items-center gap-8">
            <div className="relative group w-full max-w-[450px] perspective-[1000px]">

              <button
                onClick={prevSlide}
                className="absolute left-[-25px] top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border shadow-xl transition hover:bg-white dark:hover:bg-slate-800 hover:scale-110 active:scale-95"
              >
                <ChevronLeft className="text-slate-900 dark:text-white" />
              </button>

              <button
                onClick={nextSlide}
                className="absolute right-[-25px] top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border shadow-xl transition hover:bg-white dark:hover:bg-slate-800 hover:scale-110 active:scale-95"
              >
                <ChevronRight className="text-slate-900 dark:text-white" />
              </button>

              <div className="relative h-[520px] w-full">
                <AnimatePresence mode="popLayout" custom={direction}>
                  <motion.div
                    key={project.id}
                    custom={direction}
                    variants={modernSlideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute inset-0 p-6 rounded-[2.5rem] bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border-2 border-white/30 dark:border-white/10 shadow-2xl flex flex-col origin-center will-change-transform"
                  >
                    <div className="relative h-64 rounded-[1.8rem] overflow-hidden bg-slate-200 dark:bg-slate-800 shadow-sm">
                      <div className="absolute top-4 right-4 z-10 px-4 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 text-[10px] font-black text-pink-500 uppercase tracking-widest backdrop-blur-md">
                        PROJECT
                      </div>
                      <img
                        src={project.img}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                      />
                    </div>

                    <div className="mt-8 px-2 flex flex-col flex-grow">
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                        {project.title}
                      </h3>

                      <p className="mt-3 text-slate-600 dark:text-slate-300 text-sm italic line-clamp-2 font-medium">
                        "{project.description}"
                      </p>

                      <div className="mt-6 flex flex-wrap gap-2">
                        {project.tech.map((t) => (
                          <span
                            key={t}
                            className="text-xs px-3 py-1 font-medium rounded-full border border-white/10 bg-white/5 text-slate-600 dark:text-slate-300 backdrop-blur-md"
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      <div className="mt-auto flex gap-3 w-full">
                         {/* === BUTTON GITHUB (Source) === */}
                         <a
                          href={hasGithubLink ? project.github : "#"} 
                          target={hasGithubLink ? "_blank" : undefined}
                          rel={hasGithubLink ? "noopener noreferrer" : undefined}
                          onClick={(e) => {
                            if (!hasGithubLink) {
                              e.preventDefault();
                              showToast("Repository GitHub bersifat Private / Belum tersedia.");
                            }
                          }}
                          className={`flex-1 py-4 rounded-2xl border-2 font-bold transition-all flex items-center justify-center gap-2 group/secondary
                            ${hasGithubLink 
                              ? "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer" 
                              : "border-slate-200/50 dark:border-slate-700/50 text-slate-400 dark:text-slate-600 opacity-70 cursor-not-allowed" 
                            }
                          `}
                        >
                          {hasGithubLink ? (
                            <Github size={18} className="group-hover/secondary:scale-110 transition-transform"/> 
                          ) : (
                            <Lock size={16} />
                          )}
                          <span className="text-sm">Source</span>
                        </a>

                        {/*BUTTON VIEW PROJECT */}
                        <a
                          href={hasProjectLink ? project.link : "#"}
                          target={hasProjectLink ? "_blank" : undefined}
                          rel={hasProjectLink ? "noopener noreferrer" : undefined}
                          onClick={(e) => {
                            if (!hasProjectLink) {
                              e.preventDefault();
                              showToast("Link Demo Project belum tersedia.");
                            }
                          }}
                          className={`flex-[1.5] py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2
                            ${hasProjectLink
                              ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-[0_10px_20px_-10px_rgba(236,72,153,0.5)] hover:shadow-[0_15px_30px_-10px_rgba(236,72,153,0.6)] hover:brightness-110 active:scale-[0.98] cursor-pointer"
                              : "bg-pink-500/50 text-white/80 cursor-not-allowed shadow-none" 
                            }
                          `}
                        >
                          {hasProjectLink ? (
                             <>View Project <ExternalLink size={14} strokeWidth={3} /></>
                          ) : (
                             <>View Project <Lock size={14} strokeWidth={3} /></>
                          )}
                        </a>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 mt-6">
              <div className="flex gap-2 p-2 rounded-full bg-white/20 dark:bg-slate-900/20 backdrop-blur-lg">
                {projects.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setDirection(i > currentIndex ? 1 : -1);
                      setCurrentIndex(i);
                    }}
                    className={`h-2 rounded-full transition-all duration-500 ${
                      currentIndex === i
                        ? "w-8 bg-gradient-to-r from-pink-500 to-rose-500 shadow-sm"
                        : "w-2 bg-slate-300/50 dark:bg-slate-600/50 hover:bg-pink-300"
                    }`}
                  />
                ))}
              </div>
              <p className="text-[10px] font-black tracking-[0.3em] text-slate-400 dark:text-slate-500 uppercase">
                Project {currentIndex + 1} | {projects.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- TOAST NOTIFICATION (BUBBLE CHAT STYLE) --- */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={`
              fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] 
              flex items-center gap-3 px-6 py-4 
              rounded-2xl shadow-2xl 
              bg-slate-900 dark:bg-white 
              text-white dark:text-slate-900 
              border border-white/10
              
              /* CSS UNTUK EKOR BUBBLE CHAT */
              after:content-[''] 
              after:absolute 
              after:top-full 
              after:left-1/2 
              after:-translate-x-1/2 
              after:border-[8px] 
              after:border-transparent 
              after:border-t-slate-900 dark:after:border-t-white
            `}
          >
            <AlertCircle size={24} className="text-pink-500" />
            <span className="font-bold text-base">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.05); }
        }
        @keyframes pulse-slower {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.1); }
        }
        .animate-pulse-slow { animation: pulse-slow 8s infinite ease-in-out; }
        .animate-pulse-slower { animation: pulse-slower 12s infinite ease-in-out; }
        
        .perspective-[1000px] {
          perspective: 1000px;
        }
      `}</style>
    </section>
  );
}