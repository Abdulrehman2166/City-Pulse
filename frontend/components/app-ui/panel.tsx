'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type PanelProps = {
  children: React.ReactNode
  title?: React.ReactNode
  icon?: React.ReactNode
  headerRight?: React.ReactNode
  className?: string
  accent?: boolean
  accentColor?: string
}

export function Panel({
  children,
  title,
  icon,
  headerRight,
  className,
  accent,
  accentColor = 'var(--state-intelligence)',
}: PanelProps) {
  return (
    <motion.div
      className={cn('cp-panel', accent && 'cp-panel-accent', className)}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, boxShadow: 'var(--shadow-lg)' }}
    >
      <div
        className="cp-panel-stripe"
        style={{ background: accent ? accentColor : 'transparent' }}
      />
      {(title || headerRight) && (
        <div className="cp-panel-header-row">
          {title && (
            <h3 className="cp-panel-title">
              {icon && <span className="cp-panel-icon-wrap">{icon}</span>}
              {title}
            </h3>
          )}
          {headerRight}
        </div>
      )}
      {children}
    </motion.div>
  )
}
