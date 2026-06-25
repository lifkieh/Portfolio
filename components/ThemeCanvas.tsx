'use client'

import React, { useEffect, useRef } from 'react'

type ThemeType = 'none' | 'astro' | 'game' | 'cyberpunk' | 'undersea'

export default function ThemeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const themeRef = useRef<ThemeType>('none')
  const reqRef = useRef<number>(0)

  // Mouse position for parallax
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = (e.clientX / window.innerWidth - 0.5) * 2
      mouseRef.current.targetY = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let width = window.innerWidth
    let height = window.innerHeight

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * window.devicePixelRatio
      canvas.height = height * window.devicePixelRatio
      // reset transform dulu supaya scale tidak menumpuk tiap resize
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    window.addEventListener('resize', resize)
    resize()

    // Astro State
    const astroStars = Array.from({ length: 200 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random(), // 0 to 1
      phase: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.01 + Math.random() * 0.02,
    }))
    let shootingStar = { active: false, x: 0, y: 0, length: 0, life: 0, maxLife: 0 }

    // Game State
    const gameParticles = Array.from({ length: 60 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.floor(Math.random() * 3) + 1,
      speed: 0.3 + Math.random() * 0.5,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.02 + Math.random() * 0.03,
      color: ['#4ade80', '#22c55e', '#86efac'][Math.floor(Math.random() * 3)],
      opacity: 0,
    }))
    let gameGlitch = { active: false, timer: 0 }

    // Cyberpunk State
    const chars = "0123456789ＡＢＣＤＥＦ¥$€₿×÷±∞◆◇▲△○●"
    const cyberCols = 50
    const cyberDrops = Array.from({ length: cyberCols }).map((_, i) => ({
      x: (i / cyberCols) * width,
      y: Math.random() * height * -1,
      speed: 1.5 + Math.random() * 1.5,
      chars: Array.from({ length: 12 }).map(() => chars[Math.floor(Math.random() * chars.length)]),
      headChangeTimer: 0,
    }))
    let cyberLines: any[] = []

    // Undersea State
    const underseaBubbles = Array.from({ length: 60 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 4 + 1,
      speed: 0.5 + Math.random() * 1.5,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.01 + Math.random() * 0.02,
    }))
    const underseaRays = Array.from({ length: 6 }).map(() => ({
      x: Math.random() * width,
      width: 150 + Math.random() * 250,
      angle: (Math.random() - 0.5) * 0.3,
      opacity: 0.03 + Math.random() * 0.08,
      pulsePhase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.005 + Math.random() * 0.015,
    }))

    const loop = () => {
      ctx.clearRect(0, 0, width, height)

      // Mouse smoothing
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05

      const theme = themeRef.current

      if (theme === 'astro') {
        ctx.fillStyle = '#ffffff'
        astroStars.forEach((s) => {
          const depth = s.z
          const r = depth < 0.33 ? 0.7 : depth < 0.66 ? 1.2 : 2.0
          const baseOpacity = depth < 0.33 ? 0.4 : depth < 0.66 ? 0.6 : 0.9
          const drift = depth < 0.33 ? 0.05 : depth < 0.66 ? 0.1 : 0.2

          s.y += drift
          if (s.y > height) {
            s.y = 0
            s.x = Math.random() * width
          }
          s.phase += s.twinkleSpeed

          const opacity = baseOpacity * (0.5 + 0.5 * Math.sin(s.phase))

          const px = s.x - mouseRef.current.x * (depth * 20)
          const py = s.y - mouseRef.current.y * (depth * 20)

          ctx.globalAlpha = opacity
          ctx.beginPath()
          ctx.arc(px, py, r, 0, Math.PI * 2)
          ctx.fill()
        })

        // Shooting Star
        if (!shootingStar.active && Math.random() < 0.002) {
          shootingStar = {
            active: true,
            x: Math.random() * width * 0.8 + width * 0.2,
            y: 0,
            length: 80 + Math.random() * 70,
            life: 0,
            maxLife: 60 + Math.random() * 30,
          }
        }
        if (shootingStar.active) {
          shootingStar.life++
          shootingStar.x -= 4
          shootingStar.y += 4

          const progress = shootingStar.life / shootingStar.maxLife
          ctx.globalAlpha = 1 - progress
          const grad = ctx.createLinearGradient(
            shootingStar.x,
            shootingStar.y,
            shootingStar.x + shootingStar.length,
            shootingStar.y - shootingStar.length
          )
          grad.addColorStop(0, 'rgba(255,255,255,1)')
          grad.addColorStop(1, 'rgba(255,255,255,0)')

          ctx.strokeStyle = grad
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.moveTo(shootingStar.x, shootingStar.y)
          ctx.lineTo(shootingStar.x + shootingStar.length, shootingStar.y - shootingStar.length)
          ctx.stroke()

          if (shootingStar.life >= shootingStar.maxLife) shootingStar.active = false
        }
        ctx.globalAlpha = 1
      } else if (theme === 'game') {
        gameParticles.forEach((p) => {
          p.y -= p.speed
          p.sway += p.swaySpeed
          const px = p.x + Math.sin(p.sway) * 1.5

          if (p.y < 0) {
            p.y = height + 10
            p.x = Math.random() * width
            p.opacity = 0
          } else if (p.y > height - 50) {
            p.opacity += 0.02
          } else if (p.y < 50) {
            p.opacity -= 0.02
          } else {
            p.opacity = Math.min(0.6, p.opacity + 0.02)
          }

          ctx.globalAlpha = Math.max(0, p.opacity)
          ctx.fillStyle = p.color
          ctx.fillRect(px, p.y, p.size, p.size)
        })
        ctx.globalAlpha = 1

        // Glitch
        if (gameGlitch.active) {
          gameGlitch.timer--
          if (gameGlitch.timer <= 0) gameGlitch.active = false
          if (gameGlitch.timer % 3 === 0) {
            ctx.fillStyle = 'rgba(74,222,128,0.1)'
            ctx.fillRect(
              Math.random() * width,
              Math.random() * height,
              Math.random() * 200 + 50,
              Math.random() * 10 + 2
            )
          }
        } else if (Math.random() < 0.003) {
          gameGlitch = { active: true, timer: 15 }
        }

        // Corners HUD
        ctx.strokeStyle = 'rgba(74,222,128,0.4)'
        ctx.lineWidth = 2
        const s = 20
        const m = 20
        ctx.beginPath(); ctx.moveTo(m, m + s); ctx.lineTo(m, m); ctx.lineTo(m + s, m); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(width - m - s, m); ctx.lineTo(width - m, m); ctx.lineTo(width - m, m + s); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(m, height - m - s); ctx.lineTo(m, height - m); ctx.lineTo(m + s, height - m); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(width - m - s, height - m); ctx.lineTo(width - m, height - m); ctx.lineTo(width - m, height - m - s); ctx.stroke()
      } else if (theme === 'cyberpunk') {
        ctx.font = '14px monospace'

        // Matrix Rain
        cyberDrops.forEach((drop, i) => {
          drop.y += drop.speed
          if (drop.y > height + 200) {
            drop.y = -100
            drop.x = (i / cyberCols) * width
          }
          drop.headChangeTimer++
          if (drop.headChangeTimer > 4) {
            drop.headChangeTimer = 0
            drop.chars.unshift(chars[Math.floor(Math.random() * chars.length)])
            drop.chars.pop()
          }

          drop.chars.forEach((char, j) => {
            const py = drop.y - j * 16
            if (py < -20 || py > height + 20) return

            if (j === 0) {
              ctx.fillStyle = 'rgba(249, 168, 212, 0.9)' // head
            } else {
              const alpha = Math.max(0, 0.6 - j * 0.05)
              ctx.fillStyle = `rgba(236, 72, 153, ${alpha})`
            }
            ctx.fillText(char, drop.x, py)
          })
        })

        // Neon Lines
        if (Math.random() < 0.01 && cyberLines.length < 3) {
          cyberLines.push({
            y: Math.random() * height,
            w: 100 + Math.random() * 300,
            x: Math.random() * width,
            life: 0,
            maxLife: 30 + Math.random() * 60,
            color: Math.random() > 0.5 ? 'rgba(247, 37, 133, ' : 'rgba(76, 201, 240, ',
          })
        }

        cyberLines = cyberLines.filter((line) => {
          line.life++
          const progress = line.life / line.maxLife
          const alpha = progress < 0.5 ? progress * 1.2 : (1 - progress) * 1.2

          ctx.shadowBlur = 8
          ctx.shadowColor = line.color + '1)'
          ctx.fillStyle = line.color + alpha + ')'
          ctx.fillRect(line.x, line.y, line.w, 2)
          ctx.shadowBlur = 0

          return line.life < line.maxLife
        })
      } else if (theme === 'undersea') {
        // Draw Light Rays
        underseaRays.forEach((ray) => {
          ray.pulsePhase += ray.pulseSpeed
          const currentOpacity = ray.opacity * (0.5 + 0.5 * Math.sin(ray.pulsePhase))

          ctx.save()
          ctx.translate(ray.x, 0)
          ctx.rotate(ray.angle)

          const grad = ctx.createLinearGradient(0, 0, 0, height * 0.8)
          grad.addColorStop(0, `rgba(186, 230, 253, ${currentOpacity})`)
          grad.addColorStop(1, 'rgba(186, 230, 253, 0)')

          ctx.fillStyle = grad
          ctx.beginPath()
          ctx.moveTo(-ray.width / 2, 0)
          ctx.lineTo(ray.width / 2, 0)
          ctx.lineTo(ray.width, height)
          ctx.lineTo(-ray.width, height)
          ctx.fill()
          ctx.restore()
        })

        // Draw Bubbles
        underseaBubbles.forEach((b) => {
          b.y -= b.speed
          b.sway += b.swaySpeed
          const px = b.x + Math.sin(b.sway) * 20

          if (b.y < -20) {
            b.y = height + 20
            b.x = Math.random() * width
          }

          ctx.beginPath()
          ctx.arc(px, b.y, b.size, 0, Math.PI * 2)
          ctx.strokeStyle = 'rgba(186, 230, 253, 0.4)'
          ctx.fillStyle = 'rgba(186, 230, 253, 0.1)'
          ctx.lineWidth = 1
          ctx.fill()
          ctx.stroke()

          // Bubble highlight
          ctx.beginPath()
          ctx.arc(px - b.size * 0.3, b.y - b.size * 0.3, b.size * 0.2, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
          ctx.fill()
        })
      }

      reqRef.current = requestAnimationFrame(loop)
    }

    reqRef.current = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(reqRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  useEffect(() => {
    const checkTheme = () => {
      const cls = document.documentElement.className
      if (cls.includes('theme-astro')) themeRef.current = 'astro'
      else if (cls.includes('theme-game')) themeRef.current = 'game'
      else if (cls.includes('theme-cyberpunk')) themeRef.current = 'cyberpunk'
      else if (cls.includes('theme-undersea')) themeRef.current = 'undersea'
      else themeRef.current = 'none'
    }

    checkTheme()

    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    return () => observer.disconnect()
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  )
}