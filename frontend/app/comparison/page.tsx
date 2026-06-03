'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BarChart3, TrendingDown, Clock, Cpu, ArrowRight, ArrowDown, 
  Plus, Trash2, Play, ShieldAlert, Wrench, Flame, HeartPulse, 
  Activity, RotateCcw, CheckCircle2 
} from 'lucide-react'
import { GlassCard, ProgressRing } from '@/components/glass-card'
import Sidebar from '@/components/sidebar'
import { ToolPageShell } from '@/components/app-ui'
import { PageHeader } from '@/components/app-ui/page-header'
import { cn } from '@/lib/utils'

interface BenchmarkProcess {
  id: string
  title: string
  type: 'fire' | 'medical' | 'police' | 'infrastructure'
  arrivalTime: number
  burstTime: number
  priority: number
}

const typeConfig = {
  fire: { icon: Flame, color: 'text-[oklch(0.72_0.14_30)]', bg: 'bg-[oklch(0.72_0.14_30/0.2)]', hex: 'oklch(0.72 0.14 30)' },
  medical: { icon: HeartPulse, color: 'text-[oklch(0.72_0.12_340)]', bg: 'bg-[oklch(0.72_0.12_340/0.2)]', hex: 'oklch(0.72 0.12 340)' },
  police: { icon: ShieldAlert, color: 'text-[oklch(0.68_0.10_250)]', bg: 'bg-[oklch(0.68_0.10_250/0.2)]', hex: 'oklch(0.68 0.10 250)' },
  infrastructure: { icon: Wrench, color: 'text-[oklch(0.70_0.10_165)]', bg: 'bg-[oklch(0.70_0.10_165/0.2)]', hex: 'oklch(0.70 0.10 165)' },
}

const algorithmMetadata: Record<string, { label: string; fullName: string; color: string }> = {
  fcfs: { label: 'FCFS', fullName: 'First Come First Serve', color: 'oklch(0.72 0.14 30)' },
  sjf: { label: 'SJF', fullName: 'Shortest Job First', color: 'oklch(0.72 0.12 340)' },
  priority: { label: 'Priority', fullName: 'Priority Scheduling', color: 'oklch(0.68 0.10 250)' },
  rr: { label: 'Round Robin', fullName: 'Round Robin', color: 'oklch(0.70 0.10 165)' },
  mlfq: { label: 'MLFQ', fullName: 'Multi-Level Feedback Queue', color: 'oklch(0.65 0.12 200)' },
  srtf: { label: 'SRTF', fullName: 'Shortest Remaining Time First', color: 'oklch(0.80 0.15 120)' },
}

const initialProcesses: BenchmarkProcess[] = [
  { id: '1', title: 'Apartment Fire Alpha', type: 'fire', arrivalTime: 0, burstTime: 12, priority: 1 },
  { id: '2', title: 'Cardiac Arrest Dispatch', type: 'medical', arrivalTime: 1, burstTime: 6, priority: 2 },
  { id: '3', title: 'Downtown Bank Robbery', type: 'police', arrivalTime: 2, burstTime: 8, priority: 1 },
  { id: '4', title: 'Water Main Burst', type: 'infrastructure', arrivalTime: 5, burstTime: 14, priority: 3 },
  { id: '5', title: 'Traffic Junction Collision', type: 'police', arrivalTime: 8, burstTime: 5, priority: 2 },
]

export default function ComparisonPage() {
  const [processes, setProcesses] = useState<BenchmarkProcess[]>(initialProcesses)
  const [comparisonData, setComparisonData] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [optimizing, setOptimizing] = useState(false)
  const [optimalApplied, setOptimalApplied] = useState(false)

  // Banker's Deadlock Lab state
  const [deadlockState, setDeadlockState] = useState<any | null>(null)
  const [deadlockLoading, setDeadlockLoading] = useState(false)

  useEffect(() => {
    runBenchmark()
    fetchDeadlockState()
  }, [])

  // 1. Run live scheduling benchmark
  const runBenchmark = async () => {
    setLoading(true)
    setOptimalApplied(false)
    try {
      const response = await fetch('/api/simulate/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidents: processes.map(p => ({
            ...p,
            _id: p.id,
          })),
          timeQuantum: 2
        })
      })
      const data = await response.json()
      setComparisonData(data)
    } catch (err) {
      console.error('Failed to run scheduling benchmark:', err)
    } finally {
      setLoading(false)
    }
  }

  // 2. Fetch deadlock state
  const fetchDeadlockState = async () => {
    try {
      const response = await fetch('/api/system/deadlock/check')
      const data = await response.json()
      if (data.success) {
        setDeadlockState(data.deadlockCheck)
      }
    } catch (err) {
      console.error('Failed to fetch deadlock state:', err)
    }
  }

  // 3. Manually check and recover from deadlock
  const checkDeadlock = async () => {
    setDeadlockLoading(true)
    try {
      const response = await fetch('/api/system/deadlock/check')
      const data = await response.json()
      if (data.success) {
        setDeadlockState(data.deadlockCheck)
      }
    } catch (err) {
      console.error('Deadlock check failed:', err)
    } finally {
      setDeadlockLoading(false)
    }
  }

  // 4. Trigger auto-optimization in backend
  const applyOptimal = async () => {
    if (!comparisonData?.bestAlgorithm) return
    setOptimizing(true)
    try {
      // First, reset optimizer
      await fetch('/api/auto-optimize/reset', { method: 'POST' })
      
      // Seed optimizer with current process workload
      for (const p of processes) {
        await fetch('/api/auto-optimize/add-incident', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(p)
        })
      }

      // Run dynamic auto-optimization selector
      const res = await fetch('/api/auto-optimize/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeQuantum: 2 })
      })
      
      if (res.ok) {
        setOptimalApplied(true)
        setTimeout(() => setOptimalApplied(false), 4000)
      }
    } catch (err) {
      console.error('Failed to apply optimization:', err)
    } finally {
      setOptimizing(false)
    }
  }

  const addProcess = () => {
    const types: BenchmarkProcess['type'][] = ['fire', 'medical', 'police', 'infrastructure']
    const newProcess: BenchmarkProcess = {
      id: Date.now().toString(),
      title: `Incident ${processes.length + 1}`,
      type: types[Math.floor(Math.random() * types.length)],
      arrivalTime: processes.length,
      burstTime: Math.floor(Math.random() * 8) + 4,
      priority: Math.floor(Math.random() * 3) + 1,
    }
    setProcesses([...processes, newProcess])
  }

  const removeProcess = (id: string) => {
    setProcesses(processes.filter(p => p.id !== id))
  }

  // Parse comparison stats
  const getBenchmarkedAlgorithms = () => {
    if (!comparisonData?.comparison) return []
    return Object.entries(comparisonData.comparison).map(([key, value]: [string, any]) => {
      const meta = algorithmMetadata[key] || { label: key.toUpperCase(), fullName: key.toUpperCase(), color: '#888888' }
      return {
        key,
        name: meta.label,
        fullName: meta.fullName,
        avgWaitingTime: value.metrics?.averageWaitingTime ?? 0,
        avgTurnaround: value.metrics?.averageTurnaroundTime ?? 0,
        cpuUtilization: Math.floor(value.metrics?.averageWaitingTime > 0 ? 90 - value.metrics?.averageWaitingTime * 2 : 95),
        color: meta.color
      }
    })
  }

  const benchmarkedAlgorithms = getBenchmarkedAlgorithms()

  const activeBestAlgorithm = benchmarkedAlgorithms.reduce((best: any, current: any) => 
    (!best || current.avgWaitingTime < best.avgWaitingTime) ? current : best, null
  )

  return (
    <ToolPageShell>
      <Sidebar />
      <main className="cp-tool-main space-y-8 pb-12">
        <PageHeader
          eyebrow="Performance Analytics · Algorithm Benchmarks"
          title={
            <span className="bg-linear-to-r from-primary via-accent to-[oklch(0.68_0.10_250)] bg-clip-text text-transparent">
              Algorithm Comparison Lab
            </span>
          }
          subtitle="Configure scheduling parameters, benchmark classical algorithms in real-time, and run dynamic deadlock recovery checks."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Workload Editor Panel */}
          <div className="lg:col-span-2 space-y-6">
            <GlassCard delay={0.1} hover={false}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold">Simulation Workload</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Customize process values to see how FCFS, SJF, RR, MLFQ, and SRTF respond.</p>
                </div>
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={addProcess}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary/40 text-sm font-medium border border-border hover:bg-secondary transition-colors"
                  >
                    <Plus className="w-4 h-4 text-primary" />
                    <span>Add Incident</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={runBenchmark}
                    disabled={loading || processes.length === 0}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-linear-to-r from-primary to-accent text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
                  >
                    <Play className="w-4 h-4" />
                    <span>{loading ? 'Benchmarking...' : 'Run Benchmark'}</span>
                  </motion.button>
                </div>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-6 gap-4 px-4 py-2 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider border-b border-border/30">
                <span>Title</span>
                <span>Type</span>
                <span className="text-center">Arrival Time</span>
                <span className="text-center">Burst Time</span>
                <span className="text-center">Priority</span>
                <span className="text-right">Action</span>
              </div>

              {/* Process Rows */}
              <div className="divide-y divide-border/20 max-h-[350px] overflow-y-auto">
                <AnimatePresence>
                  {processes.map((process, index) => {
                    const TypeIcon = typeConfig[process.type]?.icon || Wrench
                    return (
                      <motion.div
                        key={process.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: index * 0.03 }}
                        className="grid grid-cols-6 gap-4 px-4 py-3 items-center hover:bg-secondary/10 transition-colors"
                      >
                        <span className="text-sm font-medium truncate">{process.title}</span>
                        <div className="flex items-center gap-2">
                          <div className={cn('p-1.5 rounded-lg', typeConfig[process.type]?.bg)}>
                            <TypeIcon className={cn('w-3.5 h-3.5', typeConfig[process.type]?.color)} />
                          </div>
                          <span className="text-xs text-muted-foreground capitalize">{process.type}</span>
                        </div>
                        <input
                          type="number"
                          title="Arrival time"
                          value={process.arrivalTime}
                          onChange={(e) => {
                            const updated = processes.map(p => 
                              p.id === process.id ? { ...p, arrivalTime: Math.max(0, parseInt(e.target.value) || 0) } : p
                            )
                            setProcesses(updated)
                          }}
                          className="w-[80%] mx-auto text-center bg-secondary/20 rounded-lg px-2 py-1 text-sm border border-border/20 focus:border-primary/50 focus:outline-none"
                        />
                        <input
                          type="number"
                          title="Burst time"
                          value={process.burstTime}
                          onChange={(e) => {
                            const updated = processes.map(p => 
                              p.id === process.id ? { ...p, burstTime: Math.max(1, parseInt(e.target.value) || 1) } : p
                            )
                            setProcesses(updated)
                          }}
                          className="w-[80%] mx-auto text-center bg-secondary/20 rounded-lg px-2 py-1 text-sm border border-border/20 focus:border-primary/50 focus:outline-none"
                        />
                        <input
                          type="number"
                          title="Priority"
                          value={process.priority}
                          onChange={(e) => {
                            const updated = processes.map(p => 
                              p.id === process.id ? { ...p, priority: Math.max(1, parseInt(e.target.value) || 1) } : p
                            )
                            setProcesses(updated)
                          }}
                          className="w-[80%] mx-auto text-center bg-secondary/20 rounded-lg px-2 py-1 text-sm border border-border/20 focus:border-primary/50 focus:outline-none"
                        />
                        <div className="flex justify-end">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeProcess(process.id)}
                            className="p-1.5 rounded-lg hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>

              {processes.length === 0 && (
                <div className="py-12 text-center text-muted-foreground text-sm">
                  <p>Simulation ready queue is empty. Add incidents to compare.</p>
                </div>
              )}
            </GlassCard>
          </div>

          {/* Core Analytics HUD */}
          <div className="lg:col-span-1 space-y-6">
            <GlassCard delay={0.15} hover={false}>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-accent animate-pulse" />
                Benchmark Results
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/20 pb-3">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider block">Optimal Dispatch</span>
                    <span className="text-xl font-bold mt-0.5">
                      {activeBestAlgorithm ? activeBestAlgorithm.name : '—'}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-accent/15">
                    <BarChart3 className="w-5 h-5 text-accent" />
                  </div>
                </div>

                <div className="flex items-center justify-between border-b border-border/20 pb-3">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider block">Average Waiting Time</span>
                    <span className="text-xl font-bold mt-0.5">
                      {activeBestAlgorithm ? `${activeBestAlgorithm.avgWaitingTime.toFixed(2)} ticks` : '—'}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-primary/15">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider block">Throughput Score</span>
                    <span className="text-xl font-bold mt-0.5">
                      {activeBestAlgorithm ? `${(1 / Math.max(0.1, activeBestAlgorithm.avgWaitingTime)).toFixed(3)}/t` : '—'}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-500/10">
                    <Cpu className="w-5 h-5 text-emerald-500" />
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Comparison Visualizer Charts */}
        {benchmarkedAlgorithms.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard delay={0.2} hover={false}>
              <h4 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">Average Waiting Time</h4>
              <div className="space-y-3.5">
                {benchmarkedAlgorithms.map((alg) => (
                  <div key={alg.key} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>{alg.name}</span>
                      <span className="text-muted-foreground">{alg.avgWaitingTime.toFixed(2)} ticks</span>
                    </div>
                    <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, Math.max(8, (alg.avgWaitingTime / Math.max(...benchmarkedAlgorithms.map(a => a.avgWaitingTime))) * 100))}%` }}
                        transition={{ duration: 0.8 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: alg.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard delay={0.25} hover={false}>
              <h4 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">Average Turnaround</h4>
              <div className="space-y-3.5">
                {benchmarkedAlgorithms.map((alg) => (
                  <div key={alg.key} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>{alg.name}</span>
                      <span className="text-muted-foreground">{alg.avgTurnaround.toFixed(2)} ticks</span>
                    </div>
                    <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, Math.max(8, (alg.avgTurnaround / Math.max(...benchmarkedAlgorithms.map(a => a.avgTurnaround))) * 100))}%` }}
                        transition={{ duration: 0.8 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: alg.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard delay={0.3} hover={false}>
              <h4 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">Estimated CPU Util.</h4>
              <div className="space-y-3.5">
                {benchmarkedAlgorithms.map((alg) => (
                  <div key={alg.key} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>{alg.name}</span>
                      <span className="text-muted-foreground">{alg.cpuUtilization}%</span>
                    </div>
                    <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${alg.cpuUtilization}%` }}
                        transition={{ duration: 0.8 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: alg.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        )}

        {/* Dynamic Comparison Matrix Table */}
        {benchmarkedAlgorithms.length > 0 && (
          <GlassCard delay={0.35} hover={false} className="overflow-hidden">
            <h3 className="text-lg font-semibold mb-4">Detailed Performance Benchmarks</h3>
            <div className="overflow-x-auto rounded-xl border border-border/30 bg-secondary/20">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border/30 bg-secondary/40 text-xs text-muted-foreground uppercase tracking-wider">
                    <th className="py-3 px-4 font-semibold">Algorithm</th>
                    <th className="py-3 px-4 font-semibold text-center">Avg Waiting Time</th>
                    <th className="py-3 px-4 font-semibold text-center">Avg Turnaround</th>
                    <th className="py-3 px-4 font-semibold text-center">Estimated CPU Util.</th>
                    <th className="py-3 px-4 font-semibold text-center">Jain Fairness Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {benchmarkedAlgorithms.map((alg) => (
                    <tr 
                      key={alg.key} 
                      className={cn(
                        'hover:bg-secondary/15 transition-colors',
                        activeBestAlgorithm?.key === alg.key && 'bg-accent/10'
                      )}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: alg.color }} />
                          <div>
                            <span className="font-semibold text-sm block">{alg.name}</span>
                            <span className="text-[10px] text-muted-foreground">{alg.fullName}</span>
                          </div>
                          {activeBestAlgorithm?.key === alg.key && (
                            <span className="px-2 py-0.5 rounded-full bg-accent/25 text-accent text-[9px] font-bold uppercase tracking-wider">
                              Optimal
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-medium text-sm">
                        {alg.avgWaitingTime.toFixed(2)} ticks
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-medium text-sm">
                        {alg.avgTurnaround.toFixed(2)} ticks
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-medium text-sm text-emerald-500">
                        {alg.cpuUtilization}%
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex justify-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <div 
                              key={i} 
                              className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                i < Math.max(1, Math.round((20 - alg.avgWaitingTime) / 4))
                                  ? 'bg-primary'
                                  : 'bg-secondary/60'
                              )}
                            />
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}

        {/* Workload-Adaptive Optimization Recommendation */}
        {activeBestAlgorithm && (
          <GlassCard delay={0.4} hover={false}>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <ProgressRing 
                  progress={activeBestAlgorithm.cpuUtilization}
                  size={105} 
                  strokeWidth={7} 
                  color={activeBestAlgorithm.color}
                />
              </div>
              <div className="flex-1 space-y-2 text-center md:text-left">
                <h3 className="text-lg font-bold">Dynamic Dispatch Engine Recommendation</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
                  Based on the active simulation queue, the kernel recommends executing <span className="text-primary font-semibold">{activeBestAlgorithm.fullName} ({activeBestAlgorithm.name})</span>. 
                  This algorithm provides the lowest waiting time latency of <span className="font-semibold">{activeBestAlgorithm.avgWaitingTime.toFixed(2)} ticks</span> with an estimated CPU utility of {activeBestAlgorithm.cpuUtilization}%.
                </p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={applyOptimal}
                    disabled={optimizing}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-linear-to-r from-primary to-accent text-primary-foreground text-sm font-semibold hover:opacity-95 shadow-lg shadow-primary/20 disabled:opacity-60"
                  >
                    {optimizing ? (
                      <>
                        <RotateCcw className="w-4 h-4 animate-spin" />
                        <span>Optimizing Kernel...</span>
                      </>
                    ) : (
                      <>
                        <span>Apply Optimal: {activeBestAlgorithm.name}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                  <AnimatePresence>
                    {optimalApplied && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-1.5 text-xs text-accent font-semibold"
                      >
                        <CheckCircle2 className="w-4 h-4 text-accent animate-bounce" />
                        <span>Kernel Successfully Switched and Optimized!</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Banker's Deadlock Lab Panel */}
        <GlassCard delay={0.45} hover={false} className="border-t-2 border-accent/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2 text-accent">
                <ShieldAlert className="w-5 h-5 text-accent animate-pulse" />
                Banker's Deadlock Lab
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">Simulate OS resource requests and execute Banker's Algorithm checks to identify and preempt resource deadlocks.</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={checkDeadlock}
              disabled={deadlockLoading}
              className="flex items-center gap-2 mt-4 md:mt-0 px-4 py-2 rounded-xl bg-accent/20 text-accent font-semibold text-sm border border-accent/30 hover:bg-accent/30 transition-all disabled:opacity-50"
            >
              <RotateCcw className={cn("w-4 h-4", deadlockLoading && "animate-spin")} />
              <span>{deadlockLoading ? 'Running Banker Check...' : 'Run Banker Deadlock Check'}</span>
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Safe State Status */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Banker Safety Diagnostics</h4>
              <div className="p-4 rounded-xl border border-border/20 bg-secondary/10 flex flex-col justify-between h-[150px]">
                {deadlockState ? (
                  <>
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest block">Safe State Diagnostics</span>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2.5 h-2.5 rounded-full animate-pulse", deadlockState.isDeadlocked ? "bg-destructive" : "bg-emerald-500")} />
                        <span className="text-base font-bold capitalize">
                          {deadlockState.isDeadlocked ? 'DEADLOCK IDENTIFIED' : 'SYSTEM STATE: SAFE'}
                        </span>
                      </div>
                    </div>
                    <div>
                      {deadlockState.isDeadlocked ? (
                        <p className="text-xs text-destructive font-medium leading-relaxed">
                          Alert: Processes {JSON.stringify(deadlockState.deadlockedPids)} are deadlocked! Recovery engine triggered resource preemption.
                        </p>
                      ) : (
                        <p className="text-xs text-emerald-500 font-mono">
                          Safe Sequence: {deadlockState.safeSequence?.length > 0 ? deadlockState.safeSequence.join(' → ') : 'No processes allocated'}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    Banker check idle. Click check above.
                  </div>
                )}
              </div>
            </div>

            {/* Core Allocation Visualizer */}
            <div className="md:col-span-2 space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Simulated OS System Hardware Resources</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {deadlockState?.resources ? (
                  Object.entries(deadlockState.resources).map(([key, value]: [string, any]) => (
                    <div key={key} className="p-4 rounded-xl border border-border/20 bg-secondary/20 space-y-2">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold block truncate">{value.name}</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold font-mono">{value.available}</span>
                        <span className="text-xs text-muted-foreground">/ {value.max}</span>
                      </div>
                      <div className="h-1.5 bg-secondary/40 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-accent"
                          style={{ width: `${(value.available / value.max) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-4 p-8 border border-dashed border-border/20 rounded-xl text-center text-xs text-muted-foreground">
                    No resources loaded. Trigger Banker check to pull kernel variables.
                  </div>
                )}
              </div>
            </div>
          </div>
        </GlassCard>
      </main>
    </ToolPageShell>
  )
}
