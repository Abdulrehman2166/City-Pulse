'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type PageHeaderProps = {
  eyebrow: string
  title: React.ReactNode
  subtitle?: string
  accentColor?: string
  dotColor?: string
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  dotColor = 'var(--state-safe)',
  actions,
  className,
}: PageHeaderProps) {
  return (
    <motion.header
      className={cn('cp-page-hero', className)}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="cp-page-hero-inner">
        <div className="cp-page-hero-accent" />
        <div className="cp-eyebrow cp-page-hero-eyebrow">
          <span className="cp-status-dot cp-status-dot-pulse" style={{ background: dotColor }} />
          {eyebrow}
        </div>
        <h1 className="cp-page-title">{title}</h1>
        {subtitle && <p className="cp-page-subtitle">{subtitle}</p>}
        {actions && <div className="cp-page-header-actions">{actions}</div>}
      </div>
    </motion.header>
  )
}
