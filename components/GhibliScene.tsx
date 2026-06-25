'use client'

import React, { useEffect, useRef, useState } from 'react'

export default function GhibliScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const reqRef = useRef<number>(0)

  const [isActiveTheme, setIsActiveTheme] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [scoreDisplay, setScoreDisplay] = useState(0)

  const pointerRef = useRef({ x: 0, y: 0, isDown: false, lastClickX: 0, lastClickY: 0, clicked: false })
  const scoreRef = useRef(0)
  const lastRenderedScoreRef = useRef(-1)
  const maxScore = 100

  // Detect ghibli theme on <html>
  useEffect(() => {
    const checkTheme = () => {
      const cls = document.documentElement.className
      setIsActiveTheme(cls.includes('theme-ghibli'))
    }
    checkTheme()
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  // Fade out when hero is scrolled past
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.15 }
    )
    const hero =
      document.querySelector('#hero') ||
      document.querySelector('header') ||
      document.querySelector('main')
    if (hero) observer.observe(hero)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isActiveTheme) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    // FIX: jangan biarkan width/height jadi 0 -> mencegah NaN/Infinity di Canvas
    let width = Math.max(window.innerWidth, 1)
    let height = Math.max(window.innerHeight, 1)
    let isMobile = width < 768
    const seaStartXFrac = 0.42
    const horizonY = () => height * 0.55
    let frameCount = 0

    // ---------- Types ----------
    type SkyObjectType = 'cloud' | 'dragon' | 'balloon' | 'bird' | 'phoenix' | 'eagle' | 'hawk'
    interface SkyObject {
      id: number; type: SkyObjectType
      x: number; y: number; w: number; h: number
      vx: number; vy: number; scale: number; phase: number
      color: string; alive: boolean; deathTimer: number
    }
    let skyObjects: SkyObject[] = []
    let objectIdCounter = 0

    interface Bullet { x: number; y: number; vx: number; vy: number; alive: boolean }
    let bullets: Bullet[] = []

    interface Particle { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number; color: string }
    let particles: Particle[] = []

    type SeaType = 'fish' | 'dolphin' | 'kraken' | 'brontosaurus' | 'whale' | 'siren'
    interface SeaCreature {
      type: SeaType; x: number; baseY: number; phase: number; speed: number
      jumpH: number; dir: 1 | -1; active: boolean; behavior: 'swim' | 'rise'; swimPhase: number
    }
    let seaCreatures: SeaCreature[] = []

    type AnimalType = 'horse' | 'rabbit' | 'sheep'
    interface GroundAnimal { type: AnimalType; x: number; y: number; idlePhase: number }
    let animals: GroundAnimal[] = []
    interface Family { x: number; y: number; h: number; color: string; bob: number }
    let family: Family[] = []

    // ---------- Helpers ----------
    const seaBounds = () => {
      const x0 = width * seaStartXFrac
      const yTop = horizonY()
      return { x0, x1: width, yTop, yBot: height }
    }

    const groundYAt = (x: number) => {
      const cliffStartDrop = width * 0.38
      const cliffEndDrop = width * 0.42
      const topPlateauHeight = height * 0.38
      if (x < cliffStartDrop) {
        return topPlateauHeight - Math.sin((x / width) * Math.PI * 3) * 15
      } else if (x <= cliffEndDrop) {
        const t = (x - cliffStartDrop) / (cliffEndDrop - cliffStartDrop)
        return topPlateauHeight + Math.pow(t, 2.5) * (height - topPlateauHeight)
      } else {
        return height
      }
    }

    const hexToRgb = (hex: string) =>
      `${parseInt(hex.slice(1, 3), 16)},${parseInt(hex.slice(3, 5), 16)},${parseInt(hex.slice(5, 7), 16)}`

    const interpolateColor = (c1: string, c2: string, f: number) => {
      const h2 = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]
      const a = h2(c1), b = h2(c2)
      return `rgb(${Math.round(a[0] + f * (b[0] - a[0]))},${Math.round(a[1] + f * (b[1] - a[1]))},${Math.round(a[2] + f * (b[2] - a[2]))})`
    }

    // ---------- Crosshair ----------
    const drawCrosshair = () => {
      const { x, y } = pointerRef.current
      if (x === 0 && y === 0) return
      const pulse = 1 + Math.sin(frameCount * 0.15) * 0.08
      ctx.save()
      ctx.translate(x, y)
      ctx.scale(pulse, pulse)
      ctx.strokeStyle = 'rgba(255,80,80,0.95)'
      ctx.lineWidth = 2
      ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.stroke()
      ctx.strokeStyle = 'rgba(255,255,255,0.85)'
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.stroke()
      ctx.strokeStyle = 'rgba(255,80,80,0.95)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(-20, 0); ctx.lineTo(-9, 0)
      ctx.moveTo(9, 0); ctx.lineTo(20, 0)
      ctx.moveTo(0, -20); ctx.lineTo(0, -9)
      ctx.moveTo(0, 9); ctx.lineTo(0, 20)
      ctx.stroke()
      ctx.fillStyle = 'rgba(255,255,255,0.95)'
      ctx.beginPath(); ctx.arc(0, 0, 1.6, 0, Math.PI * 2); ctx.fill()
      ctx.restore()
    }

    // ---------- Init ----------
    const initActors = () => {
      animals = []
      family = []
      const hx = width * 0.18
      const fcolors = ['#e76f51', '#2a9d8f', '#e9c46a', '#264653']
      const heights = [42, 36, 28, 24]
      for (let i = 0; i < 4; i++) {
        const x = hx + 40 + i * 26
        family.push({ x, y: groundYAt(x), h: heights[i], color: fcolors[i], bob: Math.random() * Math.PI * 2 })
      }
      const aTypes: AnimalType[] = ['horse', 'sheep', 'rabbit', 'sheep']
      for (let i = 0; i < aTypes.length; i++) {
        const x = width * 0.05 + i * (width * 0.085)
        animals.push({ type: aTypes[i], x, y: groundYAt(x), idlePhase: Math.random() * Math.PI * 2 })
      }
    }

    // ---------- Spawn ----------
    const colorFor = (type: SkyObjectType) => {
      switch (type) {
        case 'dragon': return '#e63946'
        case 'phoenix': return '#ff9e00'
        case 'eagle': return '#6b4f3a'
        case 'hawk': return '#8d6e63'
        case 'balloon': return ['#ef476f', '#06d6a0', '#118ab2', '#ffd166'][Math.floor(Math.random() * 4)]
        case 'bird': return '#33373a'
        default: return '#ffffff'
      }
    }

    const spawnSkyObject = () => {
      if (skyObjects.filter(o => o.alive).length > (isMobile ? 5 : 10)) return
      const types: SkyObjectType[] = ['cloud', 'cloud', 'dragon', 'balloon', 'bird', 'bird', 'phoenix', 'eagle', 'hawk']
      const type = types[Math.floor(Math.random() * types.length)]
      const dir = Math.random() > 0.5 ? 1 : -1
      const x = dir === 1 ? -100 : width + 100
      const y = 40 + Math.random() * (height * 0.55)
      let scale = 0.6 + Math.random() * 0.6
      let vx = (0.2 + Math.random() * 0.4) * dir
      if (type === 'cloud') { vx = 0.3; scale = 1.2 }
      if (type === 'balloon') { vx *= 0.5 }
      if (type === 'dragon' || type === 'phoenix') { scale *= 1.1 }
      skyObjects.push({
        id: objectIdCounter++, type, x, y,
        w: 38 * scale, h: 26 * scale,
        vx, vy: 0, scale, phase: Math.random() * Math.PI * 2,
        color: colorFor(type), alive: true, deathTimer: 0,
      })
    }

    const spawnSea = (type: SeaType) => {
      const { x0, x1, yTop, yBot } = seaBounds()
      const dir: 1 | -1 = Math.random() > 0.5 ? 1 : -1
      const behavior: 'swim' | 'rise' = ['kraken', 'brontosaurus', 'siren', 'whale'].includes(type) ? 'rise' : 'swim'
      let x = 0
      let baseY = yTop + 30 + Math.random() * (yBot - yTop - 60)
      if (behavior === 'swim') {
        x = dir === 1 ? x0 - 20 : x1 + 20
      } else {
        x = x0 + 40 + Math.random() * (x1 - x0 - 80)
        baseY = yTop + 20 + Math.random() * (yBot - yTop - 40)
      }
      const cfg: Record<SeaType, { speed: number; jumpH: number }> = {
        fish: { speed: 1.5, jumpH: 30 },
        dolphin: { speed: 2.0, jumpH: 80 },
        whale: { speed: 0.4, jumpH: 120 },
        kraken: { speed: 0.3, jumpH: 100 },
        brontosaurus: { speed: 0.2, jumpH: 160 },
        siren: { speed: 0.5, jumpH: 80 },
      }
      seaCreatures.push({
        type, x, baseY, phase: 0,
        speed: cfg[type].speed * (0.8 + Math.random() * 0.5),
        jumpH: cfg[type].jumpH, dir, active: true,
        behavior, swimPhase: 0
      })
    }

    // ---------- Shooting ----------
    const sniperPos = () => ({ x: width * 0.18 + 28, y: groundYAt(width * 0.18 + 28) - 78 })

    const fireBullet = (targetX: number, targetY: number) => {
      const scrollY = window.scrollY || 0
      const l2Y = height - scrollY * 1.5
      const s = sniperPos()
      const visualSy = s.y + l2Y
      const angle = Math.atan2(targetY - visualSy, targetX - s.x)
      const speed = 16
      bullets.push({
        x: s.x + Math.cos(angle) * 26,
        y: visualSy + Math.sin(angle) * 26,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alive: true
      })
    }

    const createExplosion = (x: number, y: number, color: string) => {
      for (let i = 0; i < 14; i++) {
        const a = (Math.PI * 2 * i) / 14
        particles.push({ x, y, vx: Math.cos(a) * (1 + Math.random() * 3), vy: Math.sin(a) * (1 + Math.random() * 3), life: 0, maxLife: 24 + Math.random() * 14, size: 2 + Math.random() * 3, color })
      }
    }

    const splash = (x: number, y: number) => {
      for (let i = 0; i < 10; i++) {
        particles.push({ x, y, vx: (Math.random() - 0.5) * 3, vy: -Math.random() * 4 - 1, life: 0, maxLife: 22 + Math.random() * 12, size: 1.5 + Math.random() * 2.5, color: 'rgba(200,235,255,0.9)' })
      }
    }

    // ---------- Events ----------
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement | null
      if (target && target.closest('a, button, input, textarea, select, [role="button"]')) return
      let clientX, clientY
      if ('touches' in e) { clientX = e.touches[0].clientX; clientY = e.touches[0].clientY }
      else { clientX = (e as MouseEvent).clientX; clientY = (e as MouseEvent).clientY }
      pointerRef.current.isDown = true
      pointerRef.current.lastClickX = clientX
      pointerRef.current.lastClickY = clientY
      pointerRef.current.clicked = true
      pointerRef.current.x = clientX
      pointerRef.current.y = clientY
      fireBullet(clientX, clientY)
    }

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if ('touches' in e) return
      pointerRef.current.x = (e as MouseEvent).clientX
      pointerRef.current.y = (e as MouseEvent).clientY
    }

    window.addEventListener('mousedown', handlePointerDown)
    window.addEventListener('touchstart', handlePointerDown, { passive: true })
    window.addEventListener('mousemove', handlePointerMove)

    // ---------- Stars (cached) ----------
    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random(), y: Math.random() * 0.55, r: Math.random() * 1.4 + 0.3
    }))

    // ===================== DRAW LAYER 1 — SKY =====================
    const drawSky = (progress: number) => {
      const top = progress < 0.5
        ? interpolateColor('#74c0ec', '#ff7e5f', progress * 2)
        : interpolateColor('#ff7e5f', '#0f1024', (progress - 0.5) * 2)
      const bot = progress < 0.5
        ? interpolateColor('#dff3ff', '#feb47b', progress * 2)
        : interpolateColor('#feb47b', '#1a1a2e', (progress - 0.5) * 2)
      const grad = ctx.createLinearGradient(0, 0, 0, height)
      grad.addColorStop(0, top)
      grad.addColorStop(1, bot)
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, width, height)
      const sa = Math.max(0, (progress - 0.45) * 1.8)
      if (sa > 0) {
        ctx.fillStyle = `rgba(255,255,255,${sa})`
        stars.forEach(s => { ctx.beginPath(); ctx.arc(s.x * width, s.y * height, s.r, 0, Math.PI * 2); ctx.fill() })
      }
      const sunX = width * 0.65
      const sunY = 110 + progress * 80
      if (progress < 0.55) {
        const r = 55
        const glow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, r * 2.4)
        glow.addColorStop(0, `rgba(255,245,200,${0.9 - progress})`)
        glow.addColorStop(1, 'rgba(255,245,200,0)')
        ctx.fillStyle = glow
        ctx.beginPath(); ctx.arc(sunX, sunY, r * 2.4, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = '#fff4c2'
        ctx.beginPath(); ctx.arc(sunX, sunY, r, 0, Math.PI * 2); ctx.fill()
      } else {
        ctx.fillStyle = '#f3f3e0'
        ctx.beginPath(); ctx.arc(sunX, sunY, 44, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = top
        ctx.beginPath(); ctx.arc(sunX + 16, sunY - 8, 40, 0, Math.PI * 2); ctx.fill()
      }
    }

    const drawCloudShape = (x: number, y: number, s: number, alpha: number) => {
      ctx.fillStyle = `rgba(255,255,255,${alpha})`
      ctx.beginPath()
      ctx.arc(x, y, 18 * s, 0, Math.PI * 2)
      ctx.arc(x + 18 * s, y - 8 * s, 24 * s, 0, Math.PI * 2)
      ctx.arc(x + 38 * s, y, 18 * s, 0, Math.PI * 2)
      ctx.arc(x + 18 * s, y + 6 * s, 16 * s, 0, Math.PI * 2)
      ctx.fill()
    }

    const drawSkyObject = (obj: SkyObject) => {
      ctx.save()
      ctx.translate(obj.x, obj.y)
      ctx.scale(obj.scale * (obj.vx > 0 ? 1 : -1), obj.scale)
      if (!obj.alive) {
        ctx.globalAlpha = 1 - obj.deathTimer / 20
        ctx.fillStyle = '#ffb703'
        ctx.beginPath(); ctx.arc(0, 0, 18 + obj.deathTimer * 2, 0, Math.PI * 2); ctx.fill()
        ctx.restore(); return
      }
      const flap = Math.sin(obj.phase) * 8
      switch (obj.type) {
        case 'cloud':
          ctx.restore(); drawCloudShape(obj.x, obj.y, obj.scale, 0.85); return
        case 'bird':
          ctx.strokeStyle = obj.color; ctx.lineWidth = 2; ctx.beginPath()
          ctx.moveTo(-12, 0); ctx.quadraticCurveTo(0, -flap - 4, 12, 0); ctx.stroke(); break
        case 'eagle':
        case 'hawk':
          ctx.fillStyle = obj.color
          ctx.beginPath()
          ctx.moveTo(-22, 0); ctx.quadraticCurveTo(-6, -flap - 6, 0, 0)
          ctx.quadraticCurveTo(6, -flap - 6, 22, 0)
          ctx.quadraticCurveTo(0, 6, -22, 0); ctx.fill()
          ctx.fillRect(-2, -2, 6, 4); break
        case 'balloon':
          ctx.fillStyle = obj.color
          ctx.beginPath(); ctx.arc(0, -14, 16, 0, Math.PI * 2); ctx.fill()
          ctx.strokeStyle = 'rgba(80,60,40,0.8)'; ctx.lineWidth = 1
          ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(-5, 12); ctx.moveTo(8, 0); ctx.lineTo(5, 12); ctx.stroke()
          ctx.fillStyle = '#8d6e63'; ctx.fillRect(-6, 12, 12, 8); break
        case 'dragon':
          ctx.fillStyle = obj.color
          ctx.beginPath()
          ctx.moveTo(-26, 0)
          ctx.quadraticCurveTo(-10, -10 - flap, 6, 0)
          ctx.quadraticCurveTo(18, 8, 28, 2)
          ctx.quadraticCurveTo(16, 12, 6, 8)
          ctx.quadraticCurveTo(-10, 12, -26, 0); ctx.fill()
          ctx.fillStyle = '#c1121f'
          ctx.beginPath(); ctx.moveTo(-2, -2); ctx.lineTo(-14, -18 - flap); ctx.lineTo(2, -4); ctx.fill(); break
        case 'phoenix':
          ctx.fillStyle = obj.color
          ctx.beginPath()
          ctx.moveTo(-20, 0); ctx.quadraticCurveTo(0, -10 - flap, 16, 0)
          ctx.quadraticCurveTo(0, 6, -20, 0); ctx.fill()
          ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 3
          ctx.beginPath()
          ctx.moveTo(-18, 0); ctx.quadraticCurveTo(-34, 6, -44, -4); ctx.stroke(); break
      }
      ctx.restore()
    }

    // ===================== DRAW LAYER 2 — SEA =====================
    const drawSea = (progress: number) => {
      const { x0, yTop } = seaBounds()
      const night = 1 - progress * 0.55
      const grad = ctx.createLinearGradient(0, yTop, 0, height)
      grad.addColorStop(0, `rgba(${Math.round(120 * night)},${Math.round(200 * night)},${Math.round(215 * night)},1)`)
      grad.addColorStop(1, `rgba(${Math.round(40 * night)},${Math.round(120 * night)},${Math.round(160 * night)},1)`)
      ctx.save()
      ctx.beginPath()
      ctx.rect(x0, yTop, width - x0 + 50, height * 3)
      ctx.clip()
      ctx.fillStyle = grad
      ctx.fillRect(x0, yTop, width - x0 + 50, height * 3)
      ctx.strokeStyle = `rgba(255,255,255,${0.25 * night})`
      ctx.lineWidth = 2
      for (let row = 0; row < 5; row++) {
        const wy = yTop + 25 + row * ((height - yTop) / 5)
        ctx.beginPath()
        for (let x = x0; x <= width + 50; x += 12) {
          const yy = wy + Math.sin((x * 0.03) + frameCount * 0.05 + row) * 4
          x === x0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy)
        }
        ctx.stroke()
      }
      ctx.restore()
    }

    // ===================== DRAW LAYER 2 — GROUND =====================
    const drawGround = (progress: number) => {
      const night = 1 - progress * 0.6

      ctx.fillStyle = `rgba(100,160,110,${night})`
      ctx.beginPath()
      ctx.moveTo(-50, horizonY())
      ctx.quadraticCurveTo(width * 0.15, horizonY() - 150, width * 0.4, horizonY() - 20)
      ctx.lineTo(width * 0.4 + 20, horizonY())
      ctx.fill()

      ctx.fillStyle = `rgba(105,122,101,${night})`
      ctx.beginPath()
      ctx.moveTo(-50, height * 3)
      for (let x = -50; x <= width * 0.42 + 5; x += 5) ctx.lineTo(x, groundYAt(x))
      ctx.lineTo(width * 0.42 + 5, height * 3)
      ctx.closePath()
      ctx.fill()

      ctx.fillStyle = `rgba(85,170,85,${night})`
      ctx.beginPath()
      ctx.moveTo(-50, groundYAt(0) + 20)
      for (let x = -50; x <= width * 0.42 + 5; x += 5) ctx.lineTo(x, groundYAt(x))
      for (let x = width * 0.42 + 5; x >= -50; x -= 5) {
        const thickness = 14 + Math.sin(x * 0.7) * 4 + Math.cos(x * 0.3) * 3
        ctx.lineTo(x, groundYAt(x) + thickness)
      }
      ctx.closePath()
      ctx.fill()

      ctx.strokeStyle = `rgba(110,190,90,${night * 0.85})`
      ctx.lineWidth = 2
      const time = frameCount * 0.05
      for (let x = 20; x < width * 0.38; x += 14) {
        const y = groundYAt(x)
        ctx.beginPath()
        ctx.moveTo(x, y)
        const windBend = Math.sin(time + x * 0.05) * 6 + 6
        const bladeHeight = 10 + Math.sin(x * 123) * 4
        ctx.quadraticCurveTo(x + windBend * 0.5, y - bladeHeight * 0.5, x + windBend, y - bladeHeight)
        ctx.stroke()
      }

      // House
      const hx = width * 0.18
      const hy = groundYAt(hx) - 6
      ctx.fillStyle = `rgba(225,210,180,${night})`
      ctx.fillRect(hx - 32, hy - 46, 64, 46)
      ctx.fillStyle = `rgba(178,60,50,${night})`
      ctx.beginPath()
      ctx.moveTo(hx - 40, hy - 46); ctx.lineTo(hx + 40, hy - 46); ctx.lineTo(hx, hy - 82)
      ctx.closePath(); ctx.fill()
      ctx.fillStyle = `rgba(178,60,50,${night})`
      ctx.fillRect(hx + 14, hy - 70, 8, 26)
      ctx.fillStyle = `rgba(110,70,40,${night})`
      ctx.fillRect(hx - 8, hy - 24, 16, 24)
      ctx.fillStyle = `rgba(150, 210, 235, ${night})`
      ctx.fillRect(hx + 12, hy - 36, 14, 14)

      // Sniper
      const s = sniperPos()
      const scrollY = window.scrollY || 0
      const l2Y = height - scrollY * 1.5
      const visualSy = s.y + l2Y
      const angle = Math.atan2(pointerRef.current.y - visualSy, pointerRef.current.x - s.x)
      ctx.save()
      ctx.translate(s.x, s.y)
      ctx.fillStyle = `rgba(40, 50, 45, ${night})`
      ctx.beginPath(); ctx.arc(0, -14, 7, 0, Math.PI * 2); ctx.fill()
      ctx.fillRect(-6, -8, 12, 20)
      ctx.strokeStyle = `rgba(20, 20, 20, ${night})`
      ctx.lineWidth = 4
      ctx.beginPath(); ctx.moveTo(0, -2); ctx.lineTo(Math.cos(angle) * 60, -2 + Math.sin(angle) * 60); ctx.stroke()
      ctx.fillStyle = `rgba(255, 80, 80, ${night})`
      ctx.beginPath(); ctx.arc(Math.cos(angle) * 30, -2 + Math.sin(angle) * 30, 2.5, 0, Math.PI * 2); ctx.fill()
      ctx.restore()

      // Family
      family.forEach((f, i) => {
        f.bob += 0.05
        const by = f.y + Math.sin(f.bob) * 1.5
        const isChild = f.h < 30
        const isFemale = i % 2 !== 0
        ctx.fillStyle = `rgba(${hexToRgb(f.color)}, ${night})`
        ctx.beginPath()
        ctx.arc(f.x, by - f.h + 2, isChild ? 4 : 5, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = `rgba(40, 30, 20, ${night})`
        if (i === 0) {
          ctx.fillStyle = `rgba(220, 180, 100, ${night})`
          ctx.beginPath(); ctx.ellipse(f.x, by - f.h + 1, 9, 3, 0, 0, Math.PI * 2); ctx.fill()
          ctx.beginPath(); ctx.arc(f.x, by - f.h + 1, 5, Math.PI, 0); ctx.fill()
        } else if (isFemale) {
          ctx.beginPath(); ctx.arc(f.x, by - f.h + 2, 5, Math.PI, 0); ctx.fill()
          ctx.fillRect(f.x - 5, by - f.h + 2, 10, 8)
        } else {
          ctx.beginPath(); ctx.arc(f.x, by - f.h + 1, 4.5, Math.PI, 0); ctx.fill()
        }
        ctx.fillStyle = `rgba(${hexToRgb(f.color)},${night})`
        if (isFemale) {
          ctx.beginPath()
          ctx.moveTo(f.x - 3, by - f.h + 7); ctx.lineTo(f.x + 3, by - f.h + 7)
          const dressSway = Math.sin(f.bob) * 2
          ctx.lineTo(f.x + 7 + dressSway, by); ctx.lineTo(f.x - 7 + dressSway, by)
          ctx.fill()
        } else {
          ctx.fillRect(f.x - 4, by - f.h + 7, 8, f.h - 15)
          ctx.fillStyle = `rgba(50, 60, 70, ${night})`
          ctx.fillRect(f.x - 4, by - 8, 3, 8)
          ctx.fillRect(f.x + 1, by - 8, 3, 8)
        }
        const armSway = Math.sin(f.bob * 1.5) * 3
        ctx.strokeStyle = `rgba(220, 180, 150, ${night})`; ctx.lineWidth = 2
        ctx.beginPath(); ctx.moveTo(f.x - 4, by - f.h + 8); ctx.lineTo(f.x - 6 - armSway, by - f.h + 18); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(f.x + 4, by - f.h + 8); ctx.lineTo(f.x + 6 + armSway, by - f.h + 18); ctx.stroke()
      })

      // Animals
      animals.forEach(a => {
        a.idlePhase += 0.08
        const bob = Math.sin(a.idlePhase) * 2
        if (a.type === 'horse') {
          ctx.fillStyle = `rgba(110, 70, 45, ${night})`
          ctx.beginPath(); ctx.ellipse(a.x, a.y - 14 + bob, 16, 8, 0, 0, Math.PI * 2); ctx.fill()
          ctx.beginPath(); ctx.moveTo(a.x + 10, a.y - 14 + bob); ctx.quadraticCurveTo(a.x + 16, a.y - 28 + bob, a.x + 12, a.y - 32 + bob); ctx.lineWidth = 6; ctx.strokeStyle = `rgba(110, 70, 45, ${night})`; ctx.stroke()
          ctx.beginPath(); ctx.ellipse(a.x + 14, a.y - 32 + bob, 6, 4, Math.PI / 6, 0, Math.PI * 2); ctx.fill()
          ctx.lineWidth = 3
          ctx.beginPath(); ctx.moveTo(a.x - 10, a.y - 10); ctx.lineTo(a.x - 12, a.y); ctx.stroke()
          ctx.beginPath(); ctx.moveTo(a.x - 6, a.y - 10); ctx.lineTo(a.x - 4, a.y); ctx.stroke()
          ctx.beginPath(); ctx.moveTo(a.x + 8, a.y - 10); ctx.lineTo(a.x + 10, a.y); ctx.stroke()
          ctx.beginPath(); ctx.moveTo(a.x + 4, a.y - 10); ctx.lineTo(a.x + 4, a.y); ctx.stroke()
          ctx.beginPath(); ctx.moveTo(a.x - 16, a.y - 14 + bob); ctx.quadraticCurveTo(a.x - 20, a.y - 6, a.x - 18, a.y - 2); ctx.lineWidth = 2; ctx.stroke()
        } else if (a.type === 'sheep') {
          ctx.fillStyle = `rgba(245, 245, 240, ${night})`
          ctx.beginPath()
          for (let i = 0; i < 6; i++) {
            ctx.arc(a.x + Math.cos(i * Math.PI / 3) * 8, a.y - 10 + bob + Math.sin(i * Math.PI / 3) * 6, 6, 0, Math.PI * 2)
          }
          ctx.fill()
          ctx.fillStyle = `rgba(40, 35, 35, ${night})`
          ctx.beginPath(); ctx.ellipse(a.x + 12, a.y - 12 + bob, 5, 3.5, -Math.PI / 8, 0, Math.PI * 2); ctx.fill()
          ctx.strokeStyle = `rgba(40, 35, 35, ${night})`; ctx.lineWidth = 2
          ctx.beginPath(); ctx.moveTo(a.x - 6, a.y - 6); ctx.lineTo(a.x - 6, a.y); ctx.stroke()
          ctx.beginPath(); ctx.moveTo(a.x + 6, a.y - 6); ctx.lineTo(a.x + 6, a.y); ctx.stroke()
        } else {
          ctx.fillStyle = `rgba(220, 215, 215, ${night})`
          ctx.beginPath(); ctx.ellipse(a.x, a.y - 6 + bob, 7, 5, 0, 0, Math.PI * 2); ctx.fill()
          ctx.beginPath(); ctx.arc(a.x + 6, a.y - 8 + bob, 3.5, 0, Math.PI * 2); ctx.fill()
          ctx.beginPath(); ctx.ellipse(a.x + 5, a.y - 14 + bob, 1.5, 6, Math.PI / 8, 0, Math.PI * 2); ctx.fill()
          ctx.beginPath(); ctx.ellipse(a.x + 8, a.y - 13 + bob, 1.5, 5, Math.PI / 4, 0, Math.PI * 2); ctx.fill()
          ctx.fillStyle = `rgba(255, 255, 255, ${night})`
          ctx.beginPath(); ctx.arc(a.x - 7, a.y - 5 + bob, 2.5, 0, Math.PI * 2); ctx.fill()
        }
      })
    }

    // ===================== SEA CREATURES =====================
    const drawSeaCreatureShape = (ctx: CanvasRenderingContext2D, type: SeaType, animPhase: number) => {
      switch (type) {
        case 'fish':
          ctx.fillStyle = '#f4a261'
          ctx.beginPath(); ctx.ellipse(0, 0, 12, 6, 0, 0, Math.PI * 2); ctx.fill()
          ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(-18, -6); ctx.lineTo(-16, 6); ctx.fill()
          break
        case 'dolphin':
          ctx.fillStyle = '#457b9d'
          ctx.beginPath()
          ctx.moveTo(16, 0); ctx.quadraticCurveTo(0, -12, -16, 0)
          ctx.quadraticCurveTo(-24, -4, -28, -12); ctx.lineTo(-24, 6)
          ctx.quadraticCurveTo(0, 8, 16, 0); ctx.fill()
          ctx.fillRect(-4, -14, 4, 8)
          break
        case 'whale':
          ctx.fillStyle = '#1d3557'
          ctx.beginPath(); ctx.ellipse(0, 0, 40, 20, 0, 0, Math.PI * 2); ctx.fill()
          ctx.fillRect(0, -28, 6, 12)
          ctx.fillStyle = '#f1faee'; ctx.beginPath(); ctx.arc(20, 4, 2, 0, Math.PI * 2); ctx.fill()
          break
        case 'kraken':
          ctx.fillStyle = '#9b5de5'
          ctx.beginPath(); ctx.arc(0, -10, 16, 0, Math.PI, true); ctx.fill()
          for (let i = 0; i < 4; i++) {
            const w = Math.sin(animPhase * 10 + i) * 6
            ctx.beginPath(); ctx.moveTo(-10 + i * 6, -10); ctx.quadraticCurveTo(-10 + i * 6 + w, 10, -10 + i * 6 - w, 20); ctx.lineWidth = 4; ctx.strokeStyle = '#9b5de5'; ctx.stroke()
          }
          break
        case 'brontosaurus':
          ctx.fillStyle = '#2a9d8f'
          ctx.beginPath(); ctx.ellipse(-10, 10, 30, 16, 0, 0, Math.PI * 2); ctx.fill()
          ctx.beginPath(); ctx.moveTo(10, 10); ctx.quadraticCurveTo(30, -10, 40, -30); ctx.lineWidth = 12; ctx.strokeStyle = '#2a9d8f'; ctx.stroke()
          ctx.beginPath(); ctx.arc(42, -30, 8, 0, Math.PI * 2); ctx.fill()
          break
        case 'siren':
          ctx.fillStyle = '#ffd166'
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-20, 10); ctx.lineTo(-24, -10); ctx.fill()
          ctx.fillStyle = '#ffb703'; ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill()
          ctx.fillStyle = '#f4a261'; ctx.beginPath(); ctx.arc(10, -10, 6, 0, Math.PI * 2); ctx.fill()
          break
      }
    }

    const drawSeaCreature = (c: SeaCreature) => {
      let y = c.baseY
      let tilt = 0
      let animPhase = c.phase
      if (c.behavior === 'swim') {
        const jumpCycle = Math.sin(c.swimPhase)
        if (jumpCycle > 0.8) {
          const jumpArc = (jumpCycle - 0.8) * 5
          y = c.baseY - Math.sin(jumpArc * Math.PI) * c.jumpH
          tilt = Math.cos(jumpArc * Math.PI) * 0.5
        }
        animPhase = c.swimPhase
      } else {
        const arc = Math.sin(c.phase * Math.PI)
        y = c.baseY - arc * c.jumpH
        tilt = (c.phase - 0.5) * 0.4
      }
      ctx.save()
      ctx.translate(c.x, y)
      ctx.scale(c.dir, 1)
      if (tilt !== 0) ctx.rotate(tilt)
      drawSeaCreatureShape(ctx, c.type, animPhase)
      ctx.restore()
    }

    // ===================== MAIN LOOP =====================
    const loop = () => {
      ctx.clearRect(0, 0, width, height)
      frameCount++

      if (frameCount % 60 === 0) spawnSkyObject()
      if (frameCount % 120 === 0 && Math.random() > 0.3) {
        const types: SeaType[] = ['fish', 'fish', 'dolphin', 'dolphin', 'whale', 'kraken', 'brontosaurus', 'siren']
        spawnSea(types[Math.floor(Math.random() * types.length)])
      }

      // FIX: clamp progress agar tidak pernah NaN/Infinity
      const rawProgress = scoreRef.current / maxScore
      const progress = Number.isFinite(rawProgress) ? Math.min(Math.max(rawProgress, 0), 1) : 0
      if (scoreRef.current !== lastRenderedScoreRef.current) {
        lastRenderedScoreRef.current = scoreRef.current
        setScoreDisplay(scoreRef.current)
      }

      const scrollY = window.scrollY || 0
      const l1Y = -scrollY * 0.3
      const l2Y = height - scrollY * 1.5

      drawSky(progress)

      // LAYER 1: Sky objects
      ctx.save()
      ctx.translate(0, l1Y)
      skyObjects = skyObjects.filter(obj => {
        if (obj.alive) {
          obj.x += obj.vx
          obj.phase += 0.1
          drawSkyObject(obj)
          return obj.x > -200 && obj.x < width + 200
        } else {
          obj.deathTimer++
          drawSkyObject(obj)
          return obj.deathTimer < 20
        }
      })
      ctx.restore()

      // LAYER 2: Ground + Sea + Sea Creatures
      ctx.save()
      ctx.translate(0, l2Y)

      drawSea(progress)

      ctx.save()
      ctx.beginPath()
      ctx.rect(seaBounds().x0, horizonY() - 10, width, height * 3)
      ctx.clip()
      seaCreatures = seaCreatures.filter(c => {
        const { x0, x1 } = seaBounds()
        if (c.behavior === 'swim') {
          c.x += c.speed * c.dir
          const totalDist = x1 - x0 + 100
          const traveled = c.dir === 1 ? c.x - (x0 - 20) : (x1 + 20) - c.x
          c.phase = Math.min(Math.max(traveled / totalDist, 0), 1)
          c.swimPhase += 0.05
          if (c.phase > 0.9 && c.phase < 0.95 && Math.random() < 0.3) splash(c.x, c.baseY)
          drawSeaCreature(c)
          return c.phase < 1 && c.active
        } else {
          c.phase += c.speed * 0.005
          if (c.phase > 0.05 && c.phase < 0.1 && Math.random() < 0.3) splash(c.x, c.baseY)
          if (c.phase > 0.9 && c.phase < 0.95 && Math.random() < 0.3) splash(c.x, c.baseY)
          drawSeaCreature(c)
          return c.phase < 1 && c.active
        }
      })
      ctx.restore()

      drawGround(progress)
      ctx.restore()

      // Bullets (screen space)
      ctx.fillStyle = '#ffd166'
      bullets = bullets.filter(b => {
        b.x += b.vx
        b.y += b.vy
        ctx.beginPath()
        ctx.arc(b.x, b.y, 3, 0, Math.PI * 2)
        ctx.fill()
        for (const obj of skyObjects) {
          const visualX = obj.x
          const visualY = obj.y + l1Y
          if (obj.alive && Math.abs(visualX - b.x) < obj.w && Math.abs(visualY - b.y) < obj.h) {
            obj.alive = false
            b.alive = false
            createExplosion(visualX, visualY, obj.color)
            scoreRef.current += 5
            break
          }
        }
        if (b.y < -50 || b.x < -50 || b.x > width + 50) return false
        return b.alive
      })

      // Particles
      particles = particles.filter(p => {
        p.x += p.vx
        p.y += p.vy
        p.life++
        ctx.fillStyle = p.color
        ctx.globalAlpha = 1 - p.life / p.maxLife
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        return p.life < p.maxLife
      })
      ctx.globalAlpha = 1
      pointerRef.current.clicked = false

      drawCrosshair()
      reqRef.current = requestAnimationFrame(loop)
    }

    const resize = () => {
      // FIX: guard agar tidak pernah 0
      width = Math.max(window.innerWidth, 1)
      height = Math.max(window.innerHeight, 1)
      isMobile = width < 768
      canvas.width = width * window.devicePixelRatio
      canvas.height = height * window.devicePixelRatio
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      initActors()
    }
    window.addEventListener('resize', resize)
    resize()

    reqRef.current = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(reqRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousedown', handlePointerDown)
      window.removeEventListener('touchstart', handlePointerDown)
      window.removeEventListener('mousemove', handlePointerMove)
    }
  }, [isActiveTheme])

  if (!isActiveTheme) return null

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-0 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'} pointer-events-none`}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ pointerEvents: 'none' }}
      />

      {/* HUD */}
      <div className="absolute top-24 left-6 p-4 rounded-xl bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 shadow-xl pointer-events-auto">
        <div className="text-xl font-bold mb-2">Score: {scoreDisplay}</div>
        <div className="w-32 h-2 bg-black/20 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-orange-400 to-indigo-500 transition-all duration-300"
            style={{ width: `${Math.min((scoreDisplay / maxScore) * 100, 100)}%` }}
          />
        </div>
        <button
          onClick={() => { scoreRef.current = 0; setScoreDisplay(0) }}
          className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors"
        >
          Reset Day
        </button>
      </div>
    </div>
  )
}