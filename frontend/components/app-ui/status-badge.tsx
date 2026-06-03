import { cn } from '@/lib/utils'

export type SystemState = 'crisis' | 'disruption' | 'monitoring' | 'stable' | 'intelligence' | 'command'

export function statusVariant(status: string): 'pending' | 'progress' | 'resolved' | 'crisis' | 'monitoring' {
  const s = status.toLowerCase()
  if (s === 'resolved' || s === 'completed') return 'resolved'
  if (['assigned', 'dispatched', 'arrived'].includes(s)) return 'progress'
  if (s === 'critical' || s === 'emergency') return 'crisis'
  if (s === 'received') return 'pending'
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
  // Capitalize first letter for display
  const displayStatus = status.charAt(0).toUpperCase() + status.slice(1)

  return (
    <span className={cn('cp-badge', variantClass[statusVariant(status)], className)}>
      {displayStatus}
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
