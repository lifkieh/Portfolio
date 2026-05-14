'use client'
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Certificate } from '@/data/projects'
import { X, ExternalLink, Award } from 'lucide-react'

interface CertificateCardProps {
  certificate: Certificate
}

export default function CertificateCard({ certificate }: CertificateCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <motion.article
        whileHover={{ y: -8, scale: 1.01 }}
        className="glass card-soft flex flex-col h-full p-5 relative cursor-pointer group"
        onClick={() => { if (certificate.img) setIsModalOpen(true) }}
      >
        {/* IMAGE/FILE PREVIEW */}
        <div className="w-full h-44 overflow-hidden rounded-xl mb-4 bg-gray-100 dark:bg-slate-800 relative group-hover:brightness-110 transition-all">
          {certificate.img ? (
            certificate.img.toLowerCase().endsWith('.pdf') ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-200 dark:bg-slate-700">
                <Award size={48} className="text-pink-500 mb-2" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">View PDF</span>
              </div>
            ) : (
              <img
                src={certificate.img}
                alt={certificate.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Award size={48} className="text-slate-300 dark:text-slate-600" />
            </div>
          )}
          {/* Date Badge */}
          <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-xs font-bold text-white border border-white/10">
            {certificate.date}
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-grow">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-white leading-tight">
            {certificate.title}
          </h4>
          <p className="text-pink-600 dark:text-pink-400 text-sm font-semibold mt-1">
            {certificate.platform}
          </p>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm leading-relaxed line-clamp-2">
            {certificate.description}
          </p>
        </div>

        {/* FOOTER */}
        <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-white/5 items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Award size={14} /> Certificate
          </span>
          {certificate.credentialUrl && (
            <a
              href={certificate.credentialUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-pink-600 dark:text-pink-400 font-semibold text-sm hover:underline flex items-center gap-1"
            >
              Verify <ExternalLink size={12} />
            </a>
          )}
        </div>
      </motion.article>

      {/* MODAL FULL IMAGE */}
      <AnimatePresence>
        {isModalOpen && certificate.img && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 z-[100]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm cursor-zoom-out"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-5xl max-h-[90vh] flex justify-center items-center pointer-events-none"
            >
              {certificate.img.toLowerCase().endsWith('.pdf') ? (
                <div className="bg-slate-800 p-12 rounded-3xl flex flex-col items-center justify-center text-center max-w-md w-full shadow-2xl pointer-events-auto">
                  <Award size={64} className="text-pink-500 mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-4">{certificate.title}</h3>
                  <a href={certificate.img} target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-pink-600 hover:bg-pink-500 text-white rounded-xl font-bold shadow-lg transition text-lg">
                    Open PDF Document
                  </a>
                </div>
              ) : (
                <img
                  src={certificate.img}
                  alt={certificate.title}
                  className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl pointer-events-auto"
                />
              )}
              
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-0 right-0 sm:-top-12 sm:right-0 p-2 sm:p-3 rounded-full bg-black/50 sm:bg-white/10 hover:bg-white/20 text-white transition pointer-events-auto m-4 sm:m-0"
              >
                <X size={24} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
