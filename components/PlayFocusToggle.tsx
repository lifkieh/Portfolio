'use client'

import { useEffect, useState } from 'react'

export default function PlayFocusToggle() {
  const [activeTheme, setActiveTheme] = useState(false)
  const [focused, setFocused] = useState(false)

  // Deteksi apakah tema ghibli / undersea sedang aktif
  useEffect(() => {
    const check = () => {
      const cls = document.documentElement.className
      const isPlayTheme = cls.includes('theme-ghibli') || cls.includes('theme-undersea')
      setActiveTheme(isPlayTheme)
      // Kalau pindah ke tema lain, pastikan focus mode dimatikan
      if (!isPlayTheme) {
        document.documentElement.classList.remove('play-focus')
        setFocused(false)
      }
    }
    check()
    const obs = new MutationObserver(check)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  // Sinkronkan state -> class di <html>
  useEffect(() => {
    if (focused) document.documentElement.classList.add('play-focus')
    else document.documentElement.classList.remove('play-focus')
  }, [focused])

  // Bersihkan saat unmount
  useEffect(() => {
    return () => document.documentElement.classList.remove('play-focus')
  }, [])

  if (!activeTheme) return null

  return (
    <button
      className="play-focus-toggle"
      onClick={() => setFocused((v) => !v)}
      aria-pressed={focused}
      title={focused ? 'Tampilkan kembali semua konten' : 'Sembunyikan konten & fokus bermain'}
    >
      {focused ? '◱ Show Content' : '✦ Play Mode'}
    </button>
  )
}
