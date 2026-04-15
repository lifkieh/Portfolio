'use client'
import React from 'react'
import { motion, Variants } from 'framer-motion'

const toolsList = [
  'Git', 'GitHub', 'Vercel', 'Firebase', 'MySQL', 
  , 'VS Code', 'Android Studio', 'UNITY',
]

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const item: Variants = {
  hidden: { opacity: 0, y: 4 },
  show: { opacity: 1, y: 0 },
}

export default function Tools() {
  return (
    <div>
      {/* Header diperbesar: text-sm -> text-xl */}
      <h4 className="text-xl font-bold mb-4">Tools & Platforms</h4>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-wrap gap-2.5"
      >
        {toolsList.map((tool) => (
          <motion.span
            key={tool}
            variants={item}
            className="
              px-3.5 py-1.5
              text-base
              font-medium
              rounded-full
              border border-white/10
              bg-white/5
              text-slate-600
            "
             // Perubahan CSS:
            // 1. px-2.5 py-1 -> px-3.5 py-1.5
            // 2. text-xs -> text-base
          >
            {tool}
          </motion.span>
        ))}
      </motion.div>
    </div>
  )
}