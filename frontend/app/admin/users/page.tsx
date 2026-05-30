'use client'

import { useEffect, useState } from 'react'
import { Trash2, User, Shield, BadgeCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUsers() {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (res.ok) {
          const data = await res.json()
          setUsers(data.users || [])
        }
      } catch (err) {
        console.error('Error fetching users', err)
      } finally { setLoading(false) }
    }
    fetchUsers()
  }, [])

  const cardStyle = {
    padding: '2rem',
    borderRadius: 12,
    border: '1px solid rgba(200,85,61,0.15)',
    background: 'linear-gradient(135deg, rgba(18,20,38,0.9) 0%, rgba(12,14,28,0.85) 100%)',
    backdropFilter: 'blur(8px)',
    position: 'relative',
  } as React.CSSProperties

  const btnPrimary = {
    padding: '0.6rem 1.2rem',
    borderRadius: 8,
    border: 'none',
    background: 'linear-gradient(90deg, #c8553d, #c9893a)',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'transform 0.2s',
  } as React.CSSProperties

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="cp-eyebrow" style={{ marginBottom: '0.75rem' }}>
          <span className="cp-status-dot" style={{ background: '#c8553d', display: 'inline-block' }} /> USER MANAGEMENT
        </div>
        <h1 style={{ fontSize: 'clamp(1.8rem,4vw,2.5rem)', fontWeight: 800, color: 'var(--foreground)', margin: 0 }}>
          User <span style={{ background: 'linear-gradient(90deg, #c8553d, #c9893a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Directory</span>
        </h1>
        <p style={{ color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>Manage system accounts, roles, and statuses</p>
      </motion.div>

      {/* Users Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}>
        <div style={cardStyle}>
          <div className="cp-grid-overlay" style={{ opacity: 0.02 }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '1.25rem', position: 'relative', zIndex: 2 }}>Active Users</h3>
          {loading ? (
            <div style={{ color: 'var(--muted-foreground)', position: 'relative', zIndex: 2 }}>Loading…</div>
          ) : users.length === 0 ? (
            <div style={{ color: 'var(--muted-foreground)', textAlign: 'center', padding: '2rem 0', position: 'relative', zIndex: 2 }}>No users found.</div>
          ) : (
            <div style={{ overflowX: 'auto', position: 'relative', zIndex: 2 }}>
              <table className="w-full text-sm" style={{ borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
                <thead className="border-b border-[var(--border)]">
                  <tr className="text-[var(--muted-foreground)]">
                    <th className="text-left py-2 px-4">ID</th>
                    <th className="text-left py-2 px-4">Username</th>
                    <th className="text-left py-2 px-4">Role</th>
                    <th className="text-left py-2 px-4">Status</th>
                    <th className="text-left py-2 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {users.map((u: any, i: number) => (
                      <motion.tr
                        key={u.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 12 }}
                        transition={{ delay: i * 0.05, duration: 0.3 }}
                        className="border border-[var(--border)] rounded-xl bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)]"
                        style={{ overflow: 'hidden' }}
                      >
                        <td className="py-3 px-4 text-[var(--foreground)]">#{u.id}</td>
                        <td className="py-3 px-4 text-[var(--foreground)] flex items-center gap-2"><User size={16} className="text-[var(--primary)]" />{u.username}</td>
                        <td className="py-3 px-4 text-[var(--foreground)]"><span className="px-2 py-1 bg-[var(--accent)]/20 text-[var(--accent)] text-xs rounded capitalize">{u.role}</span></td>
                        <td className="py-3 px-4 text-[var(--foreground)]"><span className="px-2 py-1 bg-[var(--secondary)]/20 text-[var(--secondary)] text-xs rounded capitalize">{u.status}</span></td>
                        <td className="py-3 px-4 flex items-center gap-2">
                          <button
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)' }}
                            onClick={async () => {
                              const token = localStorage.getItem('token')
                              await fetch(`/api/admin/users/${u.id}`, {
                                method: 'DELETE',
                                headers: {
                                  'Authorization': `Bearer ${token}`
                                }
                              })
                              setUsers(users.filter(x => x.id !== u.id))
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
          <div className="cp-card-corner tl" />
          <div className="cp-card-corner br" />
        </div>
      </motion.div>

      {/* Invite New User */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}>
        <div style={cardStyle}>
          <div className="cp-grid-overlay" style={{ opacity: 0.02 }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '1.25rem', position: 'relative', zIndex: 2 }}>Invite New User</h3>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              const form = e.currentTarget as HTMLFormElement
              const email = (form.email as any).value
              const role = (form.role as any).value
              // simple client‑side demo – in real app you'd post to /api/admin/users/invite
              console.log('Invite', { email, role })
            }}
          >
            <div className="space-y-4" style={{ position: 'relative', zIndex: 2 }}>
              <input type="email" name="email" placeholder="Email address" required className="w-full p-2 rounded bg-[var(--muted)]/60 text-[var(--foreground)] border border-[var(--border)]/30" />
              <select name="role" required className="w-full p-2 rounded bg-[var(--muted)]/60 text-[var(--foreground)] border border-[var(--border)]/30">
                <option value="">Select role…</option>
                <option value="admin">Admin</option>
                <option value="fire">Fire</option>
                <option value="police">Police</option>
                <option value="medical">Medical</option>
                <option value="user">User</option>
              </select>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                type="submit"
                style={btnPrimary}
              >
                Send Invite
              </motion.button>
            </div>
          </form>
          <div className="cp-card-corner tl" />
          <div className="cp-card-corner br" />
        </div>
      </motion.div>
    </div>
  )
}
