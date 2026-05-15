'use client'
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Project } from '@/data/projects'
import { Github, X, Info, FileText } from 'lucide-react'

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <motion.article 
        whileHover={{ y: -8, scale: 1.01 }} 
        className="glass card-soft flex flex-col h-full p-5 relative"
      >
        {/* IMAGE CONTAINER */}
        <div className="w-full h-44 overflow-hidden rounded-xl mb-4 bg-gray-100 dark:bg-slate-800">
          {project.img && project.img.trim() !== "" ? (
            <img
              src={project.img} 
              alt={project.title}
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <span className="text-xs uppercase tracking-widest font-bold">No Image</span>
            </div>
          )}
        </div>

        {/* CONTENT SECTION */}
        <div className="flex-grow">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
            {project.title}
          </h4>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm leading-relaxed">
            {project.description}
          </p>

          {/* TECH TAGS */}
          <div className="flex flex-wrap gap-2 mt-4">
            {project.tech.map((t) => (
              <span
                key={t}
                className="text-[10px] uppercase tracking-wider px-3 py-1 font-bold rounded-full border border-white/10 bg-white/5 text-slate-300"
              >
                {t.trim()}
              </span>
            ))}
          </div>
        </div>

        {/* FOOTER BUTTONS */}
        <div className="flex gap-4 mt-6 pt-4 border-t border-slate-100 dark:border-white/5 items-center justify-between">
          <div className="flex gap-4 items-center">
            {/* Tombol Visit */}
            {project.link && project.link !== "" && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-600 dark:text-pink-400 font-semibold text-sm hover:underline"
              >
                Visit Site →
              </a>
            )}

            {project.github && project.github !== "" && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all group"
              >
                <Github size={20} className="group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold tracking-tight">Source</span>
              </a>
            )}

            {/* Tombol Document/Report */}
            {project.documentUrl && project.documentUrl !== "" && (
              <a
                href={project.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-pink-600 dark:hover:text-pink-400 transition-all group"
              >
                <FileText size={20} className="group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold tracking-tight">Report</span>
              </a>
            )}
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-pink-600 dark:hover:text-pink-400 transition"
          >
            <Info size={16} /> More Info
          </button>
        </div>
      </motion.article>

      {/* MODAL MORE INFO */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-[#0e0a12]/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#120b18] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl z-10 flex flex-col"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-600 dark:text-white transition z-20"
              >
                <X size={20} />
              </button>

              {project.img && (
                <div className="w-full h-64 sm:h-80 md:h-96 shrink-0 relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                  <img src={project.img} alt={project.title} className="w-full h-full object-cover object-center" />
                  <div className="absolute bottom-0 left-0 p-6 sm:p-10 z-20 w-full">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                      {project.title}
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {project.tech.map((t) => (
                        <span key={t} className="text-xs uppercase tracking-wider px-3 py-1 font-bold rounded-full bg-white/10 text-white backdrop-blur-md border border-white/10">
                          {t.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="p-6 sm:p-10 flex-grow">
                {(!project.img) && (
                  <>
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                      {project.title}
                    </h2>
                    <div className="flex flex-wrap gap-2 mb-8">
                      {project.tech.map((t) => (
                        <span key={t} className="text-xs uppercase tracking-wider px-3 py-1 font-bold rounded-full bg-white/10 text-slate-300 border border-white/10">
                          {t.trim()}
                        </span>
                      ))}
                    </div>
                  </>
                )}

                <div className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed whitespace-pre-wrap mt-8">
                  {project.longDescription || project.description}
                </div>

                <div className="flex flex-wrap gap-4 mt-12 pt-6 border-t border-slate-200 dark:border-white/10">
                  {project.link && (
                    <a href={project.link} target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold shadow-lg shadow-pink-500/25 hover:brightness-110 active:scale-[0.98] transition">
                      Visit Live Site
                    </a>
                  )}
                  {project.github && (
                    <a href={project.github} target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-white/20 transition flex items-center gap-2">
                      <Github size={20} /> View Source Code
                    </a>
                  )}
                  {project.documentUrl && (
                    <a href={project.documentUrl} target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-white/20 transition flex items-center gap-2 border border-slate-300 dark:border-white/20">
                      <FileText size={20} /> Report
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}