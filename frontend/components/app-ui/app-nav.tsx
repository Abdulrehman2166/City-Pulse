'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Home, LogOut, Play, BarChart3, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CityPulseLogo } from '@/components/citypulse-logo'

const links = [
  { href: '/landing', label: 'Home', icon: Home },
  { href: '/simulation', label: 'Simulation', icon: Play },
  { href: '/comparison', label: 'Compare', icon: BarChart3 },
]

export function AppNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [role, setRole] = useState('')

  useEffect(() => {
    setRole(localStorage.getItem('role') || '')
  }, [])

  const dashboardHref =
    role === 'admin' ? '/admin' :
    role === 'police' ? '/police' :
    role === 'fire' ? '/fire' :
    role === 'medical' ? '/medical' :
    role === 'citizen' ? '/citizen' :
    '/login'

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    router.push('/login')
  }

  return (
    <nav className="cp-app-nav">
      <Link href="/landing" className="cp-app-nav-brand">
        <CityPulseLogo size="sm" />
        City Pulse <span className="cp-brand">Control</span>
      </Link>

      <div className="cp-app-nav-links">
        {role && (
          <Link
            href={dashboardHref}
            className={cn('cp-app-nav-link relative overflow-hidden', pathname === dashboardHref && 'active')}
          >
            {pathname === dashboardHref && (
              <motion.span
                layoutId="cp-nav-indicator"
                className="absolute inset-0 -z-10"
                style={{
                  borderRadius: '0.65rem',
                  background: 'color-mix(in srgb, var(--state-intelligence) 10%, white)',
                  border: '1px solid color-mix(in srgb, var(--state-intelligence) 25%, transparent)',
                }}
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <LayoutDashboard size={14} />
            Dashboard
          </Link>
        )}
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn('cp-app-nav-link relative overflow-hidden', pathname === href && 'active')}
          >
            {pathname === href && (
              <motion.span
                layoutId="cp-nav-indicator"
                className="absolute inset-0 -z-10"
                style={{
                  borderRadius: '0.65rem',
                  background: 'color-mix(in srgb, var(--state-intelligence) 10%, white)',
                  border: '1px solid color-mix(in srgb, var(--state-intelligence) 25%, transparent)',
                }}
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <Icon size={14} />
            {label}
          </Link>
        ))}
      </div>

      <div className="cp-app-nav-actions">
        {role && (
          <span className={cn('cp-role-badge', role)}>{role}</span>
        )}
        <button type="button" onClick={logout} className="cp-app-nav-link">
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </nav>
  )
}
