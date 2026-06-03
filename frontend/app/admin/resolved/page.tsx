'use client'

import { useEffect, useState } from 'react'
import { Trash2, Flame, ShieldAlert, HeartPulse, Car, RefreshCw, CheckCircle2, MapPin, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { apiFetch } from '@/lib/api'

const TYPE_META: Record<string, { icon: React.ReactNode; color: string }> = {
  fire:           { icon: <Flame size={20} />, color: '#c8553d' },
  police:         { icon: <ShieldAlert size={20} />, color: '#5272a0' },
  medical:        { icon: <HeartPulse size={20} />, color: '#4a8c6f' },
  infrastructure: { icon: <Car size={20} />, color: '#c9893a' },
}

export default function ResolvedCasesPage() {
  const [incidents, setIncidents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchIncidents() }, [])

  async function fetchIncidents() {
    try {
      const res = await apiFetch('/api/admin/resolved')
      if (res.ok) {
        const data = await res.json()
        setIncidents(data.incidents || [])
      }
    } catch (err) {
      console.error('Failed to fetch:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(incidentId: string) {
    try {
      const res = await apiFetch(`/api/admin/incidents/${incidentId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        fetchIncidents()
      }
    } catch (err) {
      console.error('Failed to delete:', err)
    }
  }

  return (
    <div className="space-y-8 relative">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="cp-eyebrow mb-2">
          <span className="cp-status-dot" style={{ background: '#4a8c6f', display: 'inline-block' }} /> RESOLVED CASES ARCHIVE
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">
          Resolved <span className="bg-gradient-to-r from-[#4a8c6f] to-[#5272a0] bg-clip-text text-transparent">Cases</span>
        </h1>
        <p className="text-muted-foreground mt-1">Archived records of all resolved incidents</p>
      </motion.div>

      {/* Stats Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="holo-panel p-6 rounded-2xl border border-white/5 bg-[#121426]/60 backdrop-blur-md"
      >
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-xl bg-[#4a8c6f]/10 border border-[#4a8c6f]/20">
            <CheckCircle2 size={32} style={{ color: '#4a8c6f' }} />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#4a8c6f]">{incidents.length}</div>
            <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Total Resolved Cases</div>
          </div>
          <button
            onClick={fetchIncidents}
            className="ml-auto px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-muted-foreground hover:text-white transition-all flex items-center gap-2"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </motion.div>

      {/* Cases List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="holo-panel p-6 rounded-2xl border border-white/5 bg-[#121426]/60 backdrop-blur-md"
      >
        <div className="flex items-center gap-2 mb-6">
          <Clock size={18} className="text-[#4a8c6f]" />
          <h3 className="text-lg font-bold">Case History</h3>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <RefreshCw className="w-8 h-8 text-primary animate-spin mb-4" />
            <p className="text-sm text-muted-foreground uppercase tracking-widest">Loading archive…</p>
          </div>
        ) : incidents.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground font-mono text-sm">
            No resolved cases in archive yet
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {incidents.map((incident: any, idx: number) => {
                const meta = TYPE_META[incident.type] || TYPE_META.infrastructure
                return (
                  <motion.div
                    key={incident.id || incident._id || idx}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-slate-900/50"
                  >
                    <div className="w-12 h-12 rounded-lg bg-[rgba(74,140,111,0.1)] flex items-center justify-center text-[#4a8c6f]">
                      {meta.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[10px] text-muted-foreground">ID: {incident.id || incident._id}</span>
                        <span className="text-xs font-bold uppercase" style={{ color: meta.color }}>
                          {incident.type.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm font-semibold flex items-center gap-1.5">
                        <MapPin size={12} style={{ color: meta.color }} />
                        {incident.location}
                      </div>
                      {incident.description && (
                        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{incident.description}</p>
                      )}
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <CheckCircle2 size={12} className="text-[#4a8c6f]" />
                          <span className="text-xs font-bold text-[#4a8c6f] uppercase tracking-widest">
                            {incident.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          {incident.createdAt ? new Date(incident.createdAt).toLocaleString() : 'N/A'}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(incident.id || incident._id)}
                        className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-[#c8553d] transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  )
}
