'use client'

import { motion } from 'framer-motion'
import { GlassCard, ProgressRing } from './glass-card'
import { User, MapPin, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Responder {
  id: string
  name: string
  type: 'fire' | 'medical' | 'police' | 'infrastructure'
  status: 'available' | 'en-route' | 'on-scene'
  location: string
  eta?: string
}

const mockResponders: Responder[] = [
  { id: '1', name: 'Engine 7', type: 'fire', status: 'available', location: 'Station 7' },
  { id: '2', name: 'Medic 3', type: 'medical', status: 'en-route', location: 'Downtown', eta: '4 min' },
  { id: '3', name: 'Unit 12', type: 'police', status: 'on-scene', location: 'Main St & 5th' },
  { id: '4', name: 'Utility 1', type: 'infrastructure', status: 'available', location: 'Depot' },
  { id: '5', name: 'Ladder 2', type: 'fire', status: 'en-route', location: 'Industrial Zone', eta: '7 min' },
  { id: '6', name: 'Medic 7', type: 'medical', status: 'available', location: 'Station 3' },
]

const statusColors = {
  'available': {
    bg: 'bg-[oklch(0.72_0.12_155/0.2)]',
    text: 'text-[oklch(0.72_0.12_155)]',
    dot: 'bg-[oklch(0.72_0.12_155)]'
  },
  'en-route': {
    bg: 'bg-[oklch(0.78_0.12_85/0.2)]',
    text: 'text-[oklch(0.78_0.12_85)]',
    dot: 'bg-[oklch(0.78_0.12_85)]'
  },
  'on-scene': {
    bg: 'bg-[oklch(0.72_0.14_25/0.2)]',
    text: 'text-[oklch(0.72_0.14_25)]',
    dot: 'bg-[oklch(0.72_0.14_25)]'
  }
}

const typeColors = {
  fire: 'text-[oklch(0.72_0.14_30)]',
  medical: 'text-[oklch(0.72_0.12_340)]',
  police: 'text-[oklch(0.68_0.10_250)]',
  infrastructure: 'text-[oklch(0.70_0.10_165)]'
}

function ResponderItem({ responder, index }: { responder: Responder; index: number }) {
  const status = statusColors[responder.status]
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className={cn('w-2 h-2 rounded-full animate-pulse', status.dot)} />
        <div>
          <p className={cn('font-medium text-sm', typeColors[responder.type])}>
            {responder.name}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
            <MapPin className="w-3 h-3" />
            <span>{responder.location}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className={cn(
          'text-xs px-2 py-0.5 rounded-full font-medium',
          status.bg,
          status.text
        )}>
          {responder.status.replace('-', ' ')}
        </span>
        {responder.eta && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{responder.eta}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export function ResponderStatus() {
  return (
    <GlassCard delay={0.3} hover={false} className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Responder Status</h3>
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {mockResponders.length} units
          </span>
        </div>
      </div>
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
        {mockResponders.map((responder, index) => (
          <ResponderItem key={responder.id} responder={responder} index={index} />
        ))}
      </div>
    </GlassCard>
  )
}

export function SystemEfficiency() {
  return (
    <GlassCard delay={0.4} hover={false}>
      <h3 className="text-lg font-semibold mb-4">System Efficiency</h3>
      <div className="flex flex-col items-center">
        <ProgressRing progress={87} size={140} strokeWidth={10} />
        <p className="text-sm text-muted-foreground mt-4 text-center">
          Current response optimization score based on active scheduling algorithms
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="text-center p-3 rounded-xl bg-secondary/30">
          <p className="text-2xl font-bold text-accent">2.4m</p>
          <p className="text-xs text-muted-foreground">Avg Response</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-secondary/30">
          <p className="text-2xl font-bold text-primary">98.2%</p>
          <p className="text-xs text-muted-foreground">Uptime</p>
        </div>
      </div>
    </GlassCard>
  )
}
