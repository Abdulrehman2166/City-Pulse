'use client'

import React, { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { GlobalCommandPalette } from './GlobalCommandPalette'
import { CityPulseLogo } from './citypulse-logo'
import { motion, AnimatePresence } from 'framer-motion'
import '@/app/landing.css'

const NAV_ITEMS = [
  { key: 'hero',      label: 'Command' },
  { key: 'incidents', label: 'Incidents' },
  { key: 'dispatch',  label: 'Dispatch' },
  { key: 'algorithms',label: 'Algorithms' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'roles',     label: 'Roles' },
]

const Scene3D = dynamic(() => import('@/components/scene-3d'), { ssr: false })

export function GlobalHUD({ children }: { children: React.ReactNode }) {
  const [cmdOpen, setCmdOpen] = useState(false)
  const [loaderActive, setLoaderActive] = useState(false)
  const [loaderText, setLoaderText] = useState('ACCESSING QUANTUM CORE')
  const router = useRouter()
  const pathname = usePathname()

  const scrollTo = (id: string) => {
    if (pathname === '/landing') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    } else {
      router.push(`/landing#${id}`)
    }
  }

  // Intercept all button clicks to trigger the holographic cyber star loader
  useEffect(() => {
    const handleButtonClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const isButton = target.closest('button') || target.closest('.btn') || target.closest('[role="button"]')
      
      if (isButton) {
        // Random futuristic OS status messages
        const messages = [
          'LAUNCHING DISPATCH INTERRUPT',
          'ACCESSING KERNEL MEMORY SPACE',
          'SCHEDULING DISPATCH THREADS',
          'ALLOCATING DEVICE CPU CORES',
          'COMPUTING ALGORITHM METRICS',
          'RESOLVING SYSTEM SYSCALLS',
          'CONFIGURING THREAD CONTEXT',
          'STABILIZING QUANTUM CORES',
        ]
        const randomMsg = messages[Math.floor(Math.random() * messages.length)]
        setLoaderText(randomMsg)
        setLoaderActive(true)

        // Try playing a subtle high-tech futuristic click sound if allowed
        try {
          const context = new (window.AudioContext || (window as any).webkitAudioContext)()
          const osc = context.createOscillator()
          const gain = context.createGain()
          osc.type = 'sine'
          osc.frequency.setValueAtTime(880, context.currentTime) // high pitched high-tech beep
          osc.frequency.exponentialRampToValueAtTime(110, context.currentTime + 0.15)
          gain.gain.setValueAtTime(0.04, context.currentTime)
          gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.15)
          osc.connect(gain)
          gain.connect(context.destination)
          osc.start()
          osc.stop(context.currentTime + 0.15)
        } catch (err) {
          // ignore audio context restrictions
        }

        setTimeout(() => {
          setLoaderActive(false)
        }, 1200)
      }
    }

    document.addEventListener('click', handleButtonClick, true)
    return () => {
      document.removeEventListener('click', handleButtonClick, true)
    }
  }, [])

  return (
    <>
      {/* Cyberpunk Holographic Star Loader Overlay */}
      <div className={`cyber-loader-overlay ${loaderActive ? 'active' : ''}`}>
        <div className="cyber-loader-hud">
          {/* Outer dashed spinning ring */}
          <div className="cyber-loader-ring-outer" />
          
          {/* Middle spinning cyan neon ring */}
          <div className="cyber-loader-ring-mid" />
          
          {/* Inner double spinning ring */}
          <div className="cyber-loader-ring-inner" />
          
          {/* Orbiting glowing particles */}
          <div className="cyber-orbiting-particle p-1" />
          <div className="cyber-orbiting-particle p-2" />
          <div className="cyber-orbiting-particle p-3" />
          
          {/* Pulsing Star Core */}
          <div className="cyber-loader-core">
            <div className="cyber-loader-star" />
          </div>
        </div>
        <div className="cyber-loader-text">{loaderText}</div>
      </div>

      <Scene3D />
      {children}

      
      {/* ── HUD CORNERS ──────────────────────────────────────────── */}
      <div className="cp-hud-corner tl">
        <div className="cp-hud-logo" onClick={() => scrollTo('hero')}>
          <CityPulseLogo size="sm" priority />
          CityPulse <span className="cp-brand">OS</span>
        </div>
      </div>

      <div className="cp-hud-corner tr">
        <button className="cp-btn-ghost" onClick={() => router.push('/login')}>Sign In</button>
        <button className="cp-btn-primary" onClick={() => router.push('/admin')}>Initialize</button>
      </div>

      <div className="cp-hud-corner bl">
        <button className="cp-hud-cmd-trigger" onClick={() => setCmdOpen(true)}>
          <span>Command Palette</span>
          <span className="cp-hud-cmd-kbd">⌘K</span>
        </button>
      </div>

      {/* Only show scroll dots if on the landing page, as they correspond to landing sections */}
      {pathname === '/landing' && (
        <div className="cp-hud-corner br">
          <div className="cp-scroll-dots">
            {NAV_ITEMS.map((n) => (
              <button
                key={n.key}
                title={n.label}
                className={`cp-scroll-dot`}
                onClick={() => scrollTo(n.key)}
              />
            ))}
          </div>
        </div>
      )}

      <GlobalCommandPalette open={cmdOpen} setOpen={setCmdOpen} />
    </>
  )
}

