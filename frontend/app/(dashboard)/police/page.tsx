'use client'

import { ResponderDashboard } from '@/components/app-ui/responder-dashboard'
import { motion } from 'framer-motion'

export default function PoliceDashboard() {
  return (
    <div className="relative">
      <ResponderDashboard
        role="police"
        apiPrefix="/api/police"
        stateColor="var(--state-intelligence)"
        eyebrow="Police Operations · Assigned Cases Only"
        title="Police"
        subtitle="Manage crime/case incidents, update case status, and access assigned reports only."
        pendingLabel="Pending Cases"
      />
    </div>
  )
}
