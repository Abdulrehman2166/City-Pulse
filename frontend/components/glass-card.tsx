'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { type LucideIcon } from 'lucide-react'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  delay?: number
  hover?: boolean
  glow?: 'fire' | 'medical' | 'police' | 'infrastructure' | 'none'
}

export function GlassCard({ 
  children, 
  className, 
  delay = 0, 
  hover = true,
  glow = 'none'
}: GlassCardProps) {
  const glowClasses = {
    fire: 'hover:glow-fire',
    medical: 'hover:glow-medical',
    police: 'hover:glow-police',
    infrastructure: 'hover:glow-infrastructure',
    none: ''
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={hover ? { y: -6, boxShadow: 'var(--shadow-lg)' } : undefined}
      whileTap={hover ? { scale: 0.99, y: 0 } : undefined}
      className={cn(
        'glass-card rounded-2xl p-6 transition-all duration-300 relative overflow-hidden bg-card border border-border shadow-[var(--shadow-md)]',
        hover && 'cursor-pointer hover:shadow-[var(--shadow-lg)]',
        glowClasses[glow],
        className
      )}
    >
      {/* Dynamic Shine Effect */}
      {hover && (
        <motion.div
          initial={{ x: '-100%', opacity: 0 }}
          whileHover={{ x: '100%', opacity: 0.2 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0 z-0 bg-linear-to-r from-transparent via-white to-transparent skew-x-12"
        />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: { value: number; positive: boolean }
  color: 'fire' | 'medical' | 'police' | 'infrastructure'
  delay?: number
}

export function StatCard({ title, value, icon: Icon, trend, color, delay = 0 }: StatCardProps) {
  const colorClasses = {
    fire: {
      bg: 'bg-[oklch(0.72_0.14_30/0.15)]',
      text: 'text-[oklch(0.72_0.14_30)]',
      border: 'border-[oklch(0.72_0.14_30/0.3)]'
    },
    medical: {
      bg: 'bg-[oklch(0.72_0.12_340/0.15)]',
      text: 'text-[oklch(0.72_0.12_340)]',
      border: 'border-[oklch(0.72_0.12_340/0.3)]'
    },
    police: {
      bg: 'bg-[oklch(0.68_0.10_250/0.15)]',
      text: 'text-[oklch(0.68_0.10_250)]',
      border: 'border-[oklch(0.68_0.10_250/0.3)]'
    },
    infrastructure: {
      bg: 'bg-[oklch(0.70_0.10_165/0.15)]',
      text: 'text-[oklch(0.70_0.10_165)]',
      border: 'border-[oklch(0.70_0.10_165/0.3)]'
    }
  }

  return (
    <GlassCard delay={delay} glow={color}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <motion.p 
            className="text-3xl font-bold mt-2"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + 0.2, type: 'spring', stiffness: 200 }}
          >
            {value}
          </motion.p>
          {trend && (
            <div className={cn(
              'text-sm mt-2 flex items-center gap-1',
              trend.positive ? 'text-accent' : 'text-destructive'
            )}>
              <span>{trend.positive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}% from last hour</span>
            </div>
          )}
        </div>
        <div className={cn(
          'p-3 rounded-xl border',
          colorClasses[color].bg,
          colorClasses[color].border
        )}>
          <Icon className={cn('w-6 h-6', colorClasses[color].text)} />
        </div>
      </div>
    </GlassCard>
  )
}

interface ProgressRingProps {
  progress: number
  size?: number
  strokeWidth?: number
  color?: string
  className?: string
}

export function ProgressRing({ 
  progress, 
  size = 120, 
  strokeWidth = 8,
  color = 'oklch(0.75 0.12 25)',
  className 
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className={cn('relative', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="oklch(0.25 0.02 280)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span 
          className="text-2xl font-bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {progress}%
        </motion.span>
      </div>
    </div>
  )
}
