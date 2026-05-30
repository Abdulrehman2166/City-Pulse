import { cn } from '@/lib/utils'

export type SystemState = 'crisis' | 'disruption' | 'monitoring' | 'stable' | 'intelligence' | 'command'

export function statusVariant(status: string): 'pending' | 'progress' | 'resolved' | 'crisis' | 'monitoring' {
  const s = status.toLowerCase()
  if (s === 'resolved') return 'resolved'
  if (s === 'in progress' || s === 'in_progress' || s === 'en route' || s === 'enroute') return 'progress'
  if (s === 'critical' || s === 'emergency') return 'crisis'
  if (s === 'reported' || s === 'pending' || s === 'queued') return 'pending'
  return 'monitoring'
}

const variantClass: Record<ReturnType<typeof statusVariant>, string> = {
  pending: 'pending',
  progress: 'progress',
  resolved: 'resolved',
  crisis: 'crisis',
  monitoring: 'monitoring',
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span className={cn('cp-badge', variantClass[statusVariant(status)], className)}>
      {status}
    </span>
  )
}

/** Map incident type to semantic state color class */
export function incidentStateClass(type: string): string {
  const t = type.toLowerCase()
  if (t === 'fire') return 'state-crisis'
  if (t === 'medical') return 'state-alert'
  if (t === 'police') return 'state-intelligence'
  return 'state-watch'
}
