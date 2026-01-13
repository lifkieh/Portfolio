'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { Project } from '../data/projects'
import { Github } from 'lucide-react'

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <motion.article 
      whileHover={{ y: -8, scale: 1.01 }} 
      className="glass card-soft flex flex-col h-full p-5"
    >
      {/* IMAGE CONTAINER */}
      <div className="w-full h-44 overflow-hidden rounded-xl mb-4 bg-gray-100 dark:bg-slate-800">
        <img
          src={project.img || ""} 
          alt={project.title}
          className="w-full h-full object-cover"
        />
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
              className="text-[10px] uppercase tracking-wider px-3 py-1 font-bold rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* FOOTER BUTTONS */}
      <div className="flex gap-6 mt-6 pt-4 border-t border-slate-100 dark:border-white/5 items-center">
        {/* Tombol Visit: Hanya muncul jika ada link */}
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

        {/* Tombol GitHub (Source): Hanya muncul jika ada data github */}
        {project.github && project.github !== "" && (
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all group"
          >
            <Github size={20} className="group-hover:scale-110 transition-transform" />
            <span className="text-base font-bold tracking-tight">Source</span>
          </a>
        )}
      </div>
    </motion.article>
  )
}