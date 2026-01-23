'use client'
import React from 'react'
import { motion } from 'framer-motion'
import Skills from './Skills'
import Tools from './Tools'

export default function About() {
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
              src="/mukagw.jpeg"
              alt="Avatar Lifkie Lie"
              className="w-28 h-28 rounded-full object-cover border border-white/20"
            />
            <div className="flex flex-col items-start gap-2">
              <div className="text-sm text-slate-600">Based in Indonesia</div>
              
              {/* TOMBOL DOWNLOAD RESUME */}
              <a
                href="/Lifkie-Lie-Resume.pdf"
                download
                className="
                  /* BENTUK & UKURAN (TETAP KECIL & KOTAK SEPERTI ASLINYA) */
                  px-4 py-2 
                  rounded-lg 
                  text-sm
                  font-bold
                  border-2
                  transition-colors

                  /* WARNA (DIAMBIL PERSIS DARI CONTACT ME) */
                  /* Light Mode */
                  border-slate-200 
                  text-slate-700 
                  hover:bg-slate-50 
                  
                  /* Dark Mode (Ini yang kemarin kurang, makanya warnanya beda) */
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
             Computer Science student with hands on experience in full stack web development and real world system
            deployment. Experienced in building backend driven applications, managing databases, and working on production
            oriented projects. Interested in cloud based systems and exploring applications of AI and machine learning in real world
            products
            </p>
          </div>

          {/* 3. LAYOUT (SKILLS & TOOLS) */}
          <div className="w-full border-t border-slate-200/60 pt-6 mt-2">
            <div className="flex flex-col gap-8 w-full"> 
              <Skills />
              <Tools />
            </div>
          </div>

        </motion.div>
      </div>
    </section>
  )
}