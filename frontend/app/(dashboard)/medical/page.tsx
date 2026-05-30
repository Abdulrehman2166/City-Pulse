'use client'

import { ResponderDashboard } from '@/components/app-ui/responder-dashboard'
import { motion } from 'framer-motion'

export default function MedicalDashboard() {
  return (
    <div className="relative">
      <ResponderDashboard
        role="medical"
        apiPrefix="/api/medical"
        stateColor="var(--state-alert)"
        accentColor="var(--state-alert)"
        dotColor="var(--state-alert)"
        eyebrow="Medical Response · Assigned Emergencies Only"
        title="Medical"
        subtitle="Handle medical emergencies, update patient response status, and view assigned cases only."
        pendingLabel="Active Emergencies"
      />
    </div>
  )
}
