'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  AlertCircle,
  Users,
  Shield,
  Settings,
  LogOut,
  Search,
  Radio,
  Terminal as TerminalIcon,
  Database,
  Cpu,
  Activity,
  Compass,
  Bell,
  X,
  AlertOctagon,
  ChevronRight
} from 'lucide-react'
import { PulseBackground } from '@/components/pulse/pulse-background'
import { CityPulseLogo } from '@/components/citypulse-logo'

// Core Modules configuration
const MODULES = [
  { id: 'analytics', label: 'Tactical Analytics', path: '/admin', icon: LayoutDashboard, desc: 'Live tactical efficiency and resource overview' },
  { id: 'incidents', label: 'Incident Monitoring', path: '/admin/incidents', icon: AlertCircle, desc: 'Real-time incident feed and dispatch queue' },
  { id: 'simulation', label: 'AI Dispatch Simulation', path: '/simulation', icon: Activity, desc: 'Run OS scheduler algorithms on dispatch loads' },
  { id: 'algorithms', label: 'Scheduling Algorithms', path: '/comparison', icon: TerminalIcon, desc: 'Analyze scheduling performance metrics' },
  { id: 'users', label: 'User & Role Management', path: '/admin/users', icon: Users, desc: 'Access list, permissions, and operator assignments' },
  { id: 'emergency', label: 'Emergency Response Control', path: '#emergency', icon: AlertOctagon, desc: 'Trigger city-wide emergency broadcast alerts' },
  { id: 'settings', label: 'System Settings', path: '/admin/settings', icon: Settings, desc: 'Configure system thresholds and API ports' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(true)
  const [isRadialOpen, setIsRadialOpen] = useState(false)
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false)
  const [time, setTime] = useState('')
  const [telemetry, setTelemetry] = useState({ ping: 18, cpu: 32, mem: 44 })
  const [alerts, setAlerts] = useState<string[]>([
    '[SEC-4] Fire Incident reported at Downtown Sector 7',
    '[SYS-OS] Dispatch scheduler loaded SJF algorithm',
    '[SEC-2] High vehicle collision density reported on Main St',
  ])

  // Custom live ticker simulation
  useEffect(() => {
    const alertList = [
      '[SEC-9] Water line rupture near Industrial Sector B',
      '[SYS-AI] Predicted dispatch efficiency increase: 14%',
      '[SEC-1] Citizen request registered - Police assistance',
      '[SYS-DB] MONGODB read latency stable: 3.8ms',
      '[SEC-7] Medical response dispatched to Central Station',
    ]
    const interval = setInterval(() => {
      const randomAlert = alertList[Math.floor(Math.random() * alertList.length)]
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      setAlerts(prev => [`[${timestamp}] ${randomAlert}`, ...prev.slice(0, 5)])
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  // Live clock and telemetry
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTime(now.toISOString().replace('T', ' ').substring(0, 19))
    }
    updateTime()
    const tInterval = setInterval(updateTime, 1000)

    const telInterval = setInterval(() => {
      setTelemetry({
        ping: Math.floor(14 + Math.random() * 8),
        cpu: Math.floor(25 + Math.random() * 20),
        mem: Math.floor(40 + Math.random() * 5),
      })
    }, 4000)

    return () => {
      clearInterval(tInterval)
      clearInterval(telInterval)
    }
  }, [])

  // Auth and selective access
  useEffect(() => {
    const token = localStorage.getItem('token')
    const userRole = localStorage.getItem('role')
    if (!token) {
      router.push('/login')
    } else {
      setRole(userRole || '')
      
      // Route protection: non-admins cannot access admin only paths
      const adminOnlyPaths = ['/admin/users', '/admin/roles', '/admin/settings']
      if (userRole !== 'admin' && adminOnlyPaths.some(p => pathname.startsWith(p))) {
        router.push('/admin')
      } else {
        setLoading(false)
      }
    }
  }, [router, pathname])

  // Mouse trail custom cursor
  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      const dot = document.getElementById('cursor-dot')
      const ring = document.getElementById('cursor-ring')
      if (dot && ring) {
        dot.style.left = `${e.clientX}px`
        dot.style.top = `${e.clientY}px`
        ring.style.left = `${e.clientX}px`
        ring.style.top = `${e.clientY}px`
      }
    }
    window.addEventListener('mousemove', moveCursor)
    return () => window.removeEventListener('mousemove', moveCursor)
  }, [])



  // Filter modules based on role (non-admins get selective access)
  const filteredModules = MODULES.filter(mod => {
    if (role === 'admin') return true
    if (['/admin/users', '/admin/settings'].includes(mod.path)) {
      return false
    }
    return true
  })



  // Handle cursor hover states to expand custom cursor ring
  const handleMouseEnterLink = () => {
    const ring = document.getElementById('cursor-ring')
    if (ring) {
      ring.style.width = '38px'
      ring.style.height = '38px'
      ring.style.borderColor = 'rgba(200, 85, 61, 0.9)'
    }
  }
  
  const handleMouseLeaveLink = () => {
    const ring = document.getElementById('cursor-ring')
    if (ring) {
      ring.style.width = '26px'
      ring.style.height = '26px'
      ring.style.borderColor = 'rgba(200, 85, 61, 0.5)'
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0a0a0c', color: 'var(--foreground)', fontFamily: 'var(--font-sans)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ margin: '0 auto 1rem', width: 'fit-content' }}>
            <CityPulseLogo size="xl" priority />
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '2px' }}>Initializing System…</div>
        </div>
      </div>
    )
  }

  const currentModule = MODULES.find(m => m.path === pathname) || MODULES[0]

  return (
    <div className="cp-app-shell cp-root min-h-screen text-foreground relative overflow-x-hidden select-none" style={{ fontFamily: 'var(--font-sans)' }}>
      <PulseBackground />

      {/* Trailing Custom Cursor */}
      <div id="cursor-dot" className="cursor-dot" />
      <div id="cursor-ring" className="cursor-ring" />

      <div className="grid-overlay fixed inset-0 opacity-[0.2] pointer-events-none z-0" />



      {/* ── Main Scroll-Based Viewport Area ─────────────────────────── */}
      <div className="pt-28 pb-36 px-6 min-h-screen z-10 relative">
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="max-w-7xl mx-auto"
        >
          {children}
        </motion.main>
      </div>

      {/* ── Right-Side Glowing Scroll/Section Indicator ────────────── */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4 items-center">
        <span className="text-[9px] font-mono text-muted-foreground/40 rotate-90 uppercase tracking-widest translate-y-[-10px] mb-4">Nav Matrix</span>
        {filteredModules.map((mod, i) => {
          const isActive = pathname === mod.path
          return (
            <button
              key={mod.id}
              onClick={() => {
                if (mod.path === '#emergency') {
                  setIsEmergencyOpen(true)
                } else {
                  router.push(mod.path)
                }
              }}
              onMouseEnter={handleMouseEnterLink}
              onMouseLeave={handleMouseLeaveLink}
              className="group flex items-center justify-end relative cursor-none"
            >
              {/* Tooltip on hover */}
              <span className="absolute right-6 opacity-0 group-hover:opacity-100 transition-all font-mono text-[10px] text-[#c8553d] bg-black/80 px-2 py-1 border border-[rgba(200,85,61,0.2)] rounded whitespace-nowrap pointer-events-none translate-x-2 group-hover:translate-x-0">
                {mod.label}
              </span>
              <div className={`scroll-indicator-dot ${isActive ? 'active' : ''}`} />
            </button>
          )
        })}
      </div>

      {/* ── Bottom-Left Live Incident Ticker Widget ─────────────────── */}
      <div className="fixed bottom-6 left-6 z-40 glass-card p-4 rounded-xl border-[rgba(200,85,61,0.15)] bg-[#121426]/60 backdrop-blur-lg max-w-sm hidden lg:block">
        <div className="flex items-center gap-2 mb-2 border-b border-white/5 pb-1">
          <Radio size={14} className="text-[#c8553d] animate-pulse" />
          <span className="font-mono text-[10px] font-bold text-glow-ember text-[#c8553d] tracking-widest uppercase">Live Dispatch Ticker</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#c8553d] animate-ping ml-auto" />
        </div>
        <div className="font-mono text-[10px] text-muted-foreground space-y-1.5 max-h-[80px] overflow-hidden">
          <AnimatePresence>
            {alerts.map((al, idx) => (
              <motion.div
                key={al + idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="truncate text-white/70"
              >
                {al}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Bottom-Right Rotating Vector Radar Grid ─────────────────── */}
      <div className="fixed bottom-6 right-6 z-40 hidden lg:flex flex-col items-center gap-2">
        <div className="w-20 h-20 rounded-full border border-[rgba(200,85,61,0.15)] relative overflow-hidden bg-black/40 backdrop-blur-md">
          {/* Radar Sweep Line */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(200,85,61,0.05)_0%,transparent_70%)]" />
          <div className="absolute top-1/2 left-1/2 w-full h-[1px] bg-[rgba(200,85,61,0.4)] origin-left -translate-y-1/2 animate-[spin_4s_linear_infinite]" />
          
          {/* Ticking radar dots */}
          <div className="absolute top-4 left-6 w-1 h-1 bg-[#4a8c6f] rounded-full animate-ping" />
          <div className="absolute bottom-6 right-5 w-1 h-1 bg-[#c8553d] rounded-full animate-pulse" />
          <div className="absolute top-8 right-8 w-1 h-1 bg-[#5272a0] rounded-full animate-pulse" />

          {/* Radar Crosshairs */}
          <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-[rgba(255,255,255,0.03)]" />
          <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-[rgba(255,255,255,0.03)]" />
          <div className="absolute inset-4 rounded-full border border-white/[0.02]" />
          <div className="absolute inset-8 rounded-full border border-white/[0.02]" />
        </div>
        <span className="font-mono text-[8px] text-muted-foreground/40 uppercase tracking-widest">GRID SCANNER</span>
      </div>

      {/* ── Floating Quick-Access Circular Menu Button ──────────────── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <motion.button
          onClick={() => setIsRadialOpen(prev => !prev)}
          onMouseEnter={handleMouseEnterLink}
          onMouseLeave={handleMouseLeaveLink}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className={`w-14 h-14 rounded-full flex items-center justify-center cursor-none transition-all duration-300 border ${
            isRadialOpen
              ? 'bg-[#c8553d] text-white border-white glow-fire'
              : 'bg-[#121426]/90 text-[rgba(200,85,61,0.8)] border-[rgba(200,85,61,0.4)] hover:border-[#c8553d] glow-fire'
          } backdrop-blur-md`}
        >
          <motion.div animate={{ rotate: isRadialOpen ? 185 : 0 }} transition={{ duration: 0.4 }}>
            <Compass size={28} />
          </motion.div>
        </motion.button>
      </div>

      {/* ── Expandable Radial Navigation Wheel Overlay ───────────────── */}
      <AnimatePresence>
        {isRadialOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRadialOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md cursor-none"
            />

            {/* Radial Wheel Dial */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -45 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotate: 45 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-[340px] h-[340px] md:w-[380px] md:h-[380px] rounded-full border-2 border-[rgba(200,85,61,0.25)] flex items-center justify-center bg-[#0a0a0c]/85 p-6 shadow-[0_0_50px_rgba(200,85,61,0.15)]"
            >
              {/* Outer decorative ring */}
              <div className="absolute inset-[-8px] rounded-full border border-dashed border-[rgba(200,85,61,0.15)] animate-spin-slow" />

              {/* Central Core logo */}
              <div className="w-24 h-24 rounded-full bg-black/95 border-2 border-[#c8a8ff] flex flex-col items-center justify-center z-10 shadow-[0_0_20px_rgba(200,168,255,0.38)] relative">
                <CityPulseLogo size="md" className="mb-1" />
                <span className="font-mono text-[8px] text-white tracking-widest uppercase">NAV</span>
              </div>

              {/* Radial Slices (Arranged in a circle) */}
              {filteredModules.map((mod, index) => {
                const angle = (index * 360) / filteredModules.length
                const radius = 110 // distance from center
                const x = Math.sin((angle * Math.PI) / 180) * radius
                const y = -Math.cos((angle * Math.PI) / 180) * radius
                const isActive = pathname === mod.path

                return (
                  <motion.button
                    key={mod.id}
                    onClick={() => {
                      setIsRadialOpen(false)
                      if (mod.path === '#emergency') {
                        setIsEmergencyOpen(true)
                      } else {
                        router.push(mod.path)
                      }
                    }}
                    onMouseEnter={handleMouseEnterLink}
                    onMouseLeave={handleMouseLeaveLink}
                    whileHover={{ scale: 1.15 }}
                    style={{
                      position: 'absolute',
                      left: `calc(50% + ${x}px - 22px)`,
                      top: `calc(50% + ${y}px - 22px)`,
                    }}
                    className={`w-11 h-11 rounded-full flex flex-col items-center justify-center cursor-none transition-all border shadow-lg ${
                      isActive
                        ? 'bg-[#c8553d] text-white border-white glow-fire'
                        : 'bg-black/90 text-muted-foreground border-white/10 hover:border-[#c8553d] hover:text-[#c8553d]'
                    }`}
                  >
                    <mod.icon size={18} />
                    <span className="font-mono text-[6px] tracking-widest scale-75 mt-0.5 whitespace-nowrap absolute -bottom-5 text-white/50 opacity-0 group-hover:opacity-100 uppercase">
                      {mod.id}
                    </span>
                  </motion.button>
                )
              })}

              {/* Dynamic instruction text inside circular wheel */}
              <div className="absolute bottom-10 left-0 right-0 text-center pointer-events-none">
                <div className="font-mono text-[9px] text-[#c8553d] uppercase tracking-widest font-bold">Select Command Mode</div>
                <div className="text-[8px] text-muted-foreground mt-0.5">Click core to close dial</div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>



      {/* ── Emergency Response Advisory Modal ───────────────────────── */}
      <AnimatePresence>
        {isEmergencyOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEmergencyOpen(false)}
              className="absolute inset-0 bg-[#000]/85 backdrop-blur-md cursor-none"
            />

            {/* Emergency Advisory Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateX: 15 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotateX: 15 }}
              className="w-full max-w-md bg-black border-2 border-red-500 rounded-2xl p-6 relative z-10 shadow-[0_0_50px_rgba(239,68,68,0.25)] overflow-hidden"
            >
              {/* Caution Stripes top decoration */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-red-500" />

              <div className="flex items-center gap-3 text-red-500 mb-4 mt-2">
                <AlertOctagon size={28} className="animate-bounce" />
                <div>
                  <h3 className="font-mono text-lg font-bold tracking-widest text-glow-ember">MASS BROADCAST ADVISORY</h3>
                  <p className="text-[9px] text-red-500/70 font-mono">AUTHORIZED OPERATOR CLEARANCE REQUIRED</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-mono bg-red-950/20 border border-red-500/10 p-3 rounded-lg mb-6">
                Executing this command launches a priority broadcast alert to all citizens within Smart City coordinates. System logs will record this telemetry event, dispatching response units using scheduling constraints.
              </p>

              {/* Simulated Advisory Form */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1.5">Emergency Level</label>
                  <select className="w-full bg-slate-900 border border-red-500/20 rounded p-2 text-xs font-mono text-white outline-none focus:border-red-500">
                    <option value="critical">LEVEL 1 - CRITICAL OUTBREAK</option>
                    <option value="warning">LEVEL 2 - EVACUATION WARNING</option>
                    <option value="test">LEVEL 3 - ROUTINE DRILL SYSTEM TEST</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1.5">Broadcast Message</label>
                  <textarea
                    defaultValue="INCIDENT CONFIRMED. CITIZENS REMAIN INDOORS. DEFENSE DISPATCH INITIATING NOW."
                    rows={3}
                    className="w-full bg-slate-900 border border-red-500/20 rounded p-2 text-xs font-mono text-white outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 font-mono text-xs">
                <button
                  onClick={() => setIsEmergencyOpen(false)}
                  onMouseEnter={handleMouseEnterLink}
                  onMouseLeave={handleMouseLeaveLink}
                  className="flex-1 py-2.5 rounded border border-white/10 hover:bg-white/5 text-muted-foreground hover:text-white cursor-none transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setIsEmergencyOpen(false)
                    alert('Broadcast transmitted: OS Scheduling queue updated.')
                  }}
                  onMouseEnter={handleMouseEnterLink}
                  onMouseLeave={handleMouseLeaveLink}
                  className="flex-1 py-2.5 rounded bg-red-600 hover:bg-red-500 text-white cursor-none font-bold shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all"
                >
                  Transmit Alert
                </button>
              </div>

              {/* Corner Sci-fi brackets */}
              <div className="absolute bottom-2 right-2 font-mono text-[7px] text-red-500/30">CITYPULSE SEC-SYS</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
