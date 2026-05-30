'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, Plus, Trash2, Clock, Flame, HeartPulse, 
  ShieldAlert, Wrench, ChevronDown, RotateCcw 
} from 'lucide-react'
import { GlassCard } from '@/components/glass-card'
import { GanttChart } from '@/components/gantt-chart'
import Sidebar from '@/components/sidebar'
import { ToolPageShell } from '@/components/app-ui'
import { PageHeader } from '@/components/app-ui/page-header'
import { cn } from '@/lib/utils'

interface Process {
  id: string
  title: string
  type: 'fire' | 'medical' | 'police' | 'infrastructure'
  arrivalTime: number
  burstTime: number
  priority: number
}

const typeConfig = {
  fire: { icon: Flame, color: 'text-[oklch(0.72_0.14_30)]', bg: 'bg-[oklch(0.72_0.14_30/0.2)]' },
  medical: { icon: HeartPulse, color: 'text-[oklch(0.72_0.12_340)]', bg: 'bg-[oklch(0.72_0.12_340/0.2)]' },
  police: { icon: ShieldAlert, color: 'text-[oklch(0.68_0.10_250)]', bg: 'bg-[oklch(0.68_0.10_250/0.2)]' },
  infrastructure: { icon: Wrench, color: 'text-[oklch(0.70_0.10_165)]', bg: 'bg-[oklch(0.70_0.10_165/0.2)]' },
}

const algorithms = [
  { value: 'fcfs', label: 'First Come First Serve (FCFS)' },
  { value: 'sjf', label: 'Shortest Job First (SJF)' },
  { value: 'priority', label: 'Priority Scheduling' },
  { value: 'rr', label: 'Round Robin (RR)' },
  { value: 'mlfq', label: 'Multi-Level Feedback Queue (MLFQ)' },
]

const initialProcesses: Process[] = [
  { id: '1', title: 'Fire Response Alpha', type: 'fire', arrivalTime: 0, burstTime: 5, priority: 1 },
  { id: '2', title: 'Medical Emergency', type: 'medical', arrivalTime: 1, burstTime: 3, priority: 2 },
  { id: '3', title: 'Traffic Control', type: 'police', arrivalTime: 2, burstTime: 4, priority: 3 },
  { id: '4', title: 'Power Restoration', type: 'infrastructure', arrivalTime: 3, burstTime: 6, priority: 4 },
]

export default function SimulationPage() {
  const [processes, setProcesses] = useState<Process[]>(initialProcesses)
  const [algorithm, setAlgorithm] = useState('fcfs')
  const [timeQuantum, setTimeQuantum] = useState(2)
  const [simulationResult, setSimulationResult] = useState<any | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  const addProcess = () => {
    const types: Process['type'][] = ['fire', 'medical', 'police', 'infrastructure']
    const newProcess: Process = {
      id: Date.now().toString(),
      title: `New Incident ${processes.length + 1}`,
      type: types[Math.floor(Math.random() * types.length)],
      arrivalTime: processes.length,
      burstTime: Math.floor(Math.random() * 5) + 2,
      priority: processes.length + 1,
    }
    setProcesses([...processes, newProcess])
  }

  const removeProcess = (id: string) => {
    setProcesses(processes.filter(p => p.id !== id))
  }

  const runSimulation = async () => {
    setIsRunning(true)
    try {
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidents: processes.map(p => ({
            ...p,
            _id: p.id,
            arrivalTime: p.arrivalTime,
            burstTime: p.burstTime,
            priority: p.priority
          })),
          algorithm,
          timeQuantum: parseInt(timeQuantum.toString()),
        })
      })
      const data = await response.json()
      setSimulationResult(data)
      console.log('Simulation result:', data)
    } catch (error) {
      console.error('Simulation failed:', error)
      setSimulationResult({ error: 'Simulation failed. Check the backend response.' })
    } finally {
      setIsRunning(false)
    }
  }

  // Helper to prepare data for GanttChart
  const prepareGanttData = () => {
    if (!simulationResult || simulationResult.error) return null

    // Get all unique process IDs from timeline and original processes
    const allProcessIds = new Set<string>()
    simulationResult.timeline?.forEach((item: any) => allProcessIds.add(item.id))
    processes.forEach(p => allProcessIds.add(p.id))

    // For each process, find start and end times from timeline
    const ganttProcesses: any[] = []
    
    allProcessIds.forEach(id => {
      const originalProcess = processes.find(p => p.id === id)
      if (!originalProcess) return

      const timelineItems = simulationResult.timeline?.filter((item: any) => item.id === id) || []
      
      if (timelineItems.length === 0) return

      const startTime = Math.min(...timelineItems.map((item: any) => item.start))
      const endTime = Math.max(...timelineItems.map((item: any) => item.end))

      ganttProcesses.push({
        id: originalProcess.id,
        name: originalProcess.title,
        type: originalProcess.type,
        arrivalTime: originalProcess.arrivalTime,
        burstTime: originalProcess.burstTime,
        startTime,
        endTime
      })
    })

    // Calculate metrics
    const totalTurnaround = ganttProcesses.reduce((sum, p) => sum + (p.endTime - p.arrivalTime), 0)
    const totalWaiting = ganttProcesses.reduce((sum, p) => sum + (p.startTime - p.arrivalTime), 0)
    const maxTime = Math.max(...ganttProcesses.map(p => p.endTime))
    const totalBurst = ganttProcesses.reduce((sum, p) => sum + p.burstTime, 0)
    
    const metrics = {
      avgTurnaround: totalTurnaround / ganttProcesses.length,
      avgWaiting: totalWaiting / ganttProcesses.length,
      cpuUtilization: (totalBurst / maxTime) * 100
    }

    return { processes: ganttProcesses, metrics }
  }

  const ganttData = prepareGanttData()

  return (
    <ToolPageShell>
      <Sidebar />
      <main className="cp-tool-main">
        <PageHeader
          eyebrow="OS Scheduling Lab · Live Demo"
          title={
            <span className="bg-linear-to-r from-primary via-accent to-[oklch(0.68_0.10_250)] bg-clip-text text-transparent">
              Simulation Setup
            </span>
          }
          subtitle="Configure scheduling algorithms and run FCFS, SJF, Priority, Round Robin, and MLFQ simulations."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Process Queue */}
          <div className="lg:col-span-2">
            <GlassCard delay={0.1} hover={false}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Process Queue</h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={addProcess}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm font-medium">Add Incident</span>
                </motion.button>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-6 gap-4 px-4 py-2 text-xs text-muted-foreground font-medium uppercase tracking-wide border-b border-border/30">
                <span>Title</span>
                <span>Type</span>
                <span className="text-center">AT</span>
                <span className="text-center">BT</span>
                <span className="text-center">Priority</span>
                <span className="text-right">Action</span>
              </div>

              {/* Process Rows */}
              <div className="divide-y divide-border/20">
                <AnimatePresence>
                  {processes.map((process, index) => {
                    const TypeIcon = typeConfig[process.type].icon
                    return (
                      <motion.div
                        key={process.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20, height: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="grid grid-cols-6 gap-4 px-4 py-3 items-center hover:bg-secondary/20 transition-colors"
                      >
                        <span className="text-sm font-medium truncate">{process.title}</span>
                        <div className="flex items-center gap-2">
                          <div className={cn('p-1.5 rounded-lg', typeConfig[process.type].bg)}>
                            <TypeIcon className={cn('w-3.5 h-3.5', typeConfig[process.type].color)} />
                          </div>
                          <span className="text-xs text-muted-foreground capitalize">{process.type}</span>
                        </div>
                        <input
                          type="number"
                          title="Arrival time"
                          value={process.arrivalTime}
                          onChange={(e) => {
                            const updated = processes.map(p => 
                              p.id === process.id ? { ...p, arrivalTime: parseInt(e.target.value) || 0 } : p
                            )
                            setProcesses(updated)
                          }}
                          className="w-full text-center bg-secondary/30 rounded-lg px-2 py-1 text-sm border border-border/30 focus:border-primary/50 focus:outline-none"
                        />
                        <input
                          type="number"
                          title="Burst time"
                          value={process.burstTime}
                          onChange={(e) => {
                            const updated = processes.map(p => 
                              p.id === process.id ? { ...p, burstTime: parseInt(e.target.value) || 1 } : p
                            )
                            setProcesses(updated)
                          }}
                          className="w-full text-center bg-secondary/30 rounded-lg px-2 py-1 text-sm border border-border/30 focus:border-primary/50 focus:outline-none"
                        />
                        <input
                          type="number"
                          title="Priority"
                          value={process.priority}
                          onChange={(e) => {
                            const updated = processes.map(p => 
                              p.id === process.id ? { ...p, priority: parseInt(e.target.value) || 1 } : p
                            )
                            setProcesses(updated)
                          }}
                          className="w-full text-center bg-secondary/30 rounded-lg px-2 py-1 text-sm border border-border/30 focus:border-primary/50 focus:outline-none"
                        />
                        <div className="flex justify-end">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeProcess(process.id)}
                            className="p-2 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
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
                <div className="py-12 text-center text-muted-foreground">
                  <p>No processes in queue. Add an incident to begin.</p>
                </div>
              )}
            </GlassCard>
          </div>

          {/* Control Panel */}
          <div className="space-y-6">
            <GlassCard delay={0.2} hover={false}>
              <h3 className="text-lg font-semibold mb-4">Control Panel</h3>
              
              {/* Algorithm Selector */}
              <div className="mb-4">
                <label className="text-sm text-muted-foreground mb-2 block">
                  Scheduling Algorithm
                </label>
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-secondary/30 border border-border/30 hover:border-primary/30 transition-colors text-left"
                  >
                    <span className="text-sm">
                      {algorithms.find(a => a.value === algorithm)?.label}
                    </span>
                    <ChevronDown className={cn(
                      'w-4 h-4 text-muted-foreground transition-transform',
                      showDropdown && 'rotate-180'
                    )} />
                  </button>
                  <AnimatePresence>
                    {showDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 py-2 rounded-xl glass-card border border-border/30 z-10"
                      >
                        {algorithms.map((alg) => (
                          <button
                            key={alg.value}
                            onClick={() => {
                              setAlgorithm(alg.value)
                              setShowDropdown(false)
                            }}
                            className={cn(
                              'w-full px-4 py-2 text-left text-sm hover:bg-secondary/50 transition-colors',
                              algorithm === alg.value && 'text-primary bg-primary/10'
                            )}
                          >
                            {alg.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Time Quantum (for Round Robin) */}
              <AnimatePresence>
                {algorithm === 'rr' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4"
                  >
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Time Quantum
                    </label>
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <input
                        type="number"
                        title="Time quantum"
                        value={timeQuantum}
                        onChange={(e) => setTimeQuantum(parseInt(e.target.value) || 1)}
                        min={1}
                        className="flex-1 bg-secondary/30 rounded-xl px-4 py-3 text-sm border border-border/30 focus:border-primary/50 focus:outline-none"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Run Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={runSimulation}
                disabled={isRunning || processes.length === 0}
                className={cn(
                  'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all',
                  isRunning 
                    ? 'bg-accent/20 text-accent cursor-wait' 
                    : 'bg-linear-to-r from-primary to-accent text-primary-foreground hover:opacity-90'
                )}
              >
                {isRunning ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>Running...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Run Simulation</span>
                  </>
                )}
              </motion.button>
            </GlassCard>

            {/* Info Card */}
            <GlassCard delay={0.3} hover={false}>
              <h3 className="text-lg font-semibold mb-3">Algorithm Info</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {algorithm === 'fcfs' && 'First Come First Serve processes tasks in the order they arrive. Simple but may cause convoy effect.'}
                {algorithm === 'sjf' && 'Shortest Job First prioritizes tasks with shorter burst times, minimizing average waiting time.'}
                {algorithm === 'priority' && 'Priority Scheduling processes high-priority tasks first, ideal for emergency response systems.'}
                {algorithm === 'rr' && 'Round Robin allocates equal time slices to all processes, ensuring fair CPU distribution.'}
                {algorithm === 'mlfq' && 'MLFQ uses multiple feedback queues with aging to balance responsiveness and throughput for mixed priority workloads.'}
              </p>
            </GlassCard>
          </div>
        </div>

        {/* Gantt Chart */}
        {ganttData && (
          <div className="mt-8">
            <GanttChart processes={ganttData.processes} metrics={ganttData.metrics} />
          </div>
        )}

        {/* Detailed Results */}
        {simulationResult && !simulationResult.error && (
          <div className="mt-8">
            <GlassCard delay={0.4} hover={false}>
              <h3 className="text-lg font-semibold mb-4">Detailed Timeline</h3>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Algorithm</p>
                  <p className="text-sm font-semibold">{simulationResult.algorithm || algorithm}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Completed Processes</p>
                  <p className="text-sm font-semibold">{simulationResult.results?.length ?? 0}</p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-3xl border border-border/30 bg-secondary/50">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-xs uppercase tracking-[0.2em] text-muted-foreground border-b border-border/30">
                    <tr>
                      <th className="px-4 py-3">Process</th>
                      <th className="px-4 py-3">Start</th>
                      <th className="px-4 py-3">End</th>
                      <th className="px-4 py-3">Queue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {simulationResult.timeline?.map((item: any, idx: number) => (
                      <tr key={`${item.id}-${idx}`} className="border-b border-border/20 odd:bg-white/5 even:bg-slate-950/5">
                        <td className="px-4 py-3 text-sm">{item.id}</td>
                        <td className="px-4 py-3 text-sm">{item.start}</td>
                        <td className="px-4 py-3 text-sm">{item.end}</td>
                        <td className="px-4 py-3 text-sm">{item.queue || item.queueLevel !== undefined ? item.queueLevel ?? item.queue : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Error */}
        {simulationResult && simulationResult.error && (
          <div className="mt-8">
            <GlassCard delay={0.4} hover={false}>
              <h3 className="text-lg font-semibold mb-4">Error</h3>
              <p className="text-sm text-destructive">{simulationResult.error}</p>
            </GlassCard>
          </div>
        )}
      </main>
    </ToolPageShell>
  )
}
