'use client'

import { motion } from 'framer-motion'

const blobs = [
  { color: 'var(--pastel-lavender)', size: 'min(55vw, 420px)', top: '-8%', left: '-5%', delay: 0 },
  { color: 'var(--pastel-mint)', size: 'min(45vw, 360px)', top: '55%', left: '70%', delay: 1.2 },
  { color: 'var(--pastel-peach)', size: 'min(50vw, 380px)', top: '70%', left: '5%', delay: 0.6 },
  { color: 'var(--pastel-sky)', size: 'min(40vw, 320px)', top: '15%', left: '75%', delay: 1.8 },
]

export function PastelBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {blobs.map((blob, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl opacity-70"
          style={{
            width: blob.size,
            height: blob.size,
            top: blob.top,
            left: blob.left,
            background: `radial-gradient(circle at 30% 30%, ${blob.color}, transparent 70%)`,
          }}
          animate={{
            x: [0, 24, -12, 0],
            y: [0, -18, 12, 0],
            scale: [1, 1.06, 0.96, 1],
          }}
          transition={{
            duration: 14 + i * 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: blob.delay,
          }}
        />
      ))}
    </div>
  )
}
