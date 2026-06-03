'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import {
  AlertTriangle, Bot, GripVertical, CheckCircle2, RefreshCw,
  Flame, ShieldAlert, HeartPulse, Cpu, Clock, Zap
} from 'lucide-react'
import { apiFetch } from '@/lib/api'

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

type ADR = {
  id: number
  incidentId: number | string
  kind: string
  severity: string
  adrState: string
  read: boolean
  createdAt: string
  headline: string
  content: string
  meta: {
    activeCount: number
    recommendedPID: string
    recommendedRole: string
    processes: ProcessMeta[]
    timestamp: string
    color: string
  }
}

type ResolutionResult = {
  message: string
  adrState: string
  resolutionStrategy: string
  jainsFairnessIndex?: number
  fairnessComment?: string
  resolvedOrder: {
    rank: number
    pid: string
    type: string
    location: string
    priority: string
    burstTime?: number
    severity?: string
    schedulingReason?: string
  }[]
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  fire:    <Flame size={14} className="text-[#c8553d]" />,
  police:  <ShieldAlert size={14} className="text-[#5272a0]" />,
  medical: <HeartPulse size={14} className="text-[#4a8c6f]" />,
}

const SEVERITY_COLOR: Record<string, string> = {
  CRITICAL: '#FF4444',
  HIGH:     '#FF8C00',
  MEDIUM:   '#FFD700',
  LOW:      '#4a8c6f',
}

export function ADRDecisionPanel() {
  const [adrs, setAdrs] = useState<ADR[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAdr, setSelectedAdr] = useState<ADR | null>(null)
  const [manualOrder, setManualOrder] = useState<ProcessMeta[]>([])
  const [resolving, setResolving] = useState(false)
  const [result, setResult] = useState<ResolutionResult | null>(null)
  const [error, setError] = useState('')

  const fetchADRs = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiFetch('/api/notifications/adrs?state=pending')
      const body = await res.json()
      if (!res.ok) throw new Error(body.message)
      setAdrs(body.adrs || [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load ADRs')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchADRs()
    const interval = setInterval(fetchADRs, 15000)
    return () => clearInterval(interval)
  }, [fetchADRs])

  function openADR(adr: ADR) {
    setSelectedAdr(adr)
    setManualOrder([...adr.meta.processes].sort((a, b) => a.priority - b.priority || a.burstTime - b.burstTime))
    setResult(null)
    setError('')
  }

  async function resolveManually() {
    if (!selectedAdr) return
    setResolving(true)
    setError('')
    try {
      const orderedPids = manualOrder.map(p => p.pid)
      const res = await apiFetch('/api/prioritize/admin', {
        method: 'POST',
        body: JSON.stringify({ adrId: selectedAdr.id, orderedPids }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.message)
      setResult(body)
      setAdrs(prev => prev.filter(a => a.id !== selectedAdr.id))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Resolution failed')
    } finally {
      setResolving(false)
    }
  }

  async function resolveAutomatically() {
    if (!selectedAdr) return
    setResolving(true)
    setError('')
    try {
      const res = await apiFetch('/api/prioritize/system', {
        method: 'POST',
        body: JSON.stringify({ adrId: selectedAdr.id }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.message)
      setResult(body)
      setAdrs(prev => prev.filter(a => a.id !== selectedAdr.id))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Auto-resolution failed')
    } finally {
      setResolving(false)
    }
  }

  if (loading && adrs.length === 0) {
    return (
      <div className="flex items-center justify-center gap-3 py-8 text-muted-foreground">
        <RefreshCw size={16} className="animate-spin" />
        <span className="text-xs font-mono uppercase tracking-widest">Scanning ADR queue…</span>
      </div>
    )
  }

  // ── No pending ADRs ──
  if (!loading && adrs.length === 0 && !result) {
    return (
      <div className="text-center py-10">
        <CheckCircle2 size={28} className="mx-auto mb-2 text-emerald-500/50" />
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">No pending ADRs</p>
        <p className="text-[10px] text-muted-foreground/40 mt-1">
          Admin Decision Requests appear when multiple incidents are active simultaneously
        </p>
        <button
          type="button"
          onClick={fetchADRs}
          className="mt-4 cp-btn-ghost text-[10px] gap-1"
        >
          <RefreshCw size={11} />
          Refresh
        </button>
      </div>
    )
  }

  // ── Resolution Result View ──
  if (result) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <CheckCircle2 size={20} className="text-emerald-400 flex-shrink-0" />
          <div>
            <div className="text-sm font-bold text-emerald-400">ADR Resolved Successfully</div>
            <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
              Strategy: <span className="text-white/70">{result.resolutionStrategy}</span>
              {result.jainsFairnessIndex !== undefined && (
                <> · Jain's Fairness Index: <span className="text-emerald-400">{result.jainsFairnessIndex}</span></>
              )}
            </div>
            {result.fairnessComment && (
              <div className="text-[10px] text-muted-foreground/60 font-mono mt-0.5">{result.fairnessComment}</div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-[9px] font-mono font-bold text-muted-foreground/60 uppercase tracking-widest">
            Resolved Dispatch Order
          </div>
          {result.resolvedOrder.map((item) => (
            <div
              key={item.pid}
              className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-[11px] font-mono"
            >
              <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[9px] font-bold text-muted-foreground">
                {item.rank}
              </div>
              {TYPE_ICON[item.type] || <Cpu size={14} />}
              <div className="flex-1">
                <span className="font-bold text-white/80">#{item.pid}</span>
                <span className="text-muted-foreground/60 ml-2">{item.type.toUpperCase()} @ {item.location}</span>
              </div>
              {item.schedulingReason && (
                <span className="text-[9px] text-muted-foreground/40 hidden xl:block max-w-[160px] truncate">{item.schedulingReason}</span>
              )}
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                style={{ background: `${SEVERITY_COLOR[item.severity || 'MEDIUM']}20`, color: SEVERITY_COLOR[item.severity || 'MEDIUM'] }}
              >
                {item.priority}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => { setResult(null); setSelectedAdr(null) }}
            className="cp-btn-ghost text-xs gap-1 flex-1"
          >
            <RefreshCw size={12} />
            Back to ADR Queue
          </button>
        </div>
      </motion.div>
    )
  }

  // ── ADR List + Panel ──
  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
      {/* ADR Queue list */}
      <div className="xl:col-span-2 space-y-2">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[9px] font-mono font-bold text-[#c8553d] uppercase tracking-widest flex items-center gap-1.5">
            <AlertTriangle size={11} />
            Pending ADRs ({adrs.length})
          </div>
          <button type="button" onClick={fetchADRs} className="cp-btn-ghost text-[10px] gap-1">
            <RefreshCw size={11} />
          </button>
        </div>
        {adrs.map((adr) => (
          <motion.button
            key={adr.id}
            type="button"
            onClick={() => openADR(adr)}
            whileHover={{ x: 2 }}
            className={`w-full text-left p-3 rounded-xl border transition-all ${
              selectedAdr?.id === adr.id
                ? 'border-[#c8553d]/40 bg-[rgba(200,85,61,0.08)]'
                : 'border-white/5 bg-white/[0.02] hover:border-[#c8553d]/20'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle size={11} className="text-amber-400 animate-pulse flex-shrink-0" />
              <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-widest">
                {adr.severity} · {adr.meta.activeCount} Processes
              </span>
              <span className="text-[9px] font-mono text-muted-foreground/50 ml-auto">
                {new Date(adr.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="text-[10px] font-bold font-mono text-[#c8553d] truncate">{adr.headline}</div>
          </motion.button>
        ))}
      </div>

      {/* ADR Decision Panel */}
      <div className="xl:col-span-3">
        {!selectedAdr ? (
          <div className="flex items-center justify-center h-full min-h-[200px] text-muted-foreground">
            <div className="text-center">
              <AlertTriangle size={24} className="mx-auto mb-2 opacity-20" />
              <p className="text-[10px] font-mono uppercase tracking-widest">Select an ADR to resolve</p>
            </div>
          </div>
        ) : (
          <motion.div
            key={selectedAdr.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* ADR Info */}
            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
              <div className="text-[10px] font-mono font-bold text-amber-400 mb-1 uppercase tracking-widest">{selectedAdr.headline}</div>
              <p className="text-[10px] text-muted-foreground font-mono leading-relaxed line-clamp-3">
                {selectedAdr.content}
              </p>
            </div>

            {/* Manual Reorder */}
            <div>
              <div className="text-[9px] font-mono font-bold text-muted-foreground/60 uppercase tracking-widest mb-2">
                Drag to Set Dispatch Priority Order
              </div>
              <Reorder.Group
                axis="y"
                values={manualOrder}
                onReorder={setManualOrder}
                className="space-y-1.5"
              >
                {manualOrder.map((proc, idx) => (
                  <Reorder.Item
                    key={proc.pid}
                    value={proc}
                    className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.03] border border-white/5 hover:border-white/10 cursor-grab active:cursor-grabbing text-[11px] font-mono group"
                  >
                    <GripVertical size={14} className="text-muted-foreground/30 group-hover:text-muted-foreground/60 flex-shrink-0" />
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold flex-shrink-0"
                      style={{ background: `${SEVERITY_COLOR[proc.severity] || '#888'}20`, color: SEVERITY_COLOR[proc.severity] || '#888' }}
                    >
                      {idx + 1}
                    </div>
                    {TYPE_ICON[proc.type] || <Cpu size={14} />}
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-white/80">#{proc.pid}</span>
                      <span className="text-muted-foreground/50 ml-2">{proc.type.toUpperCase()}</span>
                      <span className="text-muted-foreground/40 ml-1 truncate">@ {proc.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[9px] text-muted-foreground/50 flex items-center gap-0.5">
                        <Zap size={9} />{proc.burstTime}u
                      </span>
                      <span className="text-[9px] text-muted-foreground/50 flex items-center gap-0.5">
                        <Clock size={9} />{proc.priorityLabel}
                      </span>
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </div>

            {error && (
              <div className="text-[10px] font-mono text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <motion.button
                type="button"
                disabled={resolving}
                onClick={resolveManually}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-2.5 rounded-xl text-[11px] font-bold font-mono uppercase tracking-wider bg-[#5272a0] hover:bg-[#4a68a0] text-white disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {resolving ? <RefreshCw size={12} className="animate-spin" /> : <GripVertical size={12} />}
                {resolving ? 'Processing…' : 'Apply Manual Order'}
              </motion.button>

              <motion.button
                type="button"
                disabled={resolving}
                onClick={resolveAutomatically}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-2.5 rounded-xl text-[11px] font-bold font-mono uppercase tracking-wider bg-emerald-700 hover:bg-emerald-600 text-white disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
              >
                {resolving ? <RefreshCw size={12} className="animate-spin" /> : <Bot size={12} />}
                {resolving ? 'Optimizing…' : 'Auto CFS/SJF Resolve'}
              </motion.button>
            </div>
            <p className="text-[9px] text-muted-foreground/40 font-mono text-center">
              Manual: you define dispatch order · Auto: CFS+SJF optimizer + Jain's Fairness Index
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
