'use client'
import React from 'react'
import { motion, Variants } from 'framer-motion'

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

interface FrameworksProps {
  items: string[]
}

export default function Frameworks({ items }: FrameworksProps) {
  // If there are no items, we can optionally hide the section or show an empty state.
  if (!items || items.length === 0) return null;

  return (
    <div>
      <h4 className="text-xl font-bold mb-4">Frameworks &amp; Libraries</h4>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-wrap gap-2.5"
      >
        {items.map((framework) => (
          <motion.span
            key={framework}
            variants={item}
            className="
              px-3.5 py-1.5
              text-base
              font-medium
              rounded-full
              border border-white/10
              bg-white/5
              text-slate-600
              dark:text-slate-300
            "
          >
            {framework}
          </motion.span>
        ))}
      </motion.div>
    </div>
  )
}
