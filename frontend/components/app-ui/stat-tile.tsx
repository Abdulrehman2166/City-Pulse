'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type StatTileProps = {
  label: string
  value: number | string
  icon?: React.ReactNode
  color?: string
  delay?: number
}

export function StatTile({ label, value, icon, color = 'var(--state-intelligence)', delay = 0 }: StatTileProps) {
  return (
    <motion.div
      className="cp-stat-tile"
      style={{ '--stat-color': color } as React.CSSProperties}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
    >
      <div className="cp-stat-tile-stripe" />
      {icon && <div className="cp-stat-tile-icon-wrap">{icon}</div>}
      <div className="cp-stat-tile-label">{label}</div>
      <div className="cp-stat-tile-value">{value}</div>
    </motion.div>
  )
}

export function StatGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('cp-stat-grid', className)}>{children}</div>
}
