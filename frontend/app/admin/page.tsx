'use client'

import { useEffect, useState } from 'react'
import { 
  Flame, ShieldAlert, HeartPulse, Car, Plus, Send, 
  CheckCircle2, Radio, Activity, Users, LayoutDashboard, 
  MapPin, FileText, Clock, RefreshCw, AlertCircle,
  TrendingUp, TrendingDown
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import CinematicCTA from '@/components/CinematicCTA'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function AdminDashboard() {
  const [role, setRole] = useState('')
  const [incidents, setIncidents] = useState<any[]>([])
  const [stats, setStats] = useState({ incidents: 0, users: 5, active: 0 })
  const [loading, setLoading] = useState(true)
  
  // Citizen Form state
  const [newType, setNewType] = useState('fire')
  const [newLocation, setNewLocation] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [reportSuccess, setReportSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Action loading state
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  const router = useRouter()

  useEffect(() => {
    const userRole = localStorage.getItem('role')
    setRole(userRole || 'user')
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const res = await fetch('/api/incidents')
      if (res.ok) {
        const data = await res.json()
        setIncidents(data.incidents || [])
        setStats(prev => ({ 
          ...prev, 
          incidents: data.incidents?.length || 0,
          active: data.incidents?.filter((i: any) => i.status !== 'resolved').length || 0
        }))
      }
    } catch (err) {
      console.error('Failed to fetch incidents:', err)
    } finally {
      setLoading(false)
    }
  }

  // Handle status update for responders
  async function handleStatusUpdate(id: number, newStatus: string) {
    setActionLoading(id.toString())
    try {
      const res = await fetch(`/api/incidents/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        await fetchData()
      }
    } catch (err) {
      console.error('Failed to update status:', err)
    } finally {
      setActionLoading(null)
    }
  }

  // Handle reporting emergency for Citizen
  async function handleReportEmergency(e: React.FormEvent) {
    e.preventDefault()
    if (!newLocation.trim()) return
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/incidents/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: newType,
          location: newLocation,
          description: newDesc,
          reporter: 'user1'
        })
      })
      if (res.ok) {
        setNewLocation('')
        setNewDesc('')
        setReportSuccess(true)
        setTimeout(() => setReportSuccess(false), 4000)
        await fetchData()
      }
    } catch (err) {
      console.error('Failed to report incident:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <RefreshCw className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-sm text-muted-foreground uppercase tracking-widest">Loading Dashboard Core…</p>
      </div>
    )
  }

  // Helper colors for types
  const departmentConfig = {
    fire: { label: 'Fire Department', color: '#c8553d', icon: <Flame className="w-5 h-5" />, bg: 'rgba(200,85,61,0.1)' },
    police: { label: 'Police Force', color: '#5272a0', icon: <Car className="w-5 h-5" />, bg: 'rgba(82,114,160,0.1)' },
    medical: { label: 'Medical Squad', color: '#4a8c6f', icon: <HeartPulse className="w-5 h-5" />, bg: 'rgba(74,140,111,0.1)' },
    infrastructure: { label: 'Infrastructure Support', color: '#c9893a', icon: <ShieldAlert className="w-5 h-5" />, bg: 'rgba(201,137,58,0.1)' }
  }

  // =========================================================================
  // 1. CITIZEN HUB (user role)
  // =========================================================================
  if (role === 'user') {
    return (
      <div className="space-y-8 relative">
        {/* Scifi Ambient Overlay */}
        <div className="scanline-overlay" />
        <div className="radar-pulse" />

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="cp-eyebrow mb-2">
            <span className="cp-status-dot bg-[#4a8c6f]" /> CITIZEN SAFETY HUB · LIVE COORDINATES
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            Citizen <span className="bg-linear-to-r from-[#c8553d] to-[#c9893a] bg-clip-text text-transparent">Portal</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Report local emergencies and track active response dispatches in real-time.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Report Form */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="holo-panel p-6 rounded-2xl border border-[rgba(200,85,61,0.2)] bg-[#121426]/80 backdrop-blur-md relative overflow-hidden"
            >
              <div className="cp-card-corner tl" />
              <div className="cp-card-corner br" />
              
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <AlertCircle className="text-[#c8553d]" size={20} />
                Report Incident
              </h3>

              <form onSubmit={handleReportEmergency} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1.5">Emergency Category</label>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.keys(departmentConfig).map((key) => {
                      const isActive = newType === key
                      const cfg = departmentConfig[key as keyof typeof departmentConfig]
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setNewType(key)}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all text-xs font-semibold ${
                            isActive 
                              ? 'border-[#c8553d] bg-[rgba(200,85,61,0.15)] text-[#ff9966]'
                              : 'border-white/10 bg-white/[0.02] text-muted-foreground hover:border-[#c8553d]/30'
                          }`}
                        >
                          <span className="mb-1 text-base">{cfg.icon}</span>
                          <span className="scale-90 capitalize">{key}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1.5">Location Coordinate</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c8553d]" />
                    <input
                      type="text"
                      value={newLocation}
                      onChange={e => setNewLocation(e.target.value)}
                      placeholder="e.g. Sector 7-B, Downtown"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-slate-900/60 text-sm outline-none focus:border-[#c8553d] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1.5">Incident Description</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-4 h-4 text-[#c8553d]" />
                    <textarea
                      value={newDesc}
                      onChange={e => setNewDesc(e.target.value)}
                      placeholder="Detail the emergency burst capacity..."
                      rows={3}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-slate-900/60 text-sm outline-none focus:border-[#c8553d] transition-all"
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {reportSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="p-3 bg-[rgba(74,140,111,0.15)] border border-[#4a8c6f] text-[#4a8c6f] text-xs font-semibold rounded-lg flex items-center gap-2"
                    >
                      <CheckCircle2 size={16} />
                      Report successfully transmitted to CPU queue.
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-linear-to-r from-[#c8553d] to-[#c9893a] text-white font-bold text-sm shadow-[0_4px_15px_rgba(200,85,61,0.3)] transition-opacity hover:opacity-90"
                >
                  <Send size={16} />
                  {isSubmitting ? 'Transmitting…' : 'Transmit Emergency Report'}
                </motion.button>
              </form>
            </motion.div>
          </div>

          {/* Right Column: Incident List */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="holo-panel p-6 rounded-2xl border border-white/5 bg-[#121426]/60 backdrop-blur-md relative"
            >
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Radio className="text-[#c8553d] animate-pulse" size={20} />
                My Incident Feeds
              </h3>

              <div className="space-y-4 max-h-[480px] overflow-y-auto pr-2">
                {incidents.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground font-mono text-xs">
                    No active emergency broadcasts reported.
                  </div>
                ) : (
                  incidents.map((inc) => {
                    const cfg = departmentConfig[inc.type as keyof typeof departmentConfig] || departmentConfig.fire
                    return (
                      <motion.div
                        key={inc.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-xl border border-white/5 bg-slate-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 rounded-lg bg-white/[0.03] text-glow-ember" style={{ color: cfg.color }}>
                            {cfg.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] text-muted-foreground">ID: 00{inc.id}</span>
                              <span className="text-xs font-bold uppercase" style={{ color: cfg.color }}>{cfg.label}</span>
                            </div>
                            <div className="text-sm font-semibold mt-1 flex items-center gap-1.5">
                              <MapPin size={12} style={{ color: cfg.color }} />
                              {inc.location}
                            </div>
                            {inc.description && <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{inc.description}</p>}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end md:self-center">
                          <div className="flex items-center gap-1.5">
                            <Clock size={12} className="text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {new Date(inc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                            inc.status === 'resolved' 
                              ? 'bg-[rgba(74,140,111,0.15)] text-[#4a8c6f]' 
                              : inc.status === 'in progress'
                                ? 'bg-[rgba(82,114,160,0.15)] text-[#5272a0]'
                                : 'bg-[rgba(200,85,61,0.15)] text-[#c8553d] border border-[rgba(200,85,61,0.2)]'
                          }`}>
                            {inc.status}
                          </span>
                        </div>
                      </motion.div>
                    )
                  })
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  // =========================================================================
  // 2. RESPONDER THREAD TERMINAL (fire, police, medical roles)
  // =========================================================================
  if (['fire', 'police', 'medical'].includes(role)) {
    const isFire = role === 'fire'
    const isPolice = role === 'police'
    const myConfig = departmentConfig[role as keyof typeof departmentConfig]
    
    // Filter incidents belonging strictly to this department core
    const myIncidents = incidents.filter(inc => inc.type === role)
    const pendingIncidents = myIncidents.filter(inc => inc.status !== 'resolved')
    const completedIncidents = myIncidents.filter(inc => inc.status === 'resolved')

    return (
      <div className="space-y-8 relative">
        <div className="scanline-overlay" />
        <div className="radar-pulse" />

        {/* Dynamic header themed by department */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="cp-eyebrow mb-2" style={{ color: myConfig.color }}>
            <span className="cp-status-dot animate-ping" style={{ background: myConfig.color }} /> 
            CORE INTERFACE ACCESS · {myConfig.label.toUpperCase()} THREAD
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            {myConfig.label} <span style={{ color: myConfig.color }}>Terminal</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Process scheduled emergency queues, dispatch units, and complete tactical threads.
          </p>
        </motion.div>

        {/* Tactical departmental overview stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Pending Incidents', value: pendingIncidents.length, color: myConfig.color, icon: myConfig.icon },
            { label: 'Completed Threads', value: completedIncidents.length, color: '#4a8c6f', icon: <CheckCircle2 className="w-5 h-5" /> },
            { label: 'Active Dispatch State', value: 'Ready', color: '#5272a0', icon: <Activity className="w-5 h-5" /> }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="holo-panel p-5 rounded-xl border border-white/5 bg-[#121426]/75 relative overflow-hidden"
            >
              <div className="flex justify-between items-center relative z-20">
                <div>
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{item.label}</span>
                  <div className="text-3xl font-extrabold mt-1" style={{ color: item.color }}>{item.value}</div>
                </div>
                <div className="p-3 rounded-lg bg-white/[0.02]" style={{ color: item.color }}>
                  {item.icon}
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: item.color, opacity: 0.6 }} />
            </motion.div>
          ))}
        </div>

        {/* Assigned Dispatch Queue */}
        <div className="holo-panel p-6 rounded-2xl border border-white/5 bg-[#121426]/60 backdrop-blur-md relative">
          <div className="cp-card-corner tl" />
          <div className="cp-card-corner br" />

          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Radio className="animate-pulse" style={{ color: myConfig.color }} size={20} />
            Queue Thread Dispatcher
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myIncidents.length === 0 ? (
              <div className="col-span-full py-16 text-center text-muted-foreground font-mono text-xs">
                No active incidents scheduled on this dispatch thread.
              </div>
            ) : (
              myIncidents.map((inc, i) => {
                const isResolving = actionLoading === inc.id.toString()
                return (
                  <motion.div
                    key={inc.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-5 rounded-xl border border-white/5 bg-[#1a1c32]/60 hover:bg-[#1a1c32]/85 transition-all flex flex-col justify-between min-h-[220px] relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-2.5 font-mono text-[9px] text-muted-foreground bg-white/[0.02]">
                      #00{inc.id}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider ${
                          inc.status === 'resolved' 
                            ? 'bg-emerald-500/20 text-emerald-400' 
                            : inc.status === 'in progress'
                              ? 'bg-blue-500/20 text-blue-400 animate-pulse'
                              : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {inc.status}
                        </span>
                      </div>

                      <h4 className="text-sm font-extrabold flex items-center gap-1.5">
                        <MapPin size={13} style={{ color: myConfig.color }} />
                        {inc.location}
                      </h4>
                      {inc.description && (
                        <p className="text-xs text-muted-foreground leading-relaxed mt-2.5 border-t border-white/[0.04] pt-2">
                          {inc.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-6 border-t border-white/5 pt-4 flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {new Date(inc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>

                      {/* Status quick trigger buttons */}
                      {inc.status === 'reported' && (
                        <button
                          disabled={isResolving}
                          onClick={() => handleStatusUpdate(inc.id, 'in progress')}
                          className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase bg-blue-600 hover:bg-blue-500 text-white cursor-pointer transition-all"
                        >
                          {isResolving ? 'Processing…' : 'Dispatch'}
                        </button>
                      )}

                      {inc.status === 'in progress' && (
                        <button
                          disabled={isResolving}
                          onClick={() => handleStatusUpdate(inc.id, 'resolved')}
                          className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer transition-all shadow-[0_0_10px_rgba(16,185,129,0.3)] animate-pulse"
                        >
                          {isResolving ? 'Resolving…' : 'Complete'}
                        </button>
                      )}

                      {inc.status === 'resolved' && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase">
                          <CheckCircle2 size={12} />
                          Resolved
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
        </div>
      </div>
    )
  }

  // =========================================================================
  // 3. ADMIN PANEL (admin role)
  // =========================================================================
  const cards = [
    { label: 'Total Incidents', value: stats.incidents, icon: <Flame size={32} />, color: '#c8553d', trend: 12, positive: false },
    { label: 'Active Threads', value: stats.active, icon: <Users size={32} />, color: '#5272a0', trend: 5, positive: true },
    { label: 'System Kernel', value: 'Online', icon: <Activity size={32} />, color: '#4a8c6f', trend: 100, positive: true },
  ]

  const activityItems = incidents.slice(0, 4).map((inc) => {
    const cfg = departmentConfig[inc.type as keyof typeof departmentConfig] || departmentConfig.fire
    return {
      icon: cfg.icon,
      text: `${cfg.label} Incident at ${inc.location} is currently ${inc.status}`,
      time: new Date(inc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      color: cfg.color
    }
  })

  // Default Mock data in case no incidents recorded
  const finalActivityItems = activityItems.length ? activityItems : [
    { icon: <Flame size={20} />, text: 'Fire incident reported — Downtown Sector 7', time: '2m ago', color: '#c8553d' },
    { icon: <Car size={20} />, text: 'Police unit dispatched — Main Street', time: '5m ago', color: '#5272a0' },
    { icon: <HeartPulse size={20} />, text: 'Medical team en route — Central Hospital', time: '8m ago', color: '#4a8c6f' },
  ]

  const chartData = [
    { name: 'Fire', incidents: incidents.filter(i => i.type === 'fire').length || 4 },
    { name: 'Medical', incidents: incidents.filter(i => i.type === 'medical').length || 6 },
    { name: 'Crime', incidents: incidents.filter(i => i.type === 'police').length || 3 },
    { name: 'Infra', incidents: incidents.filter(i => i.type === 'infrastructure').length || 2 },
  ]
  return (
    <div style={{ position: 'relative' }}>
      <div className="scanline-overlay" />
      <div className="radar-pulse" />
      <div className="rotating-ring" />
      <div className="emergency-indicator" />
      <div className="reactive-signal" />

      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: '2.5rem' }}
      >
        <div className="cp-eyebrow" style={{ marginBottom: '0.75rem' }}>
          <span className="cp-status-dot" style={{ background: '#4a8c6f', display: 'inline-block' }} /> KERNEL COMMAND CENTER · LIVE
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, lineHeight: 1.15, color: 'var(--foreground)', margin: 0 }}>
          System <span style={{ background: 'linear-gradient(90deg, #c8553d, #c9893a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Console</span>
        </h1>
        <p style={{ color: 'var(--muted-foreground)', marginTop: '0.5rem', fontSize: '1.05rem' }}>
          Root level simulation configuration and thread load dispatching.
        </p>
      </motion.div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {cards.map((card, i) => (
          <motion.div className="holo-panel"
            key={card.label}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            style={{
              position: 'relative',
              padding: '1.75rem',
              borderRadius: 12,
              border: `1px solid ${card.color}30`,
              background: 'linear-gradient(135deg, rgba(24,26,45,0.85) 0%, rgba(24,26,45,0.6) 100%)',
              backdropFilter: 'blur(8px)',
              overflow: 'hidden',
              cursor: 'default',
              transition: 'border-color 0.3s',
            }}
          >
            <div style={{ position: 'absolute', top: 0, right: 0, width: 120, height: 120, background: `radial-gradient(circle, ${card.color}15 0%, transparent 70%)`, borderRadius: '50%', transform: 'translate(30%, -30%)' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>{card.label}</div>
                <div style={{ fontSize: '2.25rem', fontWeight: 800, color: card.color }}>{card.value}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', fontSize: '0.8rem', fontWeight: 600, color: card.positive ? '#4a8c6f' : '#c8553d' }}>
                  {card.positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {card.trend}% {card.positive ? 'increase' : 'decrease'}
                </div>
              </div>
              <div style={{ fontSize: '2.5rem' }}>{card.icon}</div>
            </div>

            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: card.color, opacity: 0.6 }} />
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        style={{
          padding: '2rem',
          borderRadius: 12,
          border: '1px solid rgba(200,85,61,0.15)',
          background: 'linear-gradient(135deg, rgba(24,26,45,0.85) 0%, rgba(24,26,45,0.6) 100%)',
          backdropFilter: 'blur(8px)',
          marginBottom: '2.5rem',
        }}
      >
        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '1.5rem' }}>Core Activity Dispatcher</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {finalActivityItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.08, duration: 0.4 }}
              whileHover={{ x: 4 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.875rem 1rem',
                borderRadius: 10,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(200,85,61,0.08)',
                cursor: 'pointer',
                transition: 'background 0.2s, border-color 0.2s',
              }}
            >
              <div style={{
                width: 42, height: 42, borderRadius: 10,
                background: `${item.color}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.4rem', flexShrink: 0,
                color: item.color
              }}>
                {item.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--foreground)' }}>{item.text}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: 2 }}>{item.time}</div>
              </div>
              <div style={{
                width: 8, height: 8, borderRadius: '50%', background: item.color,
                animation: 'pulse 2s infinite',
              }} />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Response Time + Chart */}
      <div className="parallax-bg" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {/* Response Time */}
        <motion.div className="holo-panel scroll-fade-blur"
          initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ delay: 0.45, duration: 0.5 }}
          whileHover={{ y: -4 }}
          style={{
            padding: '2rem',
            borderRadius: 12,
            border: '1px solid rgba(74,140,111,0.25)',
            background: 'linear-gradient(135deg, rgba(24,26,45,0.85) 0%, rgba(24,26,45,0.6) 100%)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '1rem' }}>Response Time (Avg)</div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <span style={{ fontSize: '3.5rem', fontWeight: 800, color: '#4a8c6f' }}>2.3</span>
            <span style={{ fontSize: '1.5rem', color: 'var(--muted-foreground)', marginLeft: 4 }}>min</span>
          </motion.div>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>Last 24 hours — 18% faster than last week</div>
          <div style={{ marginTop: '1rem', height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: '72%', height: '100%', background: '#4a8c6f', borderRadius: 2 }} />
          </div>
        </motion.div>

        {/* Incident Distribution chart */}
        <motion.div className="holo-panel"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          whileHover={{ y: -4 }}
          style={{
            padding: '2rem',
            borderRadius: 12,
            border: '1px solid rgba(200,85,61,0.15)',
            background: 'linear-gradient(135deg, rgba(24,26,45,0.85) 0%, rgba(24,26,45,0.6) 100%)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '1rem' }}>Incident Distribution</div>
          <div style={{ height: 200, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.35)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.35)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(200,85,61,0.08)' }}
                  contentStyle={{ backgroundColor: 'rgba(24,26,45,0.95)', border: '1px solid rgba(200,85,61,0.3)', borderRadius: 8, color: 'var(--foreground)', backdropFilter: 'blur(8px)' }}
                />
                <Bar dataKey="incidents" fill="#c8553d" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Cinematic CTA */}
      <CinematicCTA
        title="Ready to configure scheduler simulations?"
        subtitle="Manage dispatch tasks, compare algorithms, and monitor ready queues."
        primaryLabel="Launch Simulator"
        secondaryLabel="Compare Algorithms"
        onPrimaryClick={() => router.push('/simulation')}
        onSecondaryClick={() => router.push('/comparison')}
      />
    </div>
  )
}
