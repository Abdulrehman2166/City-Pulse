'use client'

import { useState } from 'react'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    notificationEmail: 'admin@citypulse.local',
    maxIncidentsPerDay: 500,
    autoAssignEnabled: true,
    smtpServer: 'smtp.citypulse.local',
  })

  const handleSave = () => {
    alert('Settings saved successfully')
  }

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-[var(--foreground)]">System Settings</h2>
        <p className="text-[var(--muted-foreground)] mt-1">Configure system behavior, integrations, and notifications</p>
      </header>

      {/* General Settings */}
      <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--border)]">
        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">General</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-[var(--muted-foreground)]">System Name</label>
            <input type="text" defaultValue="CityPulse" className="w-full mt-1 p-2 rounded bg-[var(--muted)]/60 text-[var(--foreground)] border border-[var(--border)]/30" />
          </div>
          <div>
            <label className="text-sm text-[var(--muted-foreground)]">Support Email</label>
            <input
              type="email"
              value={settings.notificationEmail}
              onChange={e => setSettings({ ...settings, notificationEmail: e.target.value })}
              className="w-full mt-1 p-2 rounded bg-[var(--muted)]/60 text-[var(--foreground)] border border-[var(--border)]/30"
            />
          </div>
        </div>
      </div>

      {/* Incident Settings */}
      <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--border)]">
        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Incident Handling</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-[var(--muted-foreground)]">Max Incidents per Day</label>
            <input
              type="number"
              value={settings.maxIncidentsPerDay}
              onChange={e => setSettings({ ...settings, maxIncidentsPerDay: parseInt(e.target.value) })}
              className="w-full mt-1 p-2 rounded bg-[var(--muted)]/60 text-[var(--foreground)] border border-[var(--border)]/30"
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.autoAssignEnabled}
              onChange={e => setSettings({ ...settings, autoAssignEnabled: e.target.checked })}
              className="w-4 h-4 accent-[var(--primary)]"
            />
            <label className="text-sm text-[var(--muted-foreground)]">Enable automatic role-based assignment</label>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--border)]">
        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm text-[var(--muted-foreground)]">Email Notifications</label>
            <input type="checkbox" defaultChecked className="w-4 h-4" />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm text-[var(--muted-foreground)]">SMS Notifications</label>
            <input type="checkbox" defaultChecked className="w-4 h-4" />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm text-[var(--muted-foreground)]">Push Notifications</label>
            <input type="checkbox" className="w-4 h-4 accent-[var(--primary)]" />
          </div>
        </div>
      </div>

      {/* SMTP Settings */}
      <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--border)]">
        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Email (SMTP)</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-[var(--muted-foreground)]">SMTP Server</label>
            <input
              type="text"
              value={settings.smtpServer}
              onChange={e => setSettings({ ...settings, smtpServer: e.target.value })}
              className="w-full mt-1 p-2 rounded bg-[var(--muted)]/60 text-[var(--foreground)] border border-[var(--border)]/30"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-[var(--muted-foreground)]">Port</label>
              <input type="number" defaultValue={587} className="w-full mt-1 p-2 rounded bg-[var(--muted)]/60 text-[var(--foreground)] border border-[var(--border)]/30" />
            </div>
            <div>
              <label className="text-sm text-[var(--muted-foreground)]">Encryption</label>
              <select className="w-full mt-1 p-2 rounded bg-[var(--muted)]/60 text-[var(--foreground)] border border-[var(--border)]/30">
                <option>TLS</option>
                <option>SSL</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <button onClick={handleSave} className="px-6 py-3 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:bg-[var(--primary)]/90 transition-all">
        Save Settings
      </button>
    </div>
  )
}
