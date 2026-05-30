'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, CheckCircle2, FileText, MapPin, Radio, RefreshCw, Send } from 'lucide-react'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { PageHeader, Panel, StatusBadge } from '@/components/app-ui'
import { MotionReveal, MotionRevealItem } from '@/components/pastel/motion-reveal'
import { StateLegend } from '@/components/pulse/state-legend'

type Incident = {
  id: number
  type: string
  location: string
  description: string
  status: string
  createdAt: string
}

export default function CitizenDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [error, setError] = useState('')

  const [newType, setNewType] = useState<'fire' | 'police' | 'medical'>('fire')
  const [newLocation, setNewLocation] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reportSuccess, setReportSuccess] = useState(false)

  const token = useMemo(() => (typeof window !== 'undefined' ? localStorage.getItem('token') : null), [])
  const role = useMemo(() => (typeof window !== 'undefined' ? localStorage.getItem('role') : null), [])

  useEffect(() => {
    if (!token) {
      router.push('/login')
      return
    }
    if (role && role !== 'citizen') {
      router.push(`/${role}`)
      return
    }
    void fetchMine()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchMine() {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/citizen/incidents', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.message || 'Failed to load incidents')
      setIncidents(body.incidents || [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load incidents')
    } finally {
      setLoading(false)
    }
  }

  async function handleReport(e: React.FormEvent) {
    e.preventDefault()
    if (!newLocation.trim()) return
    setIsSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/citizen/incidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ type: newType, location: newLocation, description: newDesc }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.message || 'Failed to report incident')
      setNewLocation('')
      setNewDesc('')
      setReportSuccess(true)
      setTimeout(() => setReportSuccess(false), 3500)
      await fetchMine()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to report incident')
    } finally {
      setIsSubmitting(false)
    }
  }

  const [listRef] = useAutoAnimate({ duration: 320, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' })

  return (
    <div className="relative">
      <MotionReveal className="space-y-8">
        <MotionRevealItem>
        <PageHeader
        eyebrow="Citizen Safety Hub · Personal Reports"
        title={
          <>
            <>Citizen <span style={{ background: 'var(--gradient-brand)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Dashboard</span></>
          </>
        }
        subtitle="Report emergencies, track response status, and view your personal reports only."
        dotColor="var(--state-stable)"
      />
      <StateLegend className="mt-4" />
      </MotionRevealItem>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <MotionRevealItem className="lg:col-span-1">
          <Panel title="Report Emergency" icon={<AlertCircle size={18} />} accent accentColor="var(--state-crisis)">
            <form onSubmit={handleReport} className="space-y-4">
              <div>
                <label className="cp-label">Category</label>
                <div className="cp-chip-group">
                  {(['fire', 'police', 'medical'] as const).map(k => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setNewType(k)}
                      className={`cp-chip ${newType === k ? 'active' : ''}`}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="cp-label">Location</label>
                <div className="relative">
                  <MapPin className="cp-input-icon w-4 h-4 text-primary/70" />
                  <input
                    value={newLocation}
                    onChange={e => setNewLocation(e.target.value)}
                    placeholder="e.g. Sector 7-B, Downtown"
                    required
                    className="cp-input cp-input-with-icon"
                  />
                </div>
              </div>

              <div>
                <label className="cp-label">Description</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-4 h-4 text-primary/70 pointer-events-none" />
                  <textarea
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    rows={3}
                    placeholder="What happened?"
                    className="cp-textarea pl-10"
                  />
                </div>
              </div>

              <AnimatePresence>
                {reportSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="cp-alert success flex items-center gap-2"
                  >
                    <CheckCircle2 size={16} />
                    Report accepted and dispatched.
                  </motion.div>
                )}
              </AnimatePresence>

              {error && <div className="cp-alert error">{error}</div>}

              <button type="submit" disabled={isSubmitting} className="cp-btn-primary w-full">
                <Send size={16} />
                {isSubmitting ? 'Submitting…' : 'Submit Report'}
              </button>
            </form>
          </Panel>
        </MotionRevealItem>

        <MotionRevealItem className="lg:col-span-2">
          <Panel
            title="My Reports"
            icon={<Radio className="text-primary animate-pulse" size={20} />}
            headerRight={
              <button type="button" onClick={() => fetchMine()} className="cp-btn-ghost">
                <RefreshCw size={14} />
                Refresh
              </button>
            }
          >
            {loading ? (
              <div className="cp-loading">
                <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                Loading…
              </div>
            ) : incidents.length === 0 ? (
              <div className="cp-empty">No personal reports yet.</div>
            ) : (
              <div ref={listRef} className="cp-list">
                {incidents.map(inc => (
                  <div key={inc.id} className="cp-list-item">
                    <div>
                      <div className="cp-list-meta">ID: 00{inc.id} · {inc.type.toUpperCase()}</div>
                      <div className="cp-list-title">
                        <MapPin size={12} className="text-primary" />
                        {inc.location}
                      </div>
                      {inc.description && (
                        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{inc.description}</p>
                      )}
                    </div>
                    <StatusBadge status={inc.status} />
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </MotionRevealItem>
      </div>
    </MotionReveal>
    </div>
  )
}
