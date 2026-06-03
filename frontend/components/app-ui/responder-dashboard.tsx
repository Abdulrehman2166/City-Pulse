'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Activity, CheckCircle2, MapPin, Radio, RefreshCw, Bell } from 'lucide-react'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { PageHeader } from './page-header'
import { Panel } from './panel'
import { StatGrid, StatTile } from './stat-tile'
import { StatusBadge } from './status-badge'
import { NotificationFeed } from './notification-feed'
import { MotionReveal, MotionRevealItem } from '@/components/pastel/motion-reveal'
import { StateLegend } from '@/components/pulse/state-legend'

type Incident = {
  id: string | number
  type: string
  location: string
  description: string
  status: string
  createdAt: string
}

type ResponderDashboardProps = {
  role: 'police' | 'fire' | 'medical'
  apiPrefix: string
  accentColor?: string
  dotColor?: string
  stateColor?: string
  eyebrow: string
  title: string
  subtitle: string
  pendingLabel?: string
}



export function ResponderDashboard({
  role,
  apiPrefix,
  accentColor = 'var(--state-intelligence)',
  dotColor = 'var(--state-intelligence)',
  stateColor,
  eyebrow,
  title,
  subtitle,
  pendingLabel = 'Pending',
}: ResponderDashboardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userRole = localStorage.getItem('role')
    if (!token) {
      router.push('/login')
      return
    }
    if (userRole !== role) {
      router.push(`/${userRole}`)
      return
    }
    void fetchAssigned()
  }, [router, role])

  async function fetchAssigned() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${apiPrefix}/incidents`, {
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

  async function updateStatus(id: string | number, status: string) {
    setActionLoading(String(id))
    setError('')
    try {
      const res = await fetch(`${apiPrefix}/incidents/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.message || 'Failed to update status')
      await fetchAssigned()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to update status')
    } finally {
      setActionLoading(null)
    }
  }

  const pending = incidents.filter(i => i.status !== 'resolved' && i.status !== 'completed')
  const completed = incidents.filter(i => i.status === 'resolved' || i.status === 'completed')
  const [gridRef] = useAutoAnimate({ duration: 320, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' })

  return (
    <MotionReveal className="space-y-8">
      <MotionRevealItem>
      <PageHeader
        eyebrow={eyebrow}
        title={<>{title} <span style={{ color: stateColor || accentColor }}>Dashboard</span></>}
        subtitle={subtitle}
        accentColor={accentColor}
        dotColor={dotColor}
      />
      <StateLegend className="mt-4" />
      </MotionRevealItem>

      <MotionRevealItem>
      <StatGrid>
        <StatTile label={pendingLabel} value={pending.length} color={stateColor || accentColor} icon={<Radio className="w-5 h-5" />} delay={0} />
        <StatTile label="Completed" value={completed.length} color="var(--state-safe)" icon={<CheckCircle2 className="w-5 h-5" />} delay={0.05} />
        <StatTile label="Dispatch State" value="Ready" color="var(--state-command)" icon={<Activity className="w-5 h-5" />} delay={0.1} />
      </StatGrid>
      </MotionRevealItem>

      <MotionRevealItem>
      <Panel
        title="Assigned Queue"
        icon={<Radio className="animate-pulse" style={{ color: accentColor }} size={20} />}
        headerRight={
          <button type="button" onClick={() => fetchAssigned()} className="cp-btn-ghost">
            <RefreshCw size={14} />
            Refresh
          </button>
        }
      >
        {error && <div className="cp-alert error mb-4">{error}</div>}

        {loading ? (
          <div className="cp-loading">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            Loading…
          </div>
        ) : incidents.length === 0 ? (
          <div className="cp-empty">No assigned cases.</div>
        ) : (
          <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {incidents.map(inc => {
              const isResolving = actionLoading === String(inc.id)
              return (
                <div
                  key={inc.id}
                  className="cp-list-item flex-col min-h-[200px] !items-stretch"
                >
                  <div className="flex justify-between items-start gap-2">
                    <StatusBadge status={inc.status} />
                    <span className="cp-list-meta">#{inc.id}</span>
                  </div>

                  <div className="mt-3 flex-1">
                    <div className="cp-list-title">
                      <MapPin size={13} style={{ color: accentColor }} />
                      {inc.location}
                    </div>
                    {inc.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed mt-2 border-t border-white/5 pt-2">
                        {inc.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {new Date(inc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    {inc.status === 'assigned' && (
                      <button
                        type="button"
                        disabled={isResolving}
                        onClick={() => updateStatus(inc.id, 'dispatched')}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase bg-blue-600 hover:bg-blue-500 text-white transition-all disabled:opacity-60"
                      >
                        {isResolving ? 'Processing…' : 'Dispatch'}
                      </button>
                    )}
                    {inc.status === 'dispatched' && (
                      <button
                        type="button"
                        disabled={isResolving}
                        onClick={() => updateStatus(inc.id, 'arrived')}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase bg-amber-600 hover:bg-amber-500 text-white transition-all disabled:opacity-60"
                      >
                        {isResolving ? 'Processing…' : 'Mark Arrived'}
                      </button>
                    )}
                    {inc.status === 'arrived' && (
                      <button
                        type="button"
                        disabled={isResolving}
                        onClick={() => updateStatus(inc.id, 'resolved')}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase bg-emerald-600 hover:bg-emerald-500 text-white transition-all disabled:opacity-60"
                      >
                        {isResolving ? 'Resolving…' : 'Resolve'}
                      </button>
                    )}
                    {inc.status === 'resolved' && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase">
                        <CheckCircle2 size={12} />
                        Resolved
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Panel>
      </MotionRevealItem>

      <MotionRevealItem>
      <Panel
        title="Incoming Briefings"
        icon={<Bell className="animate-pulse" style={{ color: accentColor }} size={20} />}
      >
        <NotificationFeed role={role} accentColor={accentColor} />
      </Panel>
      </MotionRevealItem>
    </MotionReveal>
  )
}
