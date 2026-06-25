'use client'
import React, { useState } from 'react'

export default function Contact() {
  const [status, setStatus] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    // 1. Simpan referensi form sebelum proses async (PENTING)
    const formElement = e.currentTarget
    
    setIsSubmitting(true)
    setStatus('Sending...')

    const formData = new FormData(formElement)
    const body = Object.fromEntries(formData.entries())

    try {
      const res = await fetch('/api/contact', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body) 
      })
      
      // Cek apakah server memberikan respon JSON yang valid
      let data;
      try {
        data = await res.json()
      } catch (jsonError) {
        // Jika server tidak membalas JSON, abaikan error parsing
        data = {} 
      }

      if (res.ok) {
        setStatus('Sent — thank you!')
        // 2. Gunakan referensi form yang sudah disimpan tadi untuk reset
        formElement.reset() 
      } else {
        // Tampilkan pesan error dari server jika ada
        setStatus(data.error || 'Error sending message.')
      }
    } catch (err) { 
      console.error('Frontend Error:', err) // Cek Inspect > Console jika error lagi
      setStatus('Error connecting to server.') 
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contact" className="section-pad">
      <div className="max-w-4xl mx-auto px-6">
        <h3 className="text-2xl font-semibold mb-4 theme-text">Contact Me</h3>
        <div className="glass card-soft p-6">
          
          {/* Tambahkan method="post" agar semantik form benar */}
          <form onSubmit={handleSubmit} method="post" className="grid gap-4">
            
            <input
              name="name"
              type="text"
              required
              placeholder="Your name"
              className="p-3 rounded-md border border-slate-300 dark:border-white/20 bg-white/50 dark:bg-black/20 theme-text focus:outline-none focus:ring-2 focus:ring-slate-500"
            />

            <input
              name="email"
              type="email"
              required
              placeholder="you@email.com"
              className="p-3 rounded-md border border-slate-300 dark:border-white/20 bg-white/50 dark:bg-black/20 theme-text focus:outline-none focus:ring-2 focus:ring-slate-500"
            />

            <textarea
              name="message"
              required
              placeholder="Your message..."
              className="p-3 rounded-md h-32 border border-slate-300 dark:border-white/20 bg-white/50 dark:bg-black/20 theme-text focus:outline-none focus:ring-2 focus:ring-slate-500"
            />

            <div className="flex items-center justify-between mt-2">
              <button 
                type="submit" // Pastikan type submit
                disabled={isSubmitting}
                className="px-6 py-2 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:opacity-90 transition disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
              
              <div className="text-sm font-medium theme-text-muted">
                {status}
              </div>
            </div>

          </form>
        </div>
      </div>
    </section>
  )
}