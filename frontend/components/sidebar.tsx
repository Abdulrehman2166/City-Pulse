'use client'

import { motion } from 'framer-motion'
import { Activity, LayoutDashboard, Play, BarChart3, Settings, Zap, Home } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { CityPulseLogo } from '@/components/citypulse-logo'

const navItems = [
  { href: '/landing', icon: Home, label: 'Home' },
  { href: '/simulation', icon: Play, label: 'Simulation' },
  { href: '/comparison', icon: BarChart3, label: 'Compare' },
  { href: '/admin', icon: LayoutDashboard, label: 'Admin' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="cp-tool-sidebar">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
      >
        <Link href="/landing" className="cp-tool-sidebar-logo" title="CityPulse OS">
          <div className="relative">
            <CityPulseLogo size="md" />
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border border-background bg-[var(--state-safe)] shadow-[0_0_10px_rgba(156,221,183,0.7)]" />
          </div>
        </Link>
      </motion.div>

      <nav className="flex-1 flex flex-col items-center">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href
          return (
            <motion.div
              key={item.href}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.08 * (index + 1) }}
            >
              <Link
                href={item.href}
                className={cn('cp-tool-nav-item group', isActive && 'active')}
                title={item.label}
              >
                <item.icon className="w-5 h-5" />
                <span className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-card text-foreground text-xs font-medium opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap border border-border shadow-lg transition-opacity z-50">
                  {item.label}
                </span>
              </Link>
            </motion.div>
          )
        })}
      </nav>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col items-center gap-1"
        title="System online"
      >
        <Activity className="w-4 h-4 text-accent animate-pulse" />
        <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest">Live</span>
      </motion.div>
    </aside>
  )
}
