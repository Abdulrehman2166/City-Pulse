'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, BellRing, CheckCircle2, RefreshCw, Shield, AlertTriangle, Info, Zap, X } from 'lucide-react'
import { apiFetch } from '@/lib/api'

type Notification = {
  id: number
  recipientRole: string
  incidentId: number | string
  kind: 'direct_briefing' | 'admin_adr' | 'system_decision_log'
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  adrState: 'pending' | 'admin_resolved' | 'system_resolved' | 'none'
  read: boolean
  createdAt: string
  headline: string
  content: string
  meta: {
    location?: string
    type?: string
    pid?: string
    burstTime?: number
    severity?: string
    priorityLabel?: string
    timestamp?: string
    color?: string
    activeCount?: number
    recommendedPID?: string
    recommendedRole?: string
    processes?: ProcessMeta[]
  }
}

type ProcessMeta = {
  pid: string
  type: string
  location: string
  status: string
  severity: string
  burstTime: number
  priority: number
  priorityLabel: string
  createdAt: string
}

type NotificationFeedProps = {
  role: string
  accentColor?: string
  compact?: boolean
}

const SEVERITY_CONFIG = {
  CRITICAL: { bg: 'rgba(255,68,68,0.08)', border: 'rgba(255,68,68,0.3)', text: '#FF6B6B', icon: <AlertTriangle size={14} />, badge: 'bg-red-500/20 text-red-400' },
  HIGH:     { bg: 'rgba(255,140,0,0.08)', border: 'rgba(255,140,0,0.3)',  text: '#FFA733', icon: <Zap size={14} />,          badge: 'bg-orange-500/20 text-orange-400' },
  MEDIUM:   { bg: 'rgba(255,215,0,0.06)', border: 'rgba(255,215,0,0.2)',  text: '#FFD700', icon: <Info size={14} />,         badge: 'bg-yellow-500/20 text-yellow-400' },
  LOW:      { bg: 'rgba(74,140,111,0.06)',border: 'rgba(74,140,111,0.2)', text: '#4a8c6f', icon: <Shield size={14} />,       badge: 'bg-emerald-500/20 text-emerald-400' },
}

const KIND_LABELS = {
  direct_briefing:    { label: 'DIRECT BRIEFING', color: '#5272a0' },
  admin_adr:          { label: 'ADR ALERT',        color: '#c8553d' },
  system_decision_log:{ label: 'SYS LOG',          color: '#4a8c6f' },
}

export function NotificationFeed({ role, accentColor = '#5272a0', compact = false }: NotificationFeedProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<number | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await apiFetch('/api/notifications?includeRead=true')
      const body = await res.json()
      if (!res.ok) throw new Error(body.message || 'Failed to load notifications')
      setNotifications(body.notifications || [])
      setUnreadCount((body.notifications || []).filter((n: Notification) => !n.read).length)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchNotifications()
    // Poll every 15 seconds for new notifications
    const interval = setInterval(fetchNotifications, 15000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  async function markRead(id: number) {
    try {
      await apiFetch(`/api/notifications/${id}/read`, {
        method: 'PUT'
      })
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch { /* ignore */ }
  }

  if (loading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center gap-3 py-8 text-muted-foreground">
        <RefreshCw size={16} className="animate-spin" />
        <span className="text-xs font-mono uppercase tracking-widest">Loading notification feeds…</span>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {unreadCount > 0 ? (
            <BellRing size={16} style={{ color: accentColor }} className="animate-pulse" />
          ) : (
            <Bell size={16} className="text-muted-foreground" />
          )}
          <span className="text-xs font-mono font-bold uppercase tracking-widest" style={{ color: unreadCount > 0 ? accentColor : 'var(--muted-foreground)' }}>
            Notification Feed
          </span>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-1.5 py-0.5 rounded-full text-[9px] font-bold font-mono text-white"
              style={{ background: accentColor }}
            >
              {unreadCount} NEW
            </motion.span>
          )}
        </div>
        <button
          type="button"
          onClick={fetchNotifications}
          className="cp-btn-ghost text-[10px] gap-1"
        >
          <RefreshCw size={12} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="text-xs text-red-400 font-mono bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-3">
          {error}
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <Bell size={28} className="mx-auto mb-2 opacity-30" />
          <p className="text-xs font-mono uppercase tracking-widest">No notifications for this session</p>
          <p className="text-[10px] text-muted-foreground/50 mt-1">Notifications appear here when incidents are reported</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {notifications.map((notif) => {
              const sevCfg = SEVERITY_CONFIG[notif.severity] || SEVERITY_CONFIG.MEDIUM
              const kindCfg = KIND_LABELS[notif.kind] || KIND_LABELS.direct_briefing
              const isExpanded = expanded === notif.id
              const isADR = notif.kind === 'admin_adr'

              return (
                <motion.div
                  key={notif.id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  style={{
                    background: sevCfg.bg,
                    border: `1px solid ${notif.read ? 'rgba(255,255,255,0.05)' : sevCfg.border}`,
                  }}
                  className={`rounded-xl overflow-hidden transition-all cursor-pointer ${!notif.read ? 'shadow-sm' : 'opacity-70'}`}
                  onClick={() => {
                    setExpanded(isExpanded ? null : notif.id)
                    if (!notif.read) markRead(notif.id)
                  }}
                >
                  {/* Notification Header */}
                  <div className="flex items-start gap-3 p-3">
                    {/* Severity indicator strip */}
                    <div
                      className="w-0.5 self-stretch rounded-full flex-shrink-0"
                      style={{ background: sevCfg.text }}
                    />

                    <div className="flex-1 min-w-0">
                      {/* Top row: kind badge + severity + time */}
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span
                          className="text-[8px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
                          style={{ background: `${kindCfg.color}20`, color: kindCfg.color }}
                        >
                          {kindCfg.label}
                        </span>
                        <span className={`text-[8px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${sevCfg.badge}`}>
                          {notif.severity}
                        </span>
                        {!notif.read && (
                          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: sevCfg.text }} />
                        )}
                        <span className="text-[9px] text-muted-foreground/60 font-mono ml-auto">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Headline */}
                      <div className="text-xs font-bold font-mono truncate" style={{ color: sevCfg.text }}>
                        {notif.headline}
                      </div>

                      {/* Meta row */}
                      <div className="flex items-center gap-3 mt-1">
                        {notif.meta?.pid && (
                          <span className="text-[9px] font-mono text-muted-foreground/60">PID #{notif.meta.pid}</span>
                        )}
                        {notif.meta?.location && (
                          <span className="text-[9px] font-mono text-muted-foreground/60 truncate">📍 {notif.meta.location}</span>
                        )}
                        {notif.meta?.burstTime && (
                          <span className="text-[9px] font-mono text-muted-foreground/60">⚡ {notif.meta.burstTime}u burst</span>
                        )}
                      </div>
                    </div>

                    {/* Expand/collapse indicator */}
                    <motion.div
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                      className="text-muted-foreground/40 flex-shrink-0 mt-1"
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                        <path d="M4.5 2L8.5 6L4.5 10" stroke="currentColor" strokeWidth="1.5" fill="none" />
                      </svg>
                    </motion.div>
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-white/5"
                      >
                        <div className="p-3 pt-2 space-y-3">
                          {/* Full message content */}
                          <p className="text-[11px] text-muted-foreground leading-relaxed font-mono">
                            {notif.content}
                          </p>

                          {/* ADR: Process table */}
                          {isADR && notif.meta?.processes && (
                            <div className="space-y-1.5">
                              <div className="text-[9px] font-mono font-bold text-muted-foreground/60 uppercase tracking-widest">
                                Active Process Table ({notif.meta.activeCount} entries)
                              </div>
                              {notif.meta.processes.map((proc) => (
                                <div
                                  key={proc.pid}
                                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-[10px] font-mono"
                                  style={{
                                    background: `${SEVERITY_CONFIG[proc.severity as keyof typeof SEVERITY_CONFIG]?.text || '#888'}10`,
                                    border: `1px solid ${SEVERITY_CONFIG[proc.severity as keyof typeof SEVERITY_CONFIG]?.text || '#888'}20`,
                                  }}
                                >
                                  <span className="font-bold" style={{ color: SEVERITY_CONFIG[proc.severity as keyof typeof SEVERITY_CONFIG]?.text }}>
                                    #{proc.pid}
                                  </span>
                                  <span className="text-white/70 uppercase">{proc.type}</span>
                                  <span className="text-muted-foreground/60 truncate">@ {proc.location}</span>
                                  <span className="ml-auto text-muted-foreground/50">{proc.burstTime}u</span>
                                  <span className={`px-1 py-0.5 rounded text-[8px] ${SEVERITY_CONFIG[proc.severity as keyof typeof SEVERITY_CONFIG]?.badge}`}>
                                    {proc.severity}
                                  </span>
                                </div>
                              ))}
                              {notif.meta.recommendedPID && (
                                <div className="text-[9px] font-mono text-amber-400/80 mt-1">
                                  ⚡ System recommendation: PID #{notif.meta.recommendedPID} ({notif.meta.recommendedRole?.toUpperCase()}) → Dispatch first
                                </div>
                              )}
                            </div>
                          )}

                          {/* ADR state badge */}
                          {notif.adrState !== 'none' && (
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-mono text-muted-foreground/50 uppercase">ADR Status:</span>
                              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                                notif.adrState === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                                notif.adrState === 'admin_resolved' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-emerald-500/20 text-emerald-400'
                              }`}>
                                {notif.adrState.replace('_', ' ')}
                              </span>
                            </div>
                          )}

                          {/* Mark read button */}
                          {!notif.read && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); markRead(notif.id) }}
                              className="flex items-center gap-1 text-[10px] font-mono text-emerald-400/70 hover:text-emerald-400 transition-colors"
                            >
                              <CheckCircle2 size={11} />
                              Mark as acknowledged
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
