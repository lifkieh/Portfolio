'use client'
import React from 'react'
import { motion } from 'framer-motion'
import Skills from './Skills'
import Tools from './Tools'
import type { AboutData, SkillsToolsData } from '@/data/projects'

interface AboutProps {
  about: AboutData
  skillsTools: SkillsToolsData
}

export default function About({ about, skillsTools }: AboutProps) {
  return (
    <section id="about" className="section-pad">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass card-soft flex flex-col gap-6 items-start"
        >
          
          {/* 1. AVATAR */}
          <div className="flex items-center gap-4">
            <img
              src={about.avatar}
              alt={`Avatar ${about.name}`}
              className="w-28 h-28 rounded-full object-cover border border-white/20"
            />
            <div className="flex flex-col items-start gap-2">
              <div className="text-sm text-slate-600"></div>
              
              {/* TOMBOL DOWNLOAD RESUME */}
              <a
                href={about.resumeUrl}
                download
                className="
                  px-4 py-2 
                  rounded-lg 
                  text-sm
                  font-bold
                  border-2
                  transition-colors
                  border-slate-200 
                  text-slate-700 
                  hover:bg-slate-50 
                  dark:border-slate-800 
                  dark:text-slate-300 
                  dark:hover:bg-slate-900
                "
              >
                Download Resume
              </a>
            </div>
          </div>

          {/* 2. ABOUT ME  */}
          <div>
            <h2 className="text-3xl font-bold mb-2">About me</h2>
            <p className="text-slate-600 text-lg leading-relaxed">
              {about.bio}
            </p>
          </div>

          {/* 3. LAYOUT (SKILLS & TOOLS) */}
          <div className="w-full border-t border-slate-200/60 pt-6 mt-2">
            <div className="flex flex-col gap-8 w-full"> 
              <Skills items={skillsTools.skills} />
              <Tools items={skillsTools.tools} />
            </div>
          </div>

        </motion.div>
      </div>
    </section>
  )
}