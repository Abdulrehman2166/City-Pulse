'use client'

import { useEffect, useState } from 'react'
import { Trash2, Flame, ShieldAlert, HeartPulse, Car, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { apiFetch } from '@/lib/api'

const TYPE_META: Record<string, { icon: React.ReactNode; color: string }> = {
  fire:           { icon: <Flame size={20} />, color: '#c8553d' },
  police:         { icon: <ShieldAlert size={20} />, color: '#c9893a' },
  medical:        { icon: <HeartPulse size={20} />, color: '#4a8c6f' },
  infrastructure: { icon: <AlertTriangle size={20} />, color: '#5272a0' },
}

const cardStyle: React.CSSProperties = {
  padding: '2rem',
  borderRadius: 12,
  border: '1px solid rgba(200,85,61,0.15)',
  background: 'linear-gradient(135deg, rgba(18,20,38,0.9) 0%, rgba(12,14,28,0.85) 100%)',
  backdropFilter: 'blur(8px)',
  position: 'relative',
  overflow: 'hidden',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.6rem 0.75rem',
  borderRadius: 8,
  border: '1px solid rgba(200,85,61,0.2)',
  background: 'rgba(10,10,20,0.6)',
  color: 'var(--foreground)',
  fontSize: '0.85rem',
  outline: 'none',
  transition: 'border-color 0.2s',
}

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<any[]>([])
  const [newIncident, setNewIncident] = useState({ type: 'fire', location: '', description: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchIncidents() }, [])

  async function fetchIncidents() {
    try {
      const res = await apiFetch('/api/incidents')
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

  async function handleReport(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await apiFetch('/api/incidents/report', {
        method: 'POST',
        body: JSON.stringify(newIncident)
      })
      if (res.ok) {
        setNewIncident({ type: 'fire', location: '', description: '' })
        fetchIncidents()
      }
    } catch (err) {
      console.error('Error reporting:', err)
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
      console.error('Error deleting:', err)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="cp-eyebrow" style={{ marginBottom: '0.75rem' }}>
          <span className="cp-status-dot" style={{ background: '#c8553d', display: 'inline-block' }} /> INCIDENT MANAGEMENT
        </div>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800, color: 'var(--foreground)', margin: 0 }}>
          Incident <span style={{ background: 'linear-gradient(90deg, #c8553d, #c9893a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Registry</span>
        </h1>
        <p style={{ color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>Report, track, and manage emergency incidents</p>
      </motion.div>

      {/* Report Form */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}>
        <form onSubmit={handleReport} style={cardStyle}>
          <div className="cp-grid-overlay" style={{ opacity: 0.02 }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '1.25rem', position: 'relative', zIndex: 2 }}>Report Incident</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem', position: 'relative', zIndex: 2 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>Type</label>
              <select
                value={newIncident.type}
                onChange={e => setNewIncident({ ...newIncident, type: e.target.value })}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="fire">Fire</option>
                <option value="police">Police</option>
                <option value="medical">Medical</option>
                <option value="infrastructure">Infrastructure</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>Location</label>
              <input
                type="text"
                value={newIncident.location}
                onChange={e => setNewIncident({ ...newIncident, location: e.target.value })}
                style={inputStyle}
                placeholder="Enter location"
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>Description</label>
              <input
                type="text"
                value={newIncident.description}
                onChange={e => setNewIncident({ ...newIncident, description: e.target.value })}
                style={inputStyle}
                placeholder="Brief description"
              />
            </div>
          </div>
          <button type="submit" className="cp-cta-primary" style={{ padding: '0.65rem 1.75rem', fontSize: '0.85rem', border: 'none', position: 'relative', zIndex: 2 }}>
            ◈ Report Incident
          </button>
          <div className="cp-card-corner tl" />
          <div className="cp-card-corner br" />
        </form>
      </motion.div>

      {/* Incidents List */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}>
        <div style={cardStyle}>
          <div className="cp-grid-overlay" style={{ opacity: 0.02 }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '1.25rem', position: 'relative', zIndex: 2 }}>Recent Incidents</h3>

          {loading ? (
            <div style={{ color: 'var(--muted-foreground)', position: 'relative', zIndex: 2 }}>Loading…</div>
          ) : incidents.length === 0 ? (
            <div style={{ color: 'var(--muted-foreground)', textAlign: 'center', padding: '2rem 0', position: 'relative', zIndex: 2 }}>No incidents reported yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative', zIndex: 2 }}>
              <AnimatePresence>
                {incidents.map((incident: any, idx: number) => {
                  const meta = TYPE_META[incident.type] || TYPE_META.infrastructure
                  return (
                    <motion.div
                      key={incident.id || incident._id || idx}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16 }}
                      transition={{ delay: idx * 0.05, duration: 0.3 }}
                      whileHover={{ x: 4 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '0.875rem 1rem',
                        borderRadius: 10,
                        background: 'rgba(255,255,255,0.025)',
                        border: `1px solid ${meta.color}20`,
                        cursor: 'default',
                        transition: 'background 0.2s',
                      }}
                    >
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${meta.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
                        {meta.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--foreground)' }}>{incident.type.toUpperCase()}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: 2 }}>{incident.location} • {new Date(incident.createdAt).toLocaleString()}</div>
                        {incident.description && <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', marginTop: 2 }}>{incident.description}</div>}
                      </div>
                      <span style={{
                        padding: '0.25rem 0.6rem',
                        borderRadius: 6,
                        background: `${meta.color}15`,
                        color: meta.color,
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        {incident.status || 'pending'}
                      </span>
                      <button
                        onClick={() => handleDelete(incident.id || incident._id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', transition: 'color 0.2s', padding: 4 }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#c8553d')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted-foreground)')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
          <div className="cp-card-corner tl" />
          <div className="cp-card-corner br" />
        </div>
      </motion.div>
    </div>
  )
}
