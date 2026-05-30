'use client'

import { motion } from 'framer-motion'

const states = [
  { key: 'crisis', label: 'Crisis', desc: 'Active P1 threat' },
  { key: 'alert', label: 'Alert', desc: 'Service disruption' },
  { key: 'watch', label: 'Watch', desc: 'Queued / monitoring' },
  { key: 'safe', label: 'Safe', desc: 'Resolved / nominal' },
  { key: 'intelligence', label: 'Intel', desc: 'Dispatch & analysis' },
  { key: 'command', label: 'Command', desc: 'System control' },
] as const

export function StateLegend({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`cp-state-bar ${className}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.15 }}
    >
      <div className="cp-state-bar-label">
        <span className="cp-live-dot" />
        System state map
      </div>
      <div className="cp-state-bar-items">
        {states.map((s, i) => (
          <motion.div
            key={s.key}
            className="cp-state-chip"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 * i }}
            title={s.desc}
          >
            <span className="cp-state-chip-bar" style={{ background: `var(--state-${s.key})` }} />
            <span className="cp-state-chip-text">{s.label}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
