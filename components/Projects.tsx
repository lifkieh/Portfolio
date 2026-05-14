'use client'
import React from 'react'
import ProjectCard from './ProjectCard'
import type { Project } from '@/data/projects'

interface ProjectsProps {
  projects: Project[]
}

export default function Projects({ projects }: ProjectsProps) {
  return (
    <section id="projects" className="section-pad">
      <div className="max-w-6xl mx-auto px-6">
        <h3 className="text-2xl font-semibold mb-6 text-center text-slate-900 dark:text-white">
          Featured Projects
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </div>
    </section>
  )
}