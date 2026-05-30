'use client'

import { motion } from 'framer-motion'

/** Semantic pulse nodes — colors = live system state, not decoration */
const nodes = [
  { color: 'var(--state-crisis)', x: '12%', y: '22%', delay: 0 },
  { color: 'var(--state-intelligence)', x: '78%', y: '18%', delay: 0.8 },
  { color: 'var(--state-command)', x: '88%', y: '62%', delay: 1.4 },
  { color: 'var(--state-stable)', x: '18%', y: '72%', delay: 2 },
  { color: 'var(--state-monitoring)', x: '52%', y: '48%', delay: 1.1 },
  { color: 'var(--state-disruption)', x: '65%', y: '78%', delay: 0.5 },
]

export function NeuralBackground() {
  return (
    <div className="neural-bg pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {/* Layered depth base */}
      <div className="neural-bg-layer neural-bg-void" />
      <div className="neural-bg-layer neural-bg-deep" />
      <div className="neural-bg-layer neural-bg-elevated" />

      {/* Command grid */}
      <div className="neural-grid" />

      {/* State pulses along grid */}
      {nodes.map((node, i) => (
        <motion.div
          key={i}
          className="neural-pulse-node"
          style={{ left: node.x, top: node.y, '--pulse-color': node.color } as React.CSSProperties}
          animate={{ opacity: [0.15, 0.55, 0.15], scale: [1, 1.35, 1] }}
          transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: node.delay }}
        />
      ))}

      {/* Slow intelligence sweep */}
      <motion.div
        className="neural-sweep"
        animate={{ x: ['-30%', '130%'] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  )
}
