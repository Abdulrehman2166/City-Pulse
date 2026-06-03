'use client'

import { ResponderDashboard } from '@/components/app-ui/responder-dashboard'
import { motion } from 'framer-motion'

export default function FireDashboard() {
  return (
    <div className="relative">
      <ResponderDashboard
        role="fire"
        apiPrefix="http://localhost:5000/api/fire"
        stateColor="var(--state-crisis)"
        accentColor="var(--state-crisis)"
        dotColor="var(--state-crisis)"
        eyebrow="Fire Response · Assigned Incidents Only"
        title="Fire"
        subtitle="Respond to fire emergencies, update incident status, and manage your assigned queue."
        pendingLabel="Active Fires"
      />
    </div>
  )
}
