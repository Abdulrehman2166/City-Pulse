"use client"

import { useRef, useEffect } from 'react'

export default function GalaxyBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const nebulaRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const nebula = nebulaRef.current!
    if (!canvas || !nebula) return

    const ctx = canvas.getContext('2d')!
    const nctx = nebula.getContext('2d')!

    let rafId = 0
    let width = 0
    let height = 0
    let dpr = Math.max(1, window.devicePixelRatio || 1)

    function resize() {
      dpr = Math.max(1, window.devicePixelRatio || 1)
      width = canvas.width = window.innerWidth * dpr
      height = canvas.height = window.innerHeight * dpr
      nebula.width = width
      nebula.height = height
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      nebula.style.width = `${window.innerWidth}px`
      nebula.style.height = `${window.innerHeight}px`
    }

    resize()
    window.addEventListener('resize', resize)

    // Star generation density scaled to viewport; capped for performance
    const area = window.innerWidth * window.innerHeight
    const approx = Math.min(3000, Math.max(800, Math.floor(area / 1200)))

    type Star = {
      x: number
      y: number
      z: number
      size: number
      color: string
      baseAlpha: number
      twinkleSpeed: number
      phase: number
      vx: number
      vy: number
    }

    const stars: Star[] = []
    for (let i = 0; i < approx; i++) {
      const z = Math.random() * 0.9 + 0.1 // depth (0.1..1)
      const size = (Math.random() * 1.2 + 0.2) * (1.2 - z)
      const isBlue = Math.random() < 0.35
      const color = isBlue ? `rgba(160,200,255,1)` : `rgba(255,255,255,1)`
      const baseAlpha = 0.08 + Math.random() * 0.6 * (1 - z)
      const twinkleSpeed = 0.2 + Math.random() * 0.6
      const phase = Math.random() * Math.PI * 2
      const vx = (Math.random() - 0.5) * 0.02 * (1 - z)
      const vy = (Math.random() - 0.5) * 0.01 * (1 - z)
      stars.push({ x: Math.random() * width, y: Math.random() * height, z, size, color, baseAlpha, twinkleSpeed, phase, vx, vy })
    }

    // Nebula / cosmic fog — draw once into nebula canvas then animate opacity
    function drawNebula() {
      nctx.clearRect(0, 0, width, height)
      // Create several soft radial gradients
      const centers = [
        { x: width * 0.2, y: height * 0.3, r: Math.min(width, height) * 0.6, c: '12,18,40' },
        { x: width * 0.8, y: height * 0.6, r: Math.min(width, height) * 0.5, c: '6,12,28' },
        { x: width * 0.5, y: height * 0.75, r: Math.min(width, height) * 0.7, c: '8,16,36' },
      ]

      centers.forEach((p, i) => {
        const g = nctx.createRadialGradient(p.x, p.y, p.r * 0.05, p.x, p.y, p.r)
        const alpha = 0.06 + i * 0.03
        g.addColorStop(0, `rgba(${p.c}, ${alpha})`)
        g.addColorStop(0.5, `rgba(${p.c}, ${alpha * 0.6})`)
        g.addColorStop(1, `rgba(${p.c}, 0.0)`)
        nctx.globalCompositeOperation = 'lighter'
        nctx.fillStyle = g
        nctx.fillRect(0, 0, width, height)
      })

      // subtle grain/noise
      nctx.globalCompositeOperation = 'source-over'
      nctx.fillStyle = 'rgba(10,12,20,0.02)'
      nctx.fillRect(0, 0, width, height)
    }

    drawNebula()

    let last = performance.now()
    const driftAmplitude = Math.min(40, Math.max(12, Math.sqrt(width * height) / 80))

    function render(now: number) {
      const dt = (now - last) / 1000
      last = now
      ctx.clearRect(0, 0, width, height)

      // subtle global offset to simulate drifting movement
      const t = now * 0.0001
      const offsetX = Math.sin(t * 0.6) * driftAmplitude * 0.3
      const offsetY = Math.cos(t * 0.4) * driftAmplitude * 0.2

      // draw stars by depth layers for parallax
      for (let s of stars) {
        // update positions
        s.x += s.vx * dt * 60 * (1 - s.z) + (offsetX * (1 - s.z) - offsetX * 0.0) * dt
        s.y += s.vy * dt * 60 * (1 - s.z) + (offsetY * (1 - s.z) - offsetY * 0.0) * dt

        // wrap
        if (s.x < -50) s.x = width + 50
        if (s.x > width + 50) s.x = -50
        if (s.y < -50) s.y = height + 50
        if (s.y > height + 50) s.y = -50

        const twinkle = 0.7 + 0.3 * Math.sin(now * 0.001 * s.twinkleSpeed + s.phase)
        const alpha = Math.max(0, Math.min(1, s.baseAlpha * twinkle))

        const px = s.x
        const py = s.y
        const size = s.size * dpr

        ctx.beginPath()
        ctx.fillStyle = s.color
        ctx.globalAlpha = alpha * 0.9
        // soft glow
        ctx.shadowColor = s.color
        ctx.shadowBlur = Math.max(0, size * 2.5)
        ctx.arc(px, py, size, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      }

      // very low opacity nebula overlay to tint the scene
      ctx.globalAlpha = 0.9
      ctx.drawImage(nebula, 0, 0, width, height)

      rafId = requestAnimationFrame(render)
    }

    rafId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div className="galaxy-bg" aria-hidden="true">
      <canvas ref={nebulaRef} className="galaxy-nebula" />
      <canvas ref={canvasRef} className="galaxy-canvas" />
    </div>
  )
}
