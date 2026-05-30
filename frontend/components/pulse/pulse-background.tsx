'use client'

import type { CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import GalaxyBackground from '@/components/galaxy-background'
import { CityPulseLogo } from '@/components/citypulse-logo'

const orbs = [
  { color: '#9CB7FF', size: 420, x: '-5%', y: '-10%', delay: 0 },
  { color: '#C8A8FF', size: 380, x: '75%', y: '5%', delay: 1.5 },
  { color: '#9CDDB7', size: 340, x: '60%', y: '75%', delay: 0.8 },
  { color: '#FFBE98', size: 280, x: '5%', y: '70%', delay: 2.2 },
]

type PulseMode = 'landing' | 'admin' | 'simulation' | 'comparison' | 'settings' | 'dashboard' | 'login'

type PulsePanel = {
  label: string
  value: string
  accent: string
  left: string
  top: string
  width: string
  tilt: number
  delay: number
}

type PulseConfig = {
  logoLabel: string
  logoTitle: string
  logoPosition: { left?: string; right?: string; top?: string; bottom?: string }
  panels: PulsePanel[]
  showGalaxy: boolean
}

function getPulseMode(pathname: string): PulseMode {
  if (pathname.startsWith('/landing')) return 'landing'
  if (pathname.startsWith('/admin')) return 'admin'
  if (pathname.startsWith('/simulation')) return 'simulation'
  if (pathname.startsWith('/comparison')) return 'comparison'
  if (pathname.startsWith('/settings')) return 'settings'
  if (pathname.startsWith('/login')) return 'login'
  return 'dashboard'
}

const configs: Record<PulseMode, PulseConfig> = {
  landing: {
    showGalaxy: true,
    logoLabel: 'Smart City Matrix',
    logoTitle: 'CityPulse Nexus',
    logoPosition: { right: '8%', top: '18%' },
    panels: [
      { label: 'Urban Grid', value: 'Live Geometry', accent: '#9CB7FF', left: '8%', top: '16%', width: '240px', tilt: -10, delay: 0.2 },
      { label: 'Command Feed', value: 'Priority Stable', accent: '#C8A8FF', left: '72%', top: '56%', width: '220px', tilt: 10, delay: 1.4 },
      { label: 'Mobility Lanes', value: '99.2% Linked', accent: '#9CDDB7', left: '14%', top: '68%', width: '210px', tilt: -6, delay: 0.8 },
    ],
  },
  admin: {
    showGalaxy: true,
    logoLabel: 'Operations Core',
    logoTitle: 'Admin Command',
    logoPosition: { right: '10%', top: '20%' },
    panels: [
      { label: 'Threat Mesh', value: 'Sector AI Online', accent: '#FF9CB0', left: '8%', top: '18%', width: '220px', tilt: -8, delay: 0.5 },
      { label: 'Responder Sync', value: 'All Nodes Green', accent: '#9CDDB7', left: '70%', top: '60%', width: '230px', tilt: 11, delay: 1.2 },
      { label: 'Kernel Telemetry', value: '32ms Dispatch', accent: '#9CB7FF', left: '18%', top: '70%', width: '240px', tilt: -4, delay: 0.9 },
    ],
  },
  simulation: {
    showGalaxy: false,
    logoLabel: 'Scheduler Core',
    logoTitle: 'Simulation Engine',
    logoPosition: { right: '10%', top: '22%' },
    panels: [
      { label: 'Burst Lattice', value: 'Quantum Ready', accent: '#FFBE98', left: '10%', top: '14%', width: '220px', tilt: -9, delay: 0.3 },
      { label: 'Queue Vector', value: '5 Streams Active', accent: '#9CB7FF', left: '74%', top: '54%', width: '230px', tilt: 12, delay: 1.5 },
      { label: 'Process Timing', value: 'Latency 18ms', accent: '#C8A8FF', left: '14%', top: '72%', width: '210px', tilt: -5, delay: 0.9 },
    ],
  },
  comparison: {
    showGalaxy: false,
    logoLabel: 'Metric Prism',
    logoTitle: 'Comparison Matrix',
    logoPosition: { right: '10%', top: '22%' },
    panels: [
      { label: 'CPU Spectrum', value: 'FCFS vs SJF', accent: '#9CB7FF', left: '12%', top: '15%', width: '220px', tilt: -8, delay: 0.4 },
      { label: 'Rank Delta', value: 'Priority Leading', accent: '#C8A8FF', left: '74%', top: '58%', width: '225px', tilt: 10, delay: 1.3 },
      { label: 'Response Field', value: 'Trend Stable', accent: '#9CDDB7', left: '18%', top: '70%', width: '210px', tilt: -5, delay: 0.8 },
    ],
  },
  settings: {
    showGalaxy: false,
    logoLabel: 'Preference Core',
    logoTitle: 'System Tuning',
    logoPosition: { right: '10%', top: '20%' },
    panels: [
      { label: 'Theme Driver', value: 'Dark Matte Enabled', accent: '#C8A8FF', left: '12%', top: '16%', width: '210px', tilt: -8, delay: 0.5 },
      { label: 'Motion Layer', value: 'Adaptive Effects', accent: '#9CDDB7', left: '74%', top: '56%', width: '220px', tilt: 9, delay: 1.4 },
      { label: 'Signal Audio', value: 'Reactive Routing', accent: '#FFBE98', left: '20%', top: '72%', width: '205px', tilt: -4, delay: 0.9 },
    ],
  },
  dashboard: {
    showGalaxy: false,
    logoLabel: 'Responder Mesh',
    logoTitle: 'Field Interface',
    logoPosition: { right: '10%', top: '18%' },
    panels: [
      { label: 'Civic Signals', value: 'Grid Listening', accent: '#9CDDB7', left: '10%', top: '18%', width: '210px', tilt: -9, delay: 0.5 },
      { label: 'Patrol Vector', value: 'Adaptive Routing', accent: '#9CB7FF', left: '74%', top: '58%', width: '220px', tilt: 10, delay: 1.3 },
      { label: 'Response Aura', value: 'Live Assist Online', accent: '#C8A8FF', left: '18%', top: '72%', width: '210px', tilt: -6, delay: 0.9 },
    ],
  },
  login: {
    showGalaxy: false,
    logoLabel: 'Access Gateway',
    logoTitle: 'Secure Entry',
    logoPosition: { right: '12%', top: '22%' },
    panels: [
      { label: 'Identity Scan', value: 'Cipher Synced', accent: '#9CB7FF', left: '12%', top: '18%', width: '220px', tilt: -8, delay: 0.4 },
      { label: 'Role Matrix', value: 'Privileges Routed', accent: '#C8A8FF', left: '72%', top: '60%', width: '220px', tilt: 11, delay: 1.1 },
    ],
  },
}

export function PulseBackground() {
  const pathname = usePathname()
  const mode = getPulseMode(pathname)
  const config = configs[mode]

  return (
    <div className={cn('pulse-bg pointer-events-none fixed inset-0 z-0 overflow-hidden', `pulse-mode-${mode}`)} aria-hidden>
      {config.showGalaxy && <GalaxyBackground />}
      <div className="pulse-bg-base" />
      <div className="pulse-bg-mesh" />
      <div className="pulse-grid" />
      <div className="pulse-bg-noise" />
      <div className="pulse-depth-ring pulse-depth-ring-a" />
      <div className="pulse-depth-ring pulse-depth-ring-b" />
      <div className="pulse-energy-beam pulse-energy-beam-a" />
      <div className="pulse-energy-beam pulse-energy-beam-b" />

      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="pulse-orb"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: `radial-gradient(circle at 40% 40%, ${orb.color}40, ${orb.color}08 45%, transparent 70%)`,
          }}
          animate={{
            x: [0, 20, -10, 0],
            y: [0, -15, 10, 0],
            scale: [1, 1.05, 0.98, 1],
          }}
          transition={{
            duration: 16 + i * 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: orb.delay,
          }}
        />
      ))}

      {config.panels.map((panel, i) => (
        <motion.div
          key={`${mode}-${panel.label}`}
          className="pulse-holo-panel"
          style={{
            left: panel.left,
            top: panel.top,
            width: panel.width,
            '--panel-accent': panel.accent,
            '--panel-tilt': `${panel.tilt}deg`,
          } as CSSProperties}
          animate={{
            y: [0, -16, 0],
            rotateZ: [panel.tilt * 0.15, panel.tilt * 0.18, panel.tilt * 0.15],
            opacity: [0.45, 0.82, 0.45],
          }}
          transition={{
            duration: 8 + i * 1.1,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: panel.delay,
          }}
        >
          <div className="pulse-holo-kicker">{panel.label}</div>
          <div className="pulse-holo-title">{panel.value}</div>
          <div className="pulse-holo-bar">
            <motion.div
              className="pulse-holo-bar-fill"
              animate={{ width: ['24%', '82%', '38%'] }}
              transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: panel.delay }}
            />
          </div>
        </motion.div>
      ))}

      <motion.div
        className="pulse-logo-totem"
        style={config.logoPosition}
        animate={{ y: [0, -20, 0], rotateZ: [0, 1.2, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="pulse-logo-shell">
          <CityPulseLogo size="xl" priority={mode === 'landing'} />
        </div>
        <div className="pulse-logo-copy">
          <span className="pulse-logo-kicker">{config.logoLabel}</span>
          <span className="pulse-logo-title">{config.logoTitle}</span>
        </div>
      </motion.div>
    </div>
  )
}
