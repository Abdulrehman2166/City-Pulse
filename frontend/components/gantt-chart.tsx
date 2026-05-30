'use client'

import { motion } from 'framer-motion'
import { GlassCard } from './glass-card'
import { cn } from '@/lib/utils'

interface Process {
  id: string
  name: string
  type: 'fire' | 'medical' | 'police' | 'infrastructure'
  arrivalTime: number
  burstTime: number
  startTime?: number
  endTime?: number
}

interface GanttChartProps {
  processes: Process[]
  metrics?: {
    avgTurnaround: number
    avgWaiting: number
    cpuUtilization: number
  }
}

const typeColors = {
  fire: {
    bg: 'bg-[oklch(0.72_0.14_30)]',
    text: 'text-[oklch(0.72_0.14_30)]',
    light: 'bg-[oklch(0.72_0.14_30/0.3)]'
  },
  medical: {
    bg: 'bg-[oklch(0.72_0.12_340)]',
    text: 'text-[oklch(0.72_0.12_340)]',
    light: 'bg-[oklch(0.72_0.12_340/0.3)]'
  },
  police: {
    bg: 'bg-[oklch(0.68_0.10_250)]',
    text: 'text-[oklch(0.68_0.10_250)]',
    light: 'bg-[oklch(0.68_0.10_250/0.3)]'
  },
  infrastructure: {
    bg: 'bg-[oklch(0.70_0.10_165)]',
    text: 'text-[oklch(0.70_0.10_165)]',
    light: 'bg-[oklch(0.70_0.10_165/0.3)]'
  }
}

export function GanttChart({ processes, metrics }: GanttChartProps) {
  const maxTime = Math.max(...processes.map(p => p.endTime || 0))
  const timeSlots = Array.from({ length: maxTime + 1 }, (_, i) => i)
  
  return (
    <GlassCard delay={0.5} hover={false} className="overflow-hidden">
      <h3 className="text-lg font-semibold mb-6">Scheduling Gantt Chart</h3>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6">
        {Object.entries(typeColors).map(([type, colors]) => (
          <div key={type} className="flex items-center gap-2">
            <div className={cn('w-3 h-3 rounded-sm', colors.bg)} />
            <span className="text-xs text-muted-foreground capitalize">{type}</span>
          </div>
        ))}
      </div>
      
      {/* Chart */}
      <div className="overflow-x-auto pb-4">
        <div className="min-w-[600px]">
          {/* Time axis */}
          <div className="flex mb-2 pl-24">
            {timeSlots.map((time) => (
              <div 
                key={time} 
                className="w-10 text-xs text-muted-foreground text-center flex-shrink-0"
              >
                {time}
              </div>
            ))}
          </div>
          
          {/* Process rows */}
          <div className="space-y-2">
            {processes.map((process, index) => (
              <motion.div
                key={process.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-center gap-2"
              >
                {/* Process label */}
                <div className="w-20 flex-shrink-0">
                  <span className={cn(
                    'text-xs font-medium truncate block',
                    typeColors[process.type].text
                  )}>
                    {process.id}
                  </span>
                </div>
                
                {/* Timeline */}
                <div className="flex-1 relative h-8 bg-secondary/20 rounded-lg overflow-hidden">
                  {process.startTime !== undefined && process.endTime !== undefined && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ 
                        delay: 0.5 + index * 0.1, 
                        duration: 0.5,
                        ease: 'easeOut'
                      }}
                      style={{
                        left: `${(process.startTime / maxTime) * 100}%`,
                        width: `${((process.endTime - process.startTime) / maxTime) * 100}%`,
                        originX: 0
                      }}
                      className={cn(
                        'absolute top-1 bottom-1 rounded-md flex items-center justify-center',
                        typeColors[process.type].bg
                      )}
                    >
                      <span className="text-[10px] font-medium text-white truncate px-1">
                        {process.name}
                      </span>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border/30">
          <div className="text-center">
            <p className="text-xl font-bold text-primary">{metrics.avgTurnaround.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Avg Turnaround</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-accent">{metrics.avgWaiting.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Avg Waiting</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-[oklch(0.72_0.12_340)]">{metrics.cpuUtilization.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground">CPU Utilization</p>
          </div>
        </div>
      )}
    </GlassCard>
  )
}
