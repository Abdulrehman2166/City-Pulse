'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Clock, Zap, AlertOctagon, RefreshCw, Flame, HeartPulse, ShieldAlert, Car, Radio, BarChart2, Building2, Settings, Play, Wrench } from 'lucide-react'
import '@/app/landing.css'
import CinematicCTA from '@/components/CinematicCTA'


gsap.registerPlugin(ScrollTrigger)

import { PulseBackground } from '@/components/pulse/pulse-background'

// ─── Data ────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { key: 'hero',      label: 'Command' },
  { key: 'priority',  label: 'Priority Watch' },
  { key: 'incidents', label: 'Incidents' },
  { key: 'dispatch',  label: 'Dispatch' },
  { key: 'algorithms',label: 'Algorithms' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'roles',     label: 'Roles' },
]

const ALGO_DATA = [
  { key: 'fcfs',  name: 'FCFS',        full: 'First Come First Serve',  icon: <Clock size={22} />,        tag: 'Non-Preemptive', color: '#5272a0', letter: 'F',
    desc: 'Incidents dispatched in exact arrival order. Simple and fair — but long tasks can starve critical ones.',
    bars: [85, 60, 40, 90, 70] },
  { key: 'sjf',   name: 'SJF',         full: 'Shortest Job First',       icon: <Zap size={22} />,          tag: 'Non-Preemptive', color: '#4a8c6f', letter: 'S',
    desc: 'Selects the fastest-to-resolve incident first. Minimizes average wait, but large incidents risk starvation.',
    bars: [30, 90, 55, 45, 80] },
  { key: 'prio',  name: 'PRIORITY',    full: 'Priority Scheduling',      icon: <AlertOctagon size={22} />, tag: 'Preemptive',     color: '#c8553d', letter: 'P',
    desc: 'Critical emergencies interrupt lower-priority tasks. Preemptive ensures immediate response for P1 threats.',
    bars: [95, 75, 60, 85, 50] },
  { key: 'rr',    name: 'ROUND ROBIN', full: 'Time-Slice Scheduling',    icon: <RefreshCw size={22} />,    tag: 'Preemptive',     color: '#7b6fa8', letter: 'R',
    desc: 'Each unit gets equal time quantum then yields. Fair and predictable across all severity levels.',
    bars: [65, 65, 65, 65, 65] },
]

const INCIDENT_DATA = [
  { key: 'fire',     icon: <Flame size={24} />,      name: 'Fire Outbreak',      color: '#c8553d', priority: 'P1–P2', rate: 95, desc: 'Structure fires, wildfires, and industrial incidents. Highest burst time.' },
  { key: 'medical',  icon: <HeartPulse size={24} />, name: 'Medical Emergency',  color: '#4a8c6f', priority: 'P1–P3', rate: 80, desc: 'Cardiac arrests, trauma, and mass casualty events requiring rapid response.' },
  { key: 'crime',    icon: <ShieldAlert size={24} />, name: 'Crime Report',      color: '#c9893a', priority: 'P2–P4', rate: 70, desc: 'Active threats, investigations. Severity-based dispatch with tactical teams.' },
  { key: 'accident', icon: <Car size={24} />,         name: 'Traffic Accident',  color: '#7b6fa8', priority: 'P3–P5', rate: 60, desc: 'Vehicle collisions and road blockages. Coordinated multi-unit response.' },
]

const METRICS = [
  { id: 'mt1', label: 'Incidents Processed', val: 12847, suffix: '+', bar: 82, color: '#c8553d' },
  { id: 'mt2', label: 'CPU Utilization Peak', val: 94,   suffix: '%', bar: 94, color: '#4a8c6f' },
  { id: 'mt3', label: 'Context Switches',     val: 2341, suffix: 'x', bar: 68, color: '#5272a0' },
  { id: 'mt4', label: 'Min Response Time',    val: 18,   suffix: 's', bar: 55, color: '#7b6fa8' },
]

const ROLES = [
  { icon: <Radio size={26} />,     title: 'Dispatcher',  desc: 'Manages incident intake, queue priorities, and active dispatch assignments in real time.',       perms: ['report incidents', 'view queue', 'map access'] },
  { icon: <BarChart2 size={26} />, title: 'Analyst',     desc: 'Monitors scheduling efficiency and compares algorithm performance across simulation runs.',        perms: ['gantt view', 'run simulation', 'export reports'] },
  { icon: <Building2 size={26} />, title: 'Supervisor',  desc: 'Oversees operations with full metrics, live feed, and team coordination visibility.',             perms: ['all metrics', 'algo select', 'team view'] },
  { icon: <Settings size={26} />,  title: 'Admin',       desc: 'Controls user management, system settings, incident registry, and platform configuration.',      perms: ['user management', 'system settings', 'full access'] },
]

const DISPATCH_ALERTS = [
  { id: 'a1', type: 'FIRE',     loc: 'Sector 7-B',  unit: 'Engine 04', delay: 0    },
  { id: 'a2', type: 'MEDICAL',  loc: 'Zone Alpha',  unit: 'MED-12',    delay: 2000 },
  { id: 'a3', type: 'CRIME',    loc: 'District 3',  unit: 'PD-19',     delay: 4000 },
  { id: 'a4', type: 'ACCIDENT', loc: 'Highway 12',  unit: 'RES-07',    delay: 6000 },
]

const PRIORITY_TASKS = [
  { id: 't1', priority: 1, title: 'Industrial Fire - Sector 7-B', type: 'fire', status: 'In Progress', eta: '2m' },
  { id: 't2', priority: 1, title: 'Cardiac Arrest - Zone Alpha', type: 'medical', status: 'Dispatched', eta: '3m' },
  { id: 't3', priority: 2, title: 'Armed Robbery - District 3', type: 'crime', status: 'Queued', eta: '5m' },
  { id: 't4', priority: 3, title: 'Multi-Car Collision - Highway 12', type: 'accident', status: 'Queued', eta: '7m' },
  { id: 't5', priority: 4, title: 'Power Outage - South Quad', type: 'infrastructure', status: 'Queued', eta: '12m' },
]

// ─── Sub-components ──────────────────────────────────────────────────────────

function RadarPulse() {
  return (
    <div className="cp-radar">
      {[0, 1, 2].map(i => (
        <div key={i} className="cp-radar-ring" style={{ animationDelay: `${i * 0.8}s` }} />
      ))}
      <div className="cp-radar-dot" />
    </div>
  )
}

function GridOverlay({ intensity = 1 }: { intensity?: number }) {
  return (
    <div className="cp-grid-overlay" style={{ opacity: 0.04 * intensity }} />
  )
}

function FloatingParticles() {
  // Use deterministic values based on index to avoid hydration mismatch
  const getParticleStyle = (i: number) => {
    const seed = (i * 12321) % 1000;
    return {
      left:  `${(seed / 1000) * 100}%`,
      top:   `${((seed * 2) / 1000) * 100}%`,
      animationDelay: `${(seed / 1000) * 8}s`,
      animationDuration: `${6 + (seed / 1000) * 6}s`,
      width:  `${1 + (seed / 1000) * 2}px`,
      height: `${1 + (seed / 1000) * 2}px`,
      opacity: 0.2 + (seed / 1000) * 0.5,
    }
  }

  return (
    <div className="cp-particles" aria-hidden="true">
      {Array.from({ length: 40 }).map((_, i) => (
        <div key={i} className="cp-particle" style={getParticleStyle(i)} />
      ))}
    </div>
  )
}

function LiveAlertBadge({ type, loc, unit }: { type: string; loc: string; unit: string }) {
  const colors: Record<string, string> = {
    FIRE: '#c8553d', MEDICAL: '#4a8c6f', CRIME: '#c9893a', ACCIDENT: '#7b6fa8',
  }
  const IconComponent: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
    FIRE: Flame,
    MEDICAL: HeartPulse,
    CRIME: ShieldAlert,
    ACCIDENT: Car,
  }
  const Icon = IconComponent[type] || ShieldAlert
  return (
    <motion.div 
      className="cp-alert-badge" 
      style={{ 
        borderColor: `${colors[type]}50`,
        perspective: '800px',
        position: 'relative',
        overflow: 'hidden',
      }}
      whileHover={{ 
        scale: 1.03, 
        rotateY: 3, 
        boxShadow: `0 0 30px ${colors[type]}40`,
        transition: { duration: 0.2 }
      }}
    >
      {/* Glassmorphism background */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(135deg, ${colors[type]}15 0%, rgba(255,255,255,0.05) 100%)`,
            backdropFilter: 'blur(4px)',
            borderRadius: 'inherit',
            zIndex: 0,
          }} />
      
      {/* Holographic overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `
          linear-gradient(45deg, transparent 30%, ${colors[type]}10 50%, transparent 70%),
          radial-gradient(circle at 0% 0%, ${colors[type]}08 0%, transparent 50%)
        `,
        mixBlendMode: 'screen',
        pointerEvents: 'none',
        zIndex: 1,
      }} />
      
      <motion.div 
        className="cp-alert-dot" 
        style={{ 
          background: colors[type],
          boxShadow: `0 0 20px ${colors[type]}80`,
        }}
        animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
      />
      <div className="cp-alert-icon relative z-10">
        <Icon 
          size={20} 
          style={{ 
            color: colors[type],
            filter: `drop-shadow(0 0 10px ${colors[type]}60)`,
          }} 
        />
      </div>
      <div className="cp-alert-body relative z-10">
        <div className="cp-alert-type" style={{ 
          color: colors[type], 
          textShadow: `0 0 15px ${colors[type]}60` 
        }}>
          {type} · {loc}
        </div>
        <div className="cp-alert-unit">UNIT: {unit} · DISPATCHING</div>
      </div>
      <div className="cp-alert-pulse" style={{ background: `${colors[type]}30` }} />
    </motion.div>
  )
}

function PriorityWatch() {
  const colors: Record<string, string> = {
    fire: '#c8553d', 
    medical: '#4a8c6f', 
    crime: '#c9893a', 
    accident: '#7b6fa8',
    infrastructure: '#5272a0',
  }
  const icons: Record<string, React.ComponentType<{ size?: number }>> = {
    fire: Flame,
    medical: HeartPulse,
    crime: ShieldAlert,
    accident: Car,
    infrastructure: Wrench,
  }
  const priorityColors: Record<number, string> = {
    1: '#c8553d',
    2: '#c9893a',
    3: '#4a8c6f',
    4: '#5272a0',
  }
  return (
    <div style={{ 
      perspective: '1000px',
      maxWidth: '600px',
      margin: '0 auto',
    }}>
      <motion.div 
        className="cp-panel"
        style={{ 
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), 0 0 40px rgba(200,85,61,0.1)',
          position: 'relative',
          overflow: 'hidden',
        }}
        initial={{ opacity: 0, rotateX: -20 }}
        whileInView={{ opacity: 1, rotateX: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        whileHover={{ 
          scale: 1.02, 
          rotateY: 2, 
          rotateX: -2, 
          transition: { duration: 0.3 } 
        }}
      >
        {/* Holographic overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `
            linear-gradient(135deg, transparent 25%, rgba(156,183,255,0.1) 50%, transparent 75%),
            linear-gradient(45deg, transparent 40%, rgba(200,168,255,0.08) 50%, transparent 60%),
            radial-gradient(circle at 20% 80%, rgba(200,85,61,0.08) 0%, transparent 50%)
          `,
          pointerEvents: 'none',
          mixBlendMode: 'screen',
        }} />
        
        {/* Animated scanline */}
        <motion.div style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent, rgba(156,183,255,0.5), transparent)',
          filter: 'blur(1px)',
        }} animate={{ top: ['0%', '100%'] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} />

        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-2">
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>
              <AlertOctagon size={24} style={{ color: '#c8553d', textShadow: '0 0 20px rgba(200,85,61,0.5)' }} />
            </motion.div>
            <div>
              <h3 className="text-xl font-bold" style={{ textShadow: '0 0 30px rgba(200,85,61,0.3)' }}>Priority Watch</h3>
              <p className="text-xs text-muted-foreground">Live incident queue by severity</p>
            </div>
          </div>
          <motion.div className="cp-status-dot" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ background: '#4a8c6f', boxShadow: '0 0 20px rgba(74,140,111,0.5)' }} />
        </div>

        <div className="space-y-3 relative z-10">
          {PRIORITY_TASKS.map((task, index) => {
            const Icon = icons[task.type] || ShieldAlert
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -40, rotateY: 15 }}
                whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6, ease: 'easeOut' }}
                whileHover={{ 
                  scale: 1.02, 
                  x: 5, 
                  boxShadow: `0 0 30px ${colors[task.type]}40`,
                  transition: { duration: 0.2 }
                }}
                className="flex items-center gap-4 p-4 rounded-xl border"
                style={{ 
                  borderColor: `${colors[task.type]}30`,
                  background: `linear-gradient(135deg, ${colors[task.type]}10 0%, rgba(255,255,255,0.03) 100%)`,
                  backdropFilter: 'blur(4px)',
                }}
              >
                <motion.div 
                  className="flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm"
                  animate={{ 
                    boxShadow: [
                      `0 0 0 0 ${priorityColors[task.priority]}40`,
                      `0 0 0 8px ${priorityColors[task.priority]}00`
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                  style={{ 
                    background: `${priorityColors[task.priority]}20`, 
                    color: priorityColors[task.priority],
                    border: `2px solid ${priorityColors[task.priority]}50`,
                    textShadow: `0 0 10px ${priorityColors[task.priority]}80`,
                  }}
                >
                  P{task.priority}
                </motion.div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon size={16} style={{ color: colors[task.type], filter: `drop-shadow(0 0 8px ${colors[task.type]}60)` }} />
                    <span className="text-sm font-medium" style={{ textShadow: `0 0 10px ${colors[task.type]}40` }}>{task.title}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      ETA: {task.eta}
                    </span>
                    <motion.span 
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      animate={task.status === 'In Progress' ? { opacity: [1, 0.6, 1] } : {}}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      style={{ 
                        background: task.status === 'In Progress' ? `${colors[task.type]}20` : 'rgba(255,255,255,0.05)',
                        color: task.status === 'In Progress' ? colors[task.type] : 'var(--muted-foreground)',
                        border: `1px solid ${colors[task.type]}40`,
                        textShadow: task.status === 'In Progress' ? `0 0 10px ${colors[task.type]}60` : 'none',
                      }}
                    >
                      {task.status}
                    </motion.span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}

function AlgoQueueViz({ algo }: { algo: typeof ALGO_DATA[0] }) {
  const [active, setActive] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % 5), 1200)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="cp-algo-queue">
      {algo.bars.map((w, i) => (
        <div key={i} className={`cp-algo-bar-row ${i === active ? 'active' : ''}`}>
          <div className="cp-algo-bar-label">P00{i + 1}</div>
          <div className="cp-algo-bar-track">
            <div className="cp-algo-bar-fill"
              style={{ width: `${w}%`, background: algo.color, opacity: i === active ? 1 : 0.4 }}
            />
          </div>
          <div className="cp-algo-bar-val">{w}%</div>
        </div>
      ))}
    </div>
  )
}

function GanttMini({ color }: { color: string }) {
  const blocks = [
    { start: 0, end: 20 }, { start: 25, end: 50 },
    { start: 55, end: 70 }, { start: 72, end: 90 },
  ]
  return (
    <div className="cp-gantt">
      {[0, 1, 2, 3, 4].map(row => (
        <div key={row} className="cp-gantt-row">
          <div className="cp-gantt-label">P00{row + 1}</div>
          <div className="cp-gantt-track">
            {blocks.slice(0, row + 1).map((b, bi) => (
              <div key={bi} className="cp-gantt-block"
                style={{ left: `${b.start}%`, width: `${b.end - b.start}%`, background: color, opacity: row === bi ? 1 : 0.5 }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Landing() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('hero')
  const [activeAlgo, setActiveAlgo] = useState(0)
  const [visibleAlerts, setVisibleAlerts] = useState<string[]>([])
  const [simTimer, setSimTimer] = useState('00:42')
  const pageRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: pageRef })
  const heroY = useTransform(scrollYProgress, [0, 0.15], [0, -120])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])

  useEffect(() => {
    // Dispatch alerts cascade (dedupe + cleanup for React Strict Mode double-mount)
    const alertTimeouts = DISPATCH_ALERTS.map(a =>
      setTimeout(() => {
        setVisibleAlerts(v => (v.includes(a.id) ? v : [...v, a.id]))
      }, a.delay)
    )

    // Sim timer
    let sec = 42
    const timer = setInterval(() => {
      sec++
      const m = String(Math.floor(sec / 60)).padStart(2, '0')
      const s = String(sec % 60).padStart(2, '0')
      setSimTimer(`${m}:${s}`)
    }, 1000)

    // Suppress THREE.Clock deprecation warning (from @react-three/fiber)
    const originalWarn = console.warn
    const warnFilter = (...args: any[]) => {
      if (typeof args[0] === 'string' && args[0].includes('THREE.Clock')) return
      originalWarn(...args)
    }
    console.warn = warnFilter

    let cursorCleanup: any = null

    // GSAP context
    const ctx = gsap.context(() => {

      // ── Reveal all .cp-reveal elements ──
      gsap.utils.toArray<HTMLElement>('.cp-reveal').forEach((el) => {
        gsap.fromTo(el,
          { opacity: 0, y: 50, filter: 'blur(6px)' },
          {
            opacity: 1, y: 0, filter: 'blur(0px)',
            duration: 1, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' }
          }
        )
      })

      // ── Stagger card reveals ──
      gsap.utils.toArray<HTMLElement>('.cp-stagger-group').forEach((group) => {
        const cards = group.querySelectorAll<HTMLElement>('.cp-stagger-child')
        gsap.fromTo(cards,
          { opacity: 0, y: 40, scale: 0.94 },
          {
            opacity: 1, y: 0, scale: 1,
            duration: 0.7, stagger: 0.12, ease: 'power2.out',
            scrollTrigger: { trigger: group, start: 'top 80%' }
          }
        )
      })

      // ── 3D canvas parallax ──
      const scene3dEl = document.getElementById('scene-3d-container')
      if (scene3dEl) {
        gsap.to(scene3dEl, {
          yPercent: 25, scale: 1.1, opacity: 0.5,
          scrollTrigger: {
            trigger: '.cp-page',
            start: 'top top', end: '50% top',
            scrub: 2,
          }
        })
      }

      // ── Section eyebrow counter animations ──
      const animCount = (id: string, target: number, suffix: string, trigger: string) => {
        const el = document.getElementById(id)
        if (!el) return
        gsap.to({ val: 0 }, {
          val: target, duration: 2.5, ease: 'power2.out',
          scrollTrigger: { trigger, start: 'top 80%' },
          onUpdate: function () { el.textContent = Math.round(this.targets()[0].val) + suffix }
        })
      }
      METRICS.forEach(m => animCount(m.id, m.val, m.suffix, '#analytics'))
      animCount('c1', 12847, '+', '#hero')
      animCount('c2', 94, '%', '#hero')
      animCount('c3', 2341, '', '#hero')
      animCount('c4', 18, 'ms', '#hero')

      // ── Metric bars ──
      METRICS.forEach((m, i) => {
        gsap.to(`#mb${i + 1}`, {
          width: `${m.bar}%`, duration: 1.8, ease: 'power3.out',
          scrollTrigger: { trigger: '#analytics', start: 'top 80%' }
        })
      })

      // ── Section active nav tracking ──
      NAV_ITEMS.forEach(({ key }) => {
        const el = document.getElementById(key)
        if (el) {
          ScrollTrigger.create({
            trigger: el, start: 'top 55%', end: 'bottom 55%',
            onToggle: self => { if (self.isActive) setActiveSection(key) }
          })
        }
      })

      // ── Sticky algo panel ──
      gsap.utils.toArray<HTMLElement>('.cp-algo-panel').forEach((panel, i) => {
        gsap.fromTo(panel,
          { opacity: 0, x: i % 2 === 0 ? -60 : 60 },
          {
            opacity: 1, x: 0, duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: panel, start: 'top 82%' }
          }
        )
      })

      // ── Incident cards blur-to-focus ──
      gsap.utils.toArray<HTMLElement>('.cp-incident-card').forEach((card, i) => {
        gsap.fromTo(card,
          { opacity: 0, y: 60, filter: 'blur(10px)' },
          {
            opacity: 1, y: 0, filter: 'blur(0px)',
            duration: 0.8, delay: i * 0.1, ease: 'expo.out',
            scrollTrigger: { trigger: card, start: 'top 90%' }
          }
        )
      })

      // ── Hero heading cinematic clip reveal ──
      gsap.fromTo('.cp-hero-title',
        { clipPath: 'inset(100% 0 0 0)', opacity: 0 },
        { clipPath: 'inset(0% 0 0 0)', opacity: 1, duration: 1.4, ease: 'expo.out', delay: 0.3 }
      )

      // ── Cursor logic ──
      const dot  = document.getElementById('cursor-dot')
      const ring = document.getElementById('cursor-ring')
      let mx = 0, my = 0, rx = 0, ry = 0
      const onMM = (e: MouseEvent) => { mx = e.clientX; my = e.clientY }
      window.addEventListener('mousemove', onMM, { passive: true })
      
      const onTick = () => {
        rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12
        if (dot)  dot.style.transform  = `translate(${mx - 3}px, ${my - 3}px)`
        if (ring) ring.style.transform = `translate(${rx - 14}px, ${ry - 14}px)`
      }
      gsap.ticker.add(onTick)
      
      const hoverEls = document.querySelectorAll<HTMLElement>('button, a, .cp-card, .cp-algo-panel')
      const hoverHandlers = new Map<HTMLElement, { enter: () => void; leave: () => void }>()
      
      hoverEls.forEach(t => {
        const enter = () => { if (ring) gsap.to(ring, { width: 44, height: 44, borderColor: 'rgba(200,85,61,0.7)', duration: 0.2 }) }
        const leave = () => { if (ring) gsap.to(ring, { width: 28, height: 28, borderColor: 'rgba(200,85,61,0.4)', duration: 0.2 }) }
        hoverHandlers.set(t, { enter, leave })
        t.addEventListener('mouseenter', enter)
        t.addEventListener('mouseleave', leave)
      })

      cursorCleanup = { dot, ring, onMM, hoverHandlers, onTick }

    }, pageRef)

    return () => { 
      alertTimeouts.forEach(clearTimeout)
      setVisibleAlerts([])

      // Cleanup cursor tracking
      if (cursorCleanup) {
        window.removeEventListener('mousemove', cursorCleanup.onMM)
        gsap.ticker.remove(cursorCleanup.onTick)
        cursorCleanup.hoverHandlers.forEach((handlers: any, el: HTMLElement) => {
          el.removeEventListener('mouseenter', handlers.enter)
          el.removeEventListener('mouseleave', handlers.leave)
        })
      }
      
      ctx.revert()
      clearInterval(timer)
      console.warn = originalWarn
    }
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main className="cp-root" ref={pageRef}>
      {/* Custom cursor */}
      <div id="cursor-dot"  className="cursor-dot" />
      <div id="cursor-ring" className="cursor-ring" />

      {/* 3D Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <PulseBackground />
      </div>

      {/* HUD Corners have been moved to GlobalHUD component */}

      <div className="cp-page">

        {/* ══════════════════════════════════════════════════
            § 1 — HERO COMMAND CENTER
        ══════════════════════════════════════════════════ */}
        <section id="hero" className="cp-hero">
                      {/* CTA section removed - handled by CinematicCTA */}
          <FloatingParticles />

          {/* Radar */}
          <div className="cp-hero-radar">
            <RadarPulse />
          </div>

          <motion.div className="cp-hero-content" style={{ y: heroY, opacity: heroOpacity }}>
            <div className="cp-hero-eyebrow cp-reveal">
              <span className="cp-status-dot" />
              Emergency Response Scheduling System · ONLINE
            </div>



            <motion.h1 
              className="cp-hero-title"
              style={{ perspective: '1000px' }}
              initial={{ opacity: 0, y: 30, rotateX: -15 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <motion.span 
                className="cp-hero-line1"
                style={{
                  textShadow: '0 0 40px rgba(156,183,255,0.4), 0 0 80px rgba(200,85,61,0.2)',
                }}
                animate={{ 
                  textShadow: [
                    '0 0 40px rgba(156,183,255,0.4), 0 0 80px rgba(200,85,61,0.2)',
                    '0 0 60px rgba(156,183,255,0.6), 0 0 100px rgba(200,85,61,0.3)',
                    '0 0 40px rgba(156,183,255,0.4), 0 0 80px rgba(200,85,61,0.2)',
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                Dispatch Intelligence
              </motion.span>
              <motion.span 
                className="cp-hero-line2"
                style={{
                  textShadow: '0 0 40px rgba(200,85,61,0.4), 0 0 80px rgba(156,183,255,0.2)',
                }}
                animate={{ 
                  textShadow: [
                    '0 0 40px rgba(200,85,61,0.4), 0 0 80px rgba(156,183,255,0.2)',
                    '0 0 60px rgba(200,85,61,0.6), 0 0 100px rgba(156,183,255,0.3)',
                    '0 0 40px rgba(200,85,61,0.4), 0 0 80px rgba(156,183,255,0.2)',
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              >
                Redefined.
              </motion.span>
            </motion.h1>

            <p className="cp-hero-sub cp-reveal">
              A real-time simulation platform applying OS scheduling algorithms —
              FCFS, SJF, Priority, and Round Robin — to emergency incident management
              and tactical dispatch optimization across smart city infrastructure.
            </p>

            <div className="cp-hero-cta cp-reveal">
              <button type="button" className="cp-cta-primary" onClick={() => router.push('/simulation')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <Play size={16} aria-hidden />
                Run Simulation
              </button>
              <button type="button" className="cp-cta-outline" onClick={() => router.push('/login')}>
                Sign In
              </button>
              <button type="button" className="cp-cta-outline" onClick={() => router.push('/admin')}>
                Command Center
              </button>
              <button type="button" className="cp-cta-outline" onClick={() => scrollTo('algorithms')}>
                Explore Algorithms →
              </button>
            </div>

            {/* Live alerts */}
            <div className="cp-hero-alerts">
              <AnimatePresence>
                {visibleAlerts.map(id => {
                  const a = DISPATCH_ALERTS.find(x => x.id === id)!
                  return (
                    <motion.div key={id}
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}>
                      <LiveAlertBadge type={a.type} loc={a.loc} unit={a.unit} />
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

            {/* Stats bar */}
            <div className="cp-hero-stats cp-reveal">
              {[
                { id: 'c1', lbl: 'Incidents Simulated' },
                { id: 'c2', lbl: 'CPU Utilization' },
                { id: 'c3', lbl: 'Algorithms Compared' },
                { id: 'c4', lbl: 'Avg Response Time' },
              ].map(s => (
                <div key={s.id} className="cp-stat">
                  <div className="cp-stat-val"><span id={s.id} className="cp-stat-num">0</span></div>
                  <div className="cp-stat-lbl">{s.lbl}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="cp-scroll-hint">
            <div className="cp-scroll-arrow" />
            SCROLL
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            § 2 — PRIORITY WATCH
        ══════════════════════════════════════════════════ */}
        <section id="priority" className="cp-section" style={{ paddingTop: '4rem' }}>
          <div className="cp-section-inner">
            <div className="cp-eyebrow cp-reveal">02 — Priority Watch</div>
            <h2 className="cp-section-title cp-reveal">Live incident queue<br/>by priority</h2>
            <p className="cp-section-sub cp-reveal">
              All active tasks sorted by criticality — highest priority first
            </p>
            <div className="mt-8 cp-reveal">
              <PriorityWatch />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            § 3 — LIVE INCIDENT MONITORING
        ══════════════════════════════════════════════════ */}
        <section id="incidents" className="cp-section cp-incidents-section">
          <GridOverlay />
          <div className="cp-section-inner">
            <div className="cp-eyebrow cp-reveal">03 — Live Incident Monitoring</div>
            <h2 className="cp-section-title cp-reveal">Every emergency.<br />Ranked and queued.</h2>
            <p className="cp-section-sub cp-reveal">
              Incidents are classified by type, severity, and burst time, then funneled
              into the scheduling engine for real-time dispatch prioritization.
            </p>

            <div className="cp-incident-grid cp-stagger-group">
              {INCIDENT_DATA.map((inc, index) => (
                <motion.div 
                  key={inc.key} 
                  className={`cp-incident-card cp-card cp-stagger-child relative`}
                  style={{ 
                    borderColor: `${inc.color}35`,
                    perspective: '800px',
                  }}
                  initial={{ opacity: 0, y: 40, rotateX: -15 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6, ease: 'easeOut' }}
                  whileHover={{ 
                    scale: 1.05, 
                    rotateY: 5, 
                    rotateX: -5,
                    transition: { duration: 0.3 }
                  }}
                >
                  {/* Glassmorphism background */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(135deg, ${inc.color}15 0%, rgba(255,255,255,0.05) 100%)`,
            backdropFilter: 'blur(4px)',
            borderRadius: 'inherit',
            zIndex: 0,
          }} />
                  
                  {/* Holographic overlay */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: `
                      linear-gradient(45deg, transparent 30%, ${inc.color}10 50%, transparent 70%),
                      radial-gradient(circle at 10% 10%, ${inc.color}08 0%, transparent 50%)
                    `,
                    mixBlendMode: 'screen',
                    pointerEvents: 'none',
                    zIndex: 1,
                  }} />
                  
                  <div className="cp-inc-header relative z-10">
                    <motion.span 
                      className="cp-inc-icon"
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        delay: index * 0.2,
                        ease: 'easeInOut'
                      }}
                      style={{
                        filter: `drop-shadow(0 0 15px ${inc.color}60)`,
                      }}
                    >
                      {inc.icon}
                    </motion.span>
                    <div className="cp-inc-pulse" style={{ background: `${inc.color}30` }}>
                      <motion.div 
                        className="cp-inc-pulse-dot" 
                        style={{ background: inc.color }}
                        animate={{ scale: [1, 1.5, 1], opacity: [1, 0.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                  <div className="cp-inc-name relative z-10" style={{ 
                    color: inc.color, 
                    textShadow: `0 0 20px ${inc.color}60` 
                  }}>
                    {inc.name}
                  </div>
                  <div className="cp-inc-desc relative z-10">{inc.desc}</div>
                  <div className="cp-inc-meta relative z-10">
                    <span className="cp-inc-prio">Priority Tier · {inc.priority}</span>
                    <span className="cp-inc-rate">{inc.rate}%</span>
                  </div>
                  <div className="cp-inc-bar relative z-10">
                    <motion.div 
                      className="cp-inc-bar-fill" 
                      style={{ width: `${inc.rate}%`, background: inc.color }}
                      initial={{ width: '0%' }}
                      whileInView={{ width: `${inc.rate}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, ease: 'easeOut', delay: index * 0.1 + 0.3 }}
                    />
                  </div>
                  {/* Decorative grid corner */}
                  <div className="cp-card-corner tl" />
                  <div className="cp-card-corner br" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            § 4 — AI DISPATCH SIMULATION
        ══════════════════════════════════════════════════ */}
        <section id="dispatch" className="cp-section cp-dispatch-section">
          <div className="cp-section-inner">
            <div className="cp-eyebrow cp-reveal">04 — AI Dispatch Simulation</div>
            <h2 className="cp-section-title cp-reveal">Watch algorithms work<br />in real time.</h2>
            <p className="cp-section-sub cp-reveal">
              The scheduler engine processes incidents through your chosen algorithm,
              producing live Gantt charts, queue state, and performance metrics every tick.
            </p>

            {/* Tactical terminal panel */}
            <motion.div 
              className="cp-terminal cp-reveal"
              style={{
                perspective: '1200px',
                position: 'relative',
                overflow: 'hidden',
              }}
              initial={{ opacity: 0, rotateX: -20, y: 40 }}
              whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              whileHover={{ 
                scale: 1.01, 
                rotateY: 2, 
                rotateX: -1,
                transition: { duration: 0.3 }
              }}
            >
              {/* Glassmorphism background */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.85) 100%)',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(156,183,255,0.2)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), 0 0 60px rgba(156,183,255,0.1)',
            borderRadius: 'inherit',
            zIndex: 0,
          }} />
              
              {/* Holographic overlay */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: `
                  linear-gradient(135deg, transparent 25%, rgba(156,183,255,0.12) 50%, transparent 75%),
                  linear-gradient(45deg, transparent 40%, rgba(200,168,255,0.08) 50%, transparent 60%),
                  radial-gradient(circle at 80% 20%, rgba(74,140,111,0.1) 0%, transparent 50%)
                `,
                pointerEvents: 'none',
                mixBlendMode: 'screen',
                zIndex: 1,
              }} />
              
              {/* Animated scanlines */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(156,183,255,0.03) 2px, rgba(156,183,255,0.03) 4px)',
                pointerEvents: 'none',
                zIndex: 2,
              }} />
              
              <motion.div 
                style={{ position: 'absolute', left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, transparent, rgba(156,183,255,0.6), transparent)', filter: 'blur(2px)' }} 
                animate={{ top: ['0%', '100%'] }} 
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }} 
              />
              
              <div className="cp-terminal-topbar relative z-10" style={{ borderBottom: '1px solid rgba(156,183,255,0.2)' }}>
                <div className="cp-dot r" style={{ boxShadow: '0 0 10px rgba(239,68,68,0.5)' }} />
                <div className="cp-dot y" style={{ boxShadow: '0 0 10px rgba(250,204,21,0.5)' }} />
                <div className="cp-dot g" style={{ boxShadow: '0 0 10px rgba(74,140,111,0.5)' }} />
                <span className="cp-terminal-title" style={{ textShadow: '0 0 15px rgba(156,183,255,0.4)' }}>citypulse-os / scheduler-engine / priority-mode</span>
                <span className="cp-terminal-status">
                  <span className="cp-status-dot online" style={{ boxShadow: '0 0 15px rgba(74,140,111,0.7)' }} />
                  RUNNING · T+<span id="sim-timer">{simTimer}</span>
                </span>
              </div>
              <div className="relative z-10">
                <GridOverlay />
              </div>
              <div className="cp-terminal-body relative z-10">
                {/* Left: Queue */}
                <div className="cp-terminal-left">
                  <div className="cp-term-label">Ready Queue — Priority Scheduling</div>
                  <div className="cp-queue">
                    {(['fire','medical','crime','accident','medical'] as const).map((type, idx) => (
                      <div key={idx} className={`cp-q-item ${type} ${idx === 0 ? 'active' : ''}`}>
                        <span className="cp-q-pid">P00{idx + 1}</span>
                        <span className={`cp-q-badge ${type}`}>{type.toUpperCase()}</span>
                        <div className="cp-q-bar"><div className="cp-q-bar-fill" /></div>
                        <span className="cp-q-burst">B:{[8,3,5,6,4][idx]} · P{[1,2,3,4,1][idx]}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Right: Gantt + metrics */}
                <div className="cp-terminal-right">
                  <div className="cp-term-label">Gantt Timeline — Current Run</div>
                  <div className="cp-mini-gantt">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="cp-mg-row">
                        <div className="cp-mg-label">P00{i}</div>
                        <div className="cp-mg-track">
                          <div className={`cp-mg-block ${i === 1 ? 'active' : ''}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="cp-term-metrics">
                    {[
                      { id: 'm-awt', lbl: 'AVG WAIT',  cls: '' },
                      { id: 'm-cpu', lbl: 'CPU UTIL',  cls: 'highlight' },
                      { id: 'm-ctx', lbl: 'CTX SW',    cls: 'alt' },
                    ].map(m => (
                      <div key={m.id} className="cp-term-metric">
                        <div className={`cp-term-metric-val ${m.cls}`} id={m.id}>--</div>
                        <div className="cp-term-metric-lbl">{m.lbl}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="cp-reveal" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <button type="button" className="cp-cta-primary" onClick={() => router.push('/simulation')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <Play size={16} aria-hidden />
                Launch Live Simulator
              </button>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            § 5 — SCHEDULING ALGORITHM SHOWCASE
        ══════════════════════════════════════════════════ */}
        <section id="algorithms" className="cp-section cp-algo-section">
                      {/* CTA section handled by CinematicCTA component */}
          <div className="cp-section-inner">
            <div className="cp-eyebrow cp-reveal">05 — Scheduling Algorithm Showcase</div>
            <h2 className="cp-section-title cp-reveal">Four strategies.<br />One dispatch system.</h2>
            <p className="cp-section-sub cp-reveal">
              Each algorithm models a different approach to prioritizing emergency incidents.
              Compare their real-world tradeoffs through live animated simulation.
            </p>

            {/* Algo selector tabs */}
            <div className="cp-algo-tabs cp-reveal">
              {ALGO_DATA.map((a, i) => (
                <button key={a.key} className={`cp-algo-tab ${activeAlgo === i ? 'active' : ''}`}
                  style={activeAlgo === i ? { borderColor: a.color, color: a.color, background: `${a.color}15` } : {}}
                  onClick={() => setActiveAlgo(i)}>
                  {a.icon} {a.name}
                </button>
              ))}
            </div>

            {/* Active algo detail panel */}
            <AnimatePresence mode="wait">
              {ALGO_DATA.map((a, i) => activeAlgo === i && (
                <motion.div key={a.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="cp-algo-detail">
                  <div className="cp-algo-info">
                    <div className="cp-algo-number">ALGO / 0{i + 1}</div>
                    <div className="cp-algo-icon-wrap" style={{ borderColor: `${a.color}40`, background: `${a.color}10` }}>
                      {a.icon}
                    </div>
                    <div className="cp-algo-name" style={{ color: a.color }}>{a.name}</div>
                    <div className="cp-algo-full">{a.full}</div>
                    <div className="cp-algo-desc">{a.desc}</div>
                    <div className="cp-algo-tag" style={{ borderColor: `${a.color}40`, color: a.color, background: `${a.color}10` }}>
                      {a.tag}
                    </div>
                    <div className="cp-algo-bg-letter" style={{ color: `${a.color}12` }}>{a.letter}</div>
                  </div>
                  <div className="cp-algo-viz">
                    <div className="cp-algo-viz-label">Queue State Visualization</div>
                    <AlgoQueueViz algo={a} />
                    <div className="cp-algo-viz-label" style={{ marginTop: 24 }}>Gantt Timeline</div>
                    <GanttMini color={a.color} />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* 2x2 grid of all 4 algos (mini cards) */}
            <div className="cp-algo-grid cp-stagger-group" style={{ marginTop: 60 }}>
              {ALGO_DATA.map((a, i) => (
                <div key={a.key} className={`cp-algo-panel cp-card cp-stagger-child`}
                  style={{ borderColor: `${a.color}25` }}
                  onClick={() => setActiveAlgo(i)}>
                  <div className="cp-algo-panel-top-bar" style={{ background: a.color }} />
                  <div className="cp-algo-number">ALGO / 0{i + 1}</div>
                  <div className="cp-algo-icon-wrap">{a.icon}</div>
                  <div className="cp-algo-name">{a.name}</div>
                  <div className="cp-algo-full">{a.full}</div>
                  <div className="cp-algo-desc">{a.desc}</div>
                  <div className="cp-algo-tag" style={{ color: a.color, background: `${a.color}10`, borderColor: `${a.color}30` }}>{a.tag}</div>
                  <div className="cp-algo-bg-letter">{a.letter}</div>
                </div>
              ))}
            </div>

            <div className="cp-reveal" style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <button type="button" className="cp-cta-primary" onClick={() => router.push('/simulation')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <Play size={16} aria-hidden />
                Run FCFS · SJF · Priority · Round Robin
              </button>
              <button type="button" className="cp-cta-outline" onClick={() => router.push('/comparison')}>
                Compare Algorithm Metrics →
              </button>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            § 6 — TACTICAL ANALYTICS DASHBOARD
        ══════════════════════════════════════════════════ */}
        <section id="analytics" className="cp-analytics-section">
          <GridOverlay intensity={0.6} />
          <div className="cp-section-inner">
            <div className="cp-eyebrow metrics-eyebrow cp-reveal">06 — Tactical Analytics Dashboard</div>
            <h2 className="cp-section-title cp-reveal">Mission-critical<br />performance intelligence.</h2>
            <div className="cp-metrics-row cp-stagger-group">
              {METRICS.map((m, i) => (
                <div key={m.id} className="cp-metric-card cp-stagger-child">
                  <div className="cp-metric-glow" style={{ background: `${m.color}15` }} />
                  <div className="cp-metric-val">
                    <span id={m.id}>0</span>
                    <span className="cp-metric-unit">{m.suffix}</span>
                  </div>
                  <div className="cp-metric-lbl">{m.label}</div>
                  <div className="cp-metric-bar">
                    <div className="cp-metric-bar-fill" id={`mb${i + 1}`} style={{ background: m.color }} />
                  </div>
                  <div className="cp-metric-corner" style={{ borderColor: `${m.color}40` }} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            § 7 — ROLE-BASED OPERATIONS CENTER
        ══════════════════════════════════════════════════ */}
        <section id="roles" className="cp-section cp-roles-section">
          <div className="cp-section-inner">

            <div className="cp-eyebrow cp-reveal">07 — Role-Based Operations Center</div>
            <h2 className="cp-section-title cp-reveal">Every operator.<br />Their own command view.</h2>
            <div className="cp-roles-grid cp-stagger-group">
              {ROLES.map(r => (
                <div key={r.title} className="cp-role-card cp-card cp-stagger-child">
                  <div className="cp-role-icon">{r.icon}</div>
                  <div className="cp-role-body">
                    <div className="cp-role-title">{r.title}</div>
                    <div className="cp-role-desc">{r.desc}</div>
                    {/* Duplicate CTA markup removed */}
                    <div className="cp-role-perms">
                      {r.perms.map(p => <span key={p} className="cp-perm">{p}</span>)}
                    </div>
                  </div>
                  <div className="cp-card-corner tl" />
                </div>
              ))}
            </div>
          </div>
        </section>



        {/* ══════════════════════════════════════════════════
            § 7 — FINAL CINEMATIC CTA
        ══════════════════════════════════════════════════ */}

        <section className="cp-cta-section">
          <CinematicCTA
            title="Ready to simulate emergency dispatch?"
            subtitle="Launch the full CityPulse OS dashboard and run your first scheduling comparison. Real-time Gantt charts, live queue state, and algorithm performance metrics await."
            primaryLabel="Run Simulation"
            secondaryLabel="Sign In to Dashboards"
            onPrimaryClick={() => router.push('/simulation')}
            onSecondaryClick={() => router.push('/login')}
          />
        </section>

        {/* Footer */}
        <footer className="cp-footer">
          <div className="cp-footer-logo">CityPulse OS · v2.0</div>
          <div className="cp-footer-copy">Emergency Response Scheduler · OS Project 2025</div>
        </footer>
      </div>
    </main>
  )
}
