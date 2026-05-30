'use client'

import { motion } from 'framer-motion'

const states = [
  { key: 'crisis', label: 'Crisis', desc: 'P1 active threat' },
  { key: 'disruption', label: 'Disruption', desc: 'Service strain' },
  { key: 'monitoring', label: 'Monitoring', desc: 'Watch / queued' },
  { key: 'stable', label: 'Stable', desc: 'Resolved / nominal' },
  { key: 'intelligence', label: 'Intelligence', desc: 'Dispatch logic' },
  { key: 'command', label: 'Command', desc: 'System control' },
] as const

export function StateLegend({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`flex flex-wrap gap-2 ${className}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {states.map((s, i) => (
        <motion.div
          key={s.key}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-[var(--surface-border)] bg-[var(--surface-sunken)]"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 * i }}
          title={s.desc}
        >
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: `var(--state-${s.key})`, boxShadow: `0 0 8px var(--state-${s.key})` }}
          />
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            {s.label}
          </span>
        </motion.div>
      ))}
    </motion.div>
  )
}
