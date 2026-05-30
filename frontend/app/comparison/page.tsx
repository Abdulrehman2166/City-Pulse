'use client'

import { motion } from 'framer-motion'
import { BarChart3, TrendingDown, Clock, Cpu, ArrowRight, ArrowDown } from 'lucide-react'
import { GlassCard, ProgressRing } from '@/components/glass-card'
import Sidebar from '@/components/sidebar'
import { ToolPageShell } from '@/components/app-ui'
import { PageHeader } from '@/components/app-ui/page-header'
import { cn } from '@/lib/utils'

const algorithms = [
  { 
    name: 'FCFS', 
    fullName: 'First Come First Serve',
    avgTurnaround: 12.5, 
    avgWaiting: 6.8, 
    cpuUtilization: 82,
    color: 'oklch(0.72 0.14 30)'
  },
  { 
    name: 'SJF', 
    fullName: 'Shortest Job First',
    avgTurnaround: 9.2, 
    avgWaiting: 3.5, 
    cpuUtilization: 91,
    color: 'oklch(0.72 0.12 340)'
  },
  { 
    name: 'Priority', 
    fullName: 'Priority Scheduling',
    avgTurnaround: 10.8, 
    avgWaiting: 5.1, 
    cpuUtilization: 88,
    color: 'oklch(0.68 0.10 250)'
  },
  { 
    name: 'Round Robin', 
    fullName: 'Round Robin',
    avgTurnaround: 11.3, 
    avgWaiting: 5.6, 
    cpuUtilization: 85,
    color: 'oklch(0.70 0.10 165)'
  },
]

const bestAlgorithm = algorithms.reduce((best, current) => 
  current.avgWaiting < best.avgWaiting ? current : best
)

function BarChart({ data, metric, label }: { data: typeof algorithms; metric: 'avgTurnaround' | 'avgWaiting' | 'cpuUtilization'; label: string }) {
  const maxValue = Math.max(...data.map(d => d[metric]))
  
  return (
    <GlassCard delay={0.2} hover={false}>
      <h3 className="text-lg font-semibold mb-6">{label}</h3>
      <div className="space-y-4">
        {data.map((alg, index) => (
          <motion.div
            key={alg.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{alg.name}</span>
              <span className="text-muted-foreground">
                {metric === 'cpuUtilization' ? `${alg[metric]}%` : `${alg[metric]}ms`}
              </span>
            </div>
            <div className="h-3 bg-secondary/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(alg[metric] / maxValue) * 100}%` }}
                transition={{ duration: 1, delay: 0.5 + index * 0.1, ease: 'easeOut' }}
                style={{ backgroundColor: alg.color }}
                className="h-full rounded-full"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  )
}

function ComparisonTable() {
  return (
    <GlassCard delay={0.3} hover={false} className="overflow-hidden">
      <h3 className="text-lg font-semibold mb-6">Detailed Comparison</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/30">
              <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium uppercase tracking-wide">Algorithm</th>
              <th className="text-center py-3 px-4 text-xs text-muted-foreground font-medium uppercase tracking-wide">Avg Turnaround</th>
              <th className="text-center py-3 px-4 text-xs text-muted-foreground font-medium uppercase tracking-wide">Avg Waiting</th>
              <th className="text-center py-3 px-4 text-xs text-muted-foreground font-medium uppercase tracking-wide">CPU Util.</th>
              <th className="text-center py-3 px-4 text-xs text-muted-foreground font-medium uppercase tracking-wide">Rating</th>
            </tr>
          </thead>
          <tbody>
            {algorithms.map((alg, index) => (
              <motion.tr
                key={alg.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className={cn(
                  'border-b border-border/20 hover:bg-secondary/20 transition-colors',
                  alg.name === bestAlgorithm.name && 'bg-accent/10'
                )}
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: alg.color }}
                    />
                    <div>
                      <p className="font-medium text-sm">{alg.name}</p>
                      <p className="text-xs text-muted-foreground">{alg.fullName}</p>
                    </div>
                    {alg.name === bestAlgorithm.name && (
                      <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-medium">
                        Best
                      </span>
                    )}
                  </div>
                </td>
                <td className="text-center py-4 px-4 text-sm">{alg.avgTurnaround}ms</td>
                <td className="text-center py-4 px-4 text-sm">{alg.avgWaiting}ms</td>
                <td className="text-center py-4 px-4 text-sm">{alg.cpuUtilization}%</td>
                <td className="text-center py-4 px-4">
                  <div className="flex justify-center">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          'w-2 h-2 rounded-full mx-0.5',
                          i < Math.round((100 - alg.avgWaiting * 5) / 20)
                            ? 'bg-primary'
                            : 'bg-secondary/50'
                        )}
                      />
                    ))}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  )
}

export default function ComparisonPage() {
  return (
    <ToolPageShell>
      <Sidebar />
      <main className="cp-tool-main">
        <PageHeader
          eyebrow="Performance Analytics · Algorithm Benchmarks"
          title={
            <span className="bg-linear-to-r from-primary via-accent to-[oklch(0.68_0.10_250)] bg-clip-text text-transparent">
              Algorithm Comparison
            </span>
          }
          subtitle="Compare scheduling algorithm performance metrics for your OS course presentation."
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <GlassCard delay={0.1}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Best Algorithm</p>
                <p className="text-2xl font-bold mt-1">{bestAlgorithm.name}</p>
                <p className="text-xs text-muted-foreground mt-1">Lowest waiting time</p>
              </div>
              <div className="p-3 rounded-xl bg-accent/20">
                <BarChart3 className="w-6 h-6 text-accent" />
              </div>
            </div>
          </GlassCard>
          
          <GlassCard delay={0.15}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lowest Wait Time</p>
                <p className="text-2xl font-bold mt-1">{bestAlgorithm.avgWaiting}ms</p>
                <div className="flex items-center gap-1 text-xs text-accent mt-1">
                  <TrendingDown className="w-3 h-3" />
                  <span>23% better than avg</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-primary/20">
                <Clock className="w-6 h-6 text-primary" />
              </div>
            </div>
          </GlassCard>
          
          <GlassCard delay={0.2}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Best Turnaround</p>
                <p className="text-2xl font-bold mt-1">9.2ms</p>
                <p className="text-xs text-muted-foreground mt-1">SJF Algorithm</p>
              </div>
              <div className="p-3 rounded-xl bg-[oklch(0.72_0.12_340/0.2)]">
                <ArrowRight className="w-6 h-6 text-[oklch(0.72_0.12_340)]" />
              </div>
            </div>
          </GlassCard>
          
          <GlassCard delay={0.25}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Peak CPU Util.</p>
                <p className="text-2xl font-bold mt-1">91%</p>
                <p className="text-xs text-muted-foreground mt-1">SJF Algorithm</p>
              </div>
              <div className="p-3 rounded-xl bg-[oklch(0.68_0.10_250/0.2)]">
                <Cpu className="w-6 h-6 text-[oklch(0.68_0.10_250)]" />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <BarChart data={algorithms} metric="avgTurnaround" label="Average Turnaround Time" />
          <BarChart data={algorithms} metric="avgWaiting" label="Average Waiting Time" />
          <BarChart data={algorithms} metric="cpuUtilization" label="CPU Utilization" />
        </div>

        {/* Detailed Table */}
        <ComparisonTable />

        {/* Recommendation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <GlassCard hover={false}>
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <ProgressRing 
                  progress={91} 
                  size={100} 
                  strokeWidth={8} 
                  color="oklch(0.72 0.12 340)"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Recommendation</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Based on the current simulation data, <span className="text-primary font-medium">Shortest Job First (SJF)</span> provides 
                  the optimal balance of response time and resource utilization for emergency response scenarios. 
                  It achieves the lowest average waiting time of 3.5ms while maintaining 91% CPU utilization.
                </p>
                <div className="flex items-center gap-4 mt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-primary to-accent text-primary-foreground text-sm font-medium"
                  >
                    <span>Apply SJF</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                  <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    View detailed report
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </main>
    </ToolPageShell>
  )
}
