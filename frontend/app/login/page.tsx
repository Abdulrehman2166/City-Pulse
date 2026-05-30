'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Lock, User, Shield, Flame, Car, HeartPulse } from 'lucide-react'
import { PulseBackground } from '@/components/pulse/pulse-background'
import { CityPulseLogo } from '@/components/citypulse-logo'

function GridOverlay() {
  return <div className="cp-grid-overlay" style={{ opacity: 0.03 }} />
}

function FloatingParticles() {
  const getStyle = (i: number) => {
    const seed = (i * 12321) % 1000
    return {
      left:  `${(seed / 1000) * 100}%`,
      top:   `${((seed * 2) / 1000) * 100}%`,
      animationDelay: `${(seed / 1000) * 8}s`,
      animationDuration: `${6 + (seed / 1000) * 6}s`,
      width:  `${1 + (seed / 1000) * 2}px`,
      height: `${1 + (seed / 1000) * 2}px`,
      opacity: 0.15 + (seed / 1000) * 0.3,
    }
  }
  return (
    <div className="cp-particles" aria-hidden="true">
      {Array.from({ length: 30 }).map((_, i) => (
        <div key={i} className="cp-particle" style={getStyle(i)} />
      ))}
    </div>
  )
}

function RadarPulse() {
  return (
    <div className="cp-radar" style={{ width: 160, height: 160, opacity: 0.25 }}>
      {[0, 1, 2].map(i => (
        <div key={i} className="cp-radar-ring" style={{ animationDelay: `${i * 0.8}s` }} />
      ))}
      <div className="cp-radar-dot" />
    </div>
  )
}

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'citizen' | 'police' | 'fire' | 'medical' | 'admin'>('citizen')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const routeForRole = (r: string) => {
    switch (r) {
      case 'citizen': return '/citizen'
      case 'police': return '/police'
      case 'fire': return '/fire'
      case 'medical': return '/medical'
      case 'admin': return '/admin'
      default: return '/citizen'
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const body = await res.json()
      if (!res.ok) return setError(body.message || 'Login failed')
      // UX: role is selected in UI, but enforced by server.
      // If mismatch, block sign-in to prevent confusion / cross-role leakage.
      if (body?.user?.role !== role) {
        return setError(`Role mismatch. This account is "${body?.user?.role}", but you selected "${role}".`)
      }
      localStorage.setItem('token', body.token)
      localStorage.setItem('role', body.user.role)
      router.push(routeForRole(body.user.role))
    } catch (err) {
      setError('Network error')
    } finally {
      setIsLoading(false)
    }
  }

  const roles = [
    { value: 'citizen' as const, label: 'Citizen', icon: <User size={18} /> },
    { value: 'police' as const, label: 'Police', icon: <Car size={18} /> },
    { value: 'fire' as const, label: 'Fire', icon: <Flame size={18} /> },
    { value: 'medical' as const, label: 'Medical', icon: <HeartPulse size={18} /> },
    { value: 'admin' as const, label: 'Admin', icon: <Shield size={18} /> },
  ]

  const inputStyles: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem 0.75rem 0.75rem 2.75rem',
    borderRadius: 8,
    border: '1px solid rgba(200,85,61,0.2)',
    background: 'rgba(10,10,20,0.6)',
    color: 'var(--foreground)',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'all 0.3s',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
  }

  // Cursor tracking effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const dot = document.getElementById('cursor-dot')
      const ring = document.getElementById('cursor-ring')
      if (dot) dot.style.transform = `translate(${e.clientX - 3}px, ${e.clientY - 3}px)`
      if (ring) ring.style.transform = `translate(${e.clientX - 14}px, ${e.clientY - 14}px)`
    }
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <main className="cp-app-shell cp-root" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
      <PulseBackground />
      {/* Animated background blobs */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            top: '-20%',
            right: '-20%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at center, rgba(200,85,61,0.15) 0%, transparent 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none'
          }}
        />
        <motion.div
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            bottom: '-10%',
            left: '-15%',
            width: '350px',
            height: '350px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at center, rgba(74,140,111,0.1) 0%, transparent 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none'
          }}
        />
      </div>

      <GridOverlay />
      <FloatingParticles />

      {/* Custom cursor */}
      <div id="cursor-dot" className="cursor-dot" />
      <div id="cursor-ring" className="cursor-ring" />

      {/* Top-left radar */}
      <motion.div 
        style={{ position: 'absolute', top: '8%', left: '5%', pointerEvents: 'none' }}
        animate={{ 
          y: [0, -10, 0],
          x: [0, 5, 0]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <RadarPulse />
      </motion.div>

      {/* Bottom-right radar */}
      <motion.div 
        style={{ position: 'absolute', bottom: '8%', right: '5%', pointerEvents: 'none' }}
        animate={{ 
          y: [0, 10, 0],
          x: [0, -5, 0]
        }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      >
        <RadarPulse />
      </motion.div>

      {/* ── Login Card ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96, rotateX: 10 }}
        animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{
          width: '100%',
          maxWidth: 440,
          position: 'relative',
          zIndex: 10,
          perspective: '1000px',
        }}
      >

        <form
          onSubmit={handleLogin}
          className="cp-panel cp-login-card"
          style={{
            padding: '2.5rem',
            position: 'relative',
            overflow: 'hidden',
            zIndex: 10,
            maxWidth: 440,
            width: '100%',
          }}
        >
          <GridOverlay />

          {/* Logo + Title */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            style={{ textAlign: 'center', marginBottom: '2rem', position: 'relative', zIndex: 2 }}
          >
            <Link href="/landing" className="inline-flex items-center gap-3 mb-4 cursor-pointer hover:opacity-90 transition-opacity">
              <CityPulseLogo size="md" priority />
              <div style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--foreground)' }}>
                CityPulse <span className="cp-brand">OS</span>
              </div>
            </Link>
            <div className="cp-eyebrow" style={{ justifyContent: 'center', display: 'flex', marginBottom: 0, fontSize: '0.75rem' }}>
              <span className="cp-status-dot" style={{ background: '#4a8c6f' }} />
              Select role & authenticate
            </div>
          </motion.div>

          {/* Role selector */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            style={{ marginBottom: '1.75rem', position: 'relative', zIndex: 2 }}
          >

            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>
              Role
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
              {roles.map((r, idx) => (
                <motion.button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + idx * 0.05, duration: 0.4 }}
                  whileHover={{ scale: 1.08, y: -3 }}
                  whileTap={{ scale: 0.93 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    padding: '0.65rem 0.3rem',
                    borderRadius: 10,
                    border: role === r.value ? '1.5px solid rgba(200,85,61,0.7)' : '1px solid rgba(200,85,61,0.15)',
                    background: role === r.value ? 'linear-gradient(135deg, rgba(200,85,61,0.2) 0%, rgba(200,85,61,0.08) 100%)' : 'rgba(255,255,255,0.02)',
                    color: role === r.value ? '#ff9966' : 'var(--muted-foreground)',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    boxShadow: role === r.value ? 'inset 0 1px 0 rgba(255,255,255,0.1), 0 0 15px rgba(200,85,61,0.2)' : 'none',
                  }}
                >
                  <motion.span
                    style={{ fontSize: '1.2rem' }}
                    animate={role === r.value ? { scale: 1.15, y: -2 } : { scale: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {r.icon}
                  </motion.span>
                  {r.label}
                </motion.button>
              ))}
            </div>
            <div className="cp-eyebrow" style={{ justifyContent: 'center', display: 'flex', marginTop: '0.75rem', marginBottom: 0, fontSize: '0.72rem' }}>
              <span className="cp-status-dot" style={{ background: '#4a8c6f' }} />
              Role is verified server-side (selection is only for convenience)
            </div>
          </motion.div>

          {/* Username */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            style={{ marginBottom: '1rem', position: 'relative', zIndex: 2 }}
          >
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Username</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(200,85,61,0.5)' }} />
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                style={inputStyles}
                placeholder="Enter username"
                required
              />
            </div>
          </motion.div>

          {/* Password */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.55, duration: 0.4 }}
            style={{ marginBottom: '1.5rem', position: 'relative', zIndex: 2 }}
          >
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(200,85,61,0.5)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ ...inputStyles, paddingRight: '2.75rem' }}
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(200,85,61,0.5)' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </motion.div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  marginBottom: '1rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 8,
                  background: 'rgba(200,85,61,0.12)',
                  border: '1px solid rgba(200,85,61,0.3)',
                  color: '#c8553d',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  position: 'relative', zIndex: 2,
                }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.4 }}
            style={{ display: 'flex', gap: '0.75rem', position: 'relative', zIndex: 2 }}
          >
            <motion.button
              type="submit"
              disabled={isLoading}
              className="cp-cta-primary"
              whileHover={!isLoading ? { scale: 1.03, y: -2 } : {}}
              whileTap={!isLoading ? { scale: 0.97 } : {}}
              style={{
                flex: 1,
                padding: '0.85rem',
                fontSize: '0.9rem',
                border: 'none',
                opacity: isLoading ? 0.6 : 1,
                cursor: isLoading ? 'wait' : 'pointer',
                transition: 'all 0.3s',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <span style={{ position: 'relative', zIndex: 2 }}>
                {isLoading ? 'Signing in…' : 'Sign In'}
              </span>
              {/* Gradient shine effect on hover */}
              <motion.div
                initial={{ x: '-100%' }}
                whileHover={!isLoading ? { x: '100%' } : {}}
                transition={{ duration: 0.5 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                  zIndex: 1,
                }}
              />
            </motion.button>

            <motion.button
              type="button"
              className="cp-cta-outline"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              style={{ padding: '0.85rem 1.25rem', fontSize: '0.9rem', position: 'relative', overflow: 'hidden' }}
              onClick={async () => {
                setIsLoading(true)
                try {
                  if (role !== 'citizen') {
                    setError('Demo signup creates Citizen accounts only. Use the seeded demo users for Police/Fire/Medical/Admin.')
                    return
                  }
                  const res = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: 'demo-' + Date.now(), password: 'password', role: 'citizen' })
                  })
                  const body = await res.json()
                  if (res.ok) {
                    localStorage.setItem('token', body.token)
                    localStorage.setItem('role', body.user.role)
                    router.push(routeForRole(body.user.role))
                  } else {
                    setError(body.message || 'Sign up failed')
                  }
                } catch (err) {
                  setError('Network error')
                } finally {
                  setIsLoading(false)
                }
              }}
            >
              <span style={{ position: 'relative', zIndex: 2 }}>Demo</span>
              <motion.div
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.5 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                  zIndex: 1,
                }}
              />
            </motion.button>
          </motion.div>

          {/* Hint with animated background */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            style={{
              marginTop: '1.5rem',
              position: 'relative',
              zIndex: 2,
            }}
          >
            <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', textAlign: 'center' }}>
              Demo users: <span style={{ fontWeight: 600, color: 'rgba(200,85,61,0.8)' }}>citizen1</span> / <span style={{ fontWeight: 600, color: 'rgba(200,85,61,0.8)' }}>password</span> · <span style={{ fontWeight: 600, color: 'rgba(200,85,61,0.8)' }}>police1</span> / <span style={{ fontWeight: 600, color: 'rgba(200,85,61,0.8)' }}>password</span> · <span style={{ fontWeight: 600, color: 'rgba(200,85,61,0.8)' }}>fire1</span> / <span style={{ fontWeight: 600, color: 'rgba(200,85,61,0.8)' }}>password</span> · <span style={{ fontWeight: 600, color: 'rgba(200,85,61,0.8)' }}>medical1</span> / <span style={{ fontWeight: 600, color: 'rgba(200,85,61,0.8)' }}>password</span>
            </p>
          </motion.div>

          {/* Animated corner decorations */}
          <motion.div 
            className="cp-card-corner tl"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.div 
            className="cp-card-corner br"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3.5, repeat: Infinity }}
          />
        </form>
      </motion.div>
    </main>
  )
}
