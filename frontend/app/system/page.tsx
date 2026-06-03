'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play, Pause, RotateCcw, Activity, Cpu, Zap, AlertTriangle,
  ShieldAlert, HeartPulse, Flame, Clock, RefreshCcw
} from 'lucide-react'
import { GlassCard } from '@/components/glass-card'
import Sidebar from '@/components/sidebar'
import { ToolPageShell } from '@/components/app-ui'
import { PageHeader } from '@/components/app-ui/page-header'
import { cn } from '@/lib/utils'

interface PCB {
  pid: string
  state: 'NEW' | 'READY' | 'RUNNING' | 'WAITING' | 'TERMINATED'
  priority: number
  burstTime: number
  remainingTime: number
  arrivalTime: number
  type: 'fire' | 'medical' | 'police' | 'infrastructure'
  title: string
  assignedCore?: number
  priorityBoost: number
}

interface SystemMetrics {
  cpuUtilization: number
  throughput: number
  averageTurnaround: number
  averageWaiting: number
  deadlockDetected: boolean
  deadlockedProcesses: string[]
}

const typeConfig = {
  fire: { icon: Flame, color: 'text-[oklch(0.72_0.14_30)]', bg: 'bg-[oklch(0.72_0.14_30/0.2)]' },
  medical: { icon: HeartPulse, color: 'text-[oklch(0.72_0.12_340)]', bg: 'bg-[oklch(0.72_0.12_340/0.2)]' },
  police: { icon: ShieldAlert, color: 'text-[oklch(0.68_0.10_250)]', bg: 'bg-[oklch(0.68_0.10_250/0.2)]' },
  infrastructure: { icon: Activity, color: 'text-[oklch(0.70_0.10_165)]', bg: 'bg-[oklch(0.70_0.10_165/0.2)]' },
}

export default function SystemMonitorPage() {
  const [processes, setProcesses] = useState<PCB[]>([])
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [eventSource, setEventSource] = useState<EventSource | null>(null)

  const fetchProcesses = useCallback(async () => {
    try {
      const res = await fetch('/api/system/processes')
      const data = await res.json()
      setProcesses(data.processes || [])
    } catch (err) {
      console.error('Failed to fetch processes:', err)
    }
  }, [])

  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch('/api/system/metrics')
      const data = await res.json()
      setMetrics(data)
    } catch (err) {
      console.error('Failed to fetch metrics:', err)
    }
  }, [])

  const startSimulation = async () => {
    setIsSimulating(true)
    const es = new EventSource('/api/system/simulate/stream')
    setEventSource(es)

    es.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'tick') {
      } else if (data.type === 'state') {
        setProcesses(data.processes || [])
        setMetrics(data.metrics || null)
      } else if (data.type === 'log') {
        setLogs(prev => [...prev.slice(-49), data.message])
      }
    }

    es.onerror = (err) => {
      console.error('EventSource error:', err)
      es.close()
      setIsSimulating(false)
      setEventSource(null)
    }
  }

  const stopSimulation = async () => {
    if (eventSource) {
      eventSource.close()
      setEventSource(null)
    }
    setIsSimulating(false)
    try {
      await fetch('/api/system/stop', { method: 'POST' })
    } catch (err) {
      console.error('Failed to stop simulation:', err)
    }
  }

  const addRandomProcess = async () => {
    try {
      await fetch('/api/system/process', { method: 'POST' })
      fetchProcesses()
    } catch (err) {
      console.error('Failed to add process:', err)
    }
  }

  const recoverDeadlock = async () => {
    try {
      await fetch('/api/system/deadlock/recover', { method: 'POST' })
      fetchProcesses()
      fetchMetrics()
    } catch (err) {
      console.error('Failed to recover deadlock:', err)
    }
  }

  const resetSystem = async () => {
    stopSimulation()
    setProcesses([])
    setMetrics(null)
    setLogs([])
    try {
      await fetch('/api/system/reset', { method: 'POST' })
    } catch (err) {
      console.error('Failed to reset system:', err)
    }
  }

  useEffect(() => {
    fetchProcesses()
    fetchMetrics()
    const interval = setInterval(() => {
      if (!isSimulating) {
        fetchProcesses()
        fetchMetrics()
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [fetchProcesses, fetchMetrics, isSimulating])

  return (
    <ToolPageShell>
      <Sidebar />
      <main className="cp-tool-main">
        <PageHeader
          eyebrow="OS Concepts · Live Monitor"
          title={
            <span className="bg-linear-to-r from-primary via-accent to-[oklch(0.68_0.10_250)] bg-clip-text text-transparent">
              System Monitor
            </span>
          }
          subtitle="Monitor live process scheduling, deadlock detection, priority aging, and real-time system metrics."
        />

        {/* Control Panel */}
        <GlassCard delay={0.1} hover={false}>
          <div className="flex flex-wrap gap-3 items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={isSimulating ? stopSimulation : startSimulation}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
            >
              {isSimulating ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Stop Simulation</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Start Simulation</span>
                </>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={addRandomProcess}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/20 text-secondary-foreground hover:bg-secondary/30 transition-colors"
            >
              <Zap className="w-4 h-4" />
              <span>Add Process</span>
            </motion.button>

            {metrics?.deadlockDetected && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={recoverDeadlock}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors animate-pulse"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Recover Deadlock</span>
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={resetSystem}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/20 text-muted-foreground hover:bg-muted/30 transition-colors ml-auto"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </motion.button>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Metrics Cards */}
          <div className="space-y-6">
            <GlassCard delay={0.2} hover={false}>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-secondary/30 border border-border/30">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">CPU Utilization</div>
                  <div className="text-2xl font-bold text-primary">{metrics?.cpuUtilization?.toFixed(1) ?? '0.0'}%</div>
                </div>
                <div className="p-4 rounded-xl bg-secondary/30 border border-border/30">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">Throughput</div>
                  <div className="text-2xl font-bold text-accent">{metrics?.throughput?.toFixed(2) ?? '0.00'}</div>
                </div>
                <div className="p-4 rounded-xl bg-secondary/30 border border-border/30">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">Avg Turnaround</div>
                  <div className="text-2xl font-bold text-[oklch(0.70_0.10_165)]">{metrics?.averageTurnaround?.toFixed(1) ?? '0.0'}</div>
                </div>
                <div className="p-4 rounded-xl bg-secondary/30 border border-border/30">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">Avg Waiting</div>
                  <div className="text-2xl font-bold text-[oklch(0.68_0.10_250)]">{metrics?.averageWaiting?.toFixed(1) ?? '0.0'}</div>
                </div>
              </div>

              {metrics?.deadlockDetected && (
                <div className="mt-4 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-semibold">Deadlock Detected</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Deadlocked processes: {metrics.deadlockedProcesses?.join(', ') || 'Unknown'}
                  </p>
                </div>
              )}
            </GlassCard>

            {/* Logs */}
            <GlassCard delay={0.3} hover={false}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">System Logs</h3>
                <button onClick={() => setLogs([])} className="text-xs text-muted-foreground hover:text-foreground">
                  Clear
                </button>
              </div>
              <div className="h-64 overflow-y-auto rounded-xl bg-secondary/20 border border-border/30 p-3 font-mono text-xs">
                {logs.length === 0 ? (
                  <div className="text-muted-foreground">No logs yet. Start simulation to see activity.</div>
                ) : (
                  logs.map((log, i) => (
                    <div key={i} className="py-1">{log}</div>
                  ))
                )}
              </div>
            </GlassCard>
          </div>

          {/* Process List */}
          <GlassCard delay={0.2} hover={false}>
            <h3 className="text-lg font-semibold mb-4">Process Control Blocks (PCBs)</h3>
            <div className="space-y-3">
              {processes.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No processes in system. Add a process to begin.
                </div>
              ) : (
                processes.map((process) => {
                  const TypeIcon = typeConfig[process.type]?.icon ?? Activity
                  return (
                    <motion.div
                      key={process.pid}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl border border-border/30 bg-secondary/10"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn('p-2 rounded-lg', typeConfig[process.type]?.bg ?? 'bg-secondary/30')}>
                            <TypeIcon className={cn('w-4 h-4', typeConfig[process.type]?.color ?? 'text-muted-foreground')} />
                          </div>
                          <div>
                            <div className="font-semibold">
                              {process.title}
                              <span className="text-xs text-muted-foreground ml-2">PID: {process.pid}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Priority: {process.priority} | Burst: {process.burstTime} | Remaining: {process.remainingTime}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            'px-2 py-1 rounded-full text-xs font-semibold uppercase',
                            process.state === 'RUNNING' ? 'bg-green-500/20 text-green-400' :
                            process.state === 'READY' ? 'bg-blue-500/20 text-blue-400' :
                            process.state === 'WAITING' ? 'bg-yellow-500/20 text-yellow-400' :
                            process.state === 'TERMINATED' ? 'bg-gray-500/20 text-gray-400' :
                            'bg-purple-500/20 text-purple-400'
                          )}>
                            {process.state}
                          </span>
                          {process.assignedCore !== undefined && (
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-400">
                              Core {process.assignedCore}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>
          </GlassCard>
        </div>
      </main>
    </ToolPageShell>
  )
}