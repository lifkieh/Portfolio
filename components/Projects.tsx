'use client'
import React, { useState, useEffect } from 'react'
import ProjectCard from './ProjectCard'
import type { Project } from '@/data/projects'

interface ProjectsProps {
  projects: Project[]
}

export default function Projects({ projects }: ProjectsProps) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  // Listen to Serenova filter events
  useEffect(() => {
    function handleSerenovaFilter(e: Event) {
      const detail = (e as CustomEvent).detail as { tech?: string; reset?: boolean }
      if (detail.reset || !detail.tech) {
        setActiveFilter(null)
        return
      }
      setActiveFilter(detail.tech.toUpperCase())
    }
    window.addEventListener("serenova:filter", handleSerenovaFilter)
    return () => window.removeEventListener("serenova:filter", handleSerenovaFilter)
  }, [])

  const filtered = activeFilter
    ? projects.filter(p =>
        p.tech.some(t => t.toUpperCase().includes(activeFilter))
      )
    : projects

  return (
    <section id="projects" className="section-pad">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold text-center text-slate-900 dark:text-white">
            Featured Projects
          </h3>
          {/* Filter badge — show when active */}
          {activeFilter && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                filtering by
              </span>
              <span className="
                px-3 py-1 rounded-full text-xs font-semibold
                bg-violet-100 dark:bg-violet-900/40
                text-violet-700 dark:text-violet-300
                border border-violet-200 dark:border-violet-700/50
              ">
                {activeFilter}
              </span>
              <button
                onClick={() => setActiveFilter(null)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                clear ×
              </button>
            </div>
          )}
        </div>

        {/* Empty state when filter returns nothing */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400 dark:text-slate-500">
            <p className="text-lg">no projects found for "{activeFilter}"</p>
            <button
              onClick={() => setActiveFilter(null)}
              className="mt-3 text-sm underline hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              show all projects
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {filtered.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}