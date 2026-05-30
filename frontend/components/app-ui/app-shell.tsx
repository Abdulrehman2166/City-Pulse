'use client'

import { AppNav } from './app-nav'
import { PulseBackground } from '@/components/pulse/pulse-background'
import { AnimatePresence, motion } from 'framer-motion'
import { usePathname } from 'next/navigation'

type AppShellProps = {
  children: React.ReactNode
  showNav?: boolean
}

export function AppShell({ children, showNav = true }: AppShellProps) {
  const pathname = usePathname()
  return (
    <div className="cp-app-shell">
      <PulseBackground />

      <div className="cp-app-content pt-6 pb-16 px-4 sm:px-6 min-h-screen">
        <AnimatePresence mode="wait">
          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-7xl mx-auto"
          >
            {showNav && <AppNav />}
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  )
}

export function ToolPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="cp-app-shell cp-tool-layout">
      <PulseBackground />
      {children}
    </div>
  )
}
