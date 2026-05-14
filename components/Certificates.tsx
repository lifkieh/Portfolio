'use client'
import React from 'react'
import CertificateCard from './CertificateCard'
import type { Certificate } from '@/data/projects'

interface CertificatesProps {
  certificates: Certificate[]
}

export default function Certificates({ certificates }: CertificatesProps) {
  if (certificates.length === 0) return null

  return (
    <section id="certificates" className="section-pad">
      <div className="max-w-6xl mx-auto px-6">
        <h3 className="text-2xl font-semibold mb-6 text-center text-slate-900 dark:text-white">
          Certificates
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <CertificateCard key={cert.id} certificate={cert} />
          ))}
        </div>
      </div>
    </section>
  )
}
