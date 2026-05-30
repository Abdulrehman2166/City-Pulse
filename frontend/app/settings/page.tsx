'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings as SettingsIcon, Bell, Moon, Sun, Monitor, 
  Palette, Volume2, VolumeX, Shield, Database, Save, RotateCcw 
} from 'lucide-react'
import { GlassCard } from '@/components/glass-card'
import Sidebar from '@/components/sidebar'
import { ToolPageShell } from '@/components/app-ui'
import { PageHeader } from '@/components/app-ui/page-header'
import { cn } from '@/lib/utils'

interface SettingToggleProps {
  label: string
  description: string
  enabled: boolean
  onToggle: () => void
  icon: React.ReactNode
}

function SettingToggle({ label, description, enabled, onToggle, icon }: SettingToggleProps) {
  return (
    <motion.div
      whileHover={{ x: 5 }}
      className="flex items-center justify-between p-4 rounded-xl bg-secondary/20 hover:bg-secondary/30 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-lg bg-secondary/50">
          {icon}
        </div>
        <div>
          <p className="font-medium text-sm">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={cn(
          'relative w-12 h-6 rounded-full transition-colors',
          enabled ? 'bg-primary' : 'bg-secondary'
        )}
      >
        <motion.div
          animate={{ x: enabled ? 24 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
        />
      </button>
    </motion.div>
  )
}

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: true,
    soundAlerts: true,
    autoRefresh: true,
    darkMode: true,
    highContrast: false,
    reducedMotion: false,
  })

  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>('dark')

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <ToolPageShell>
      <Sidebar />
      <main className="cp-tool-main max-w-4xl">
        <PageHeader
          eyebrow="System Preferences"
          title={
            <span className="bg-linear-to-r from-primary via-accent to-[oklch(0.68_0.10_250)] bg-clip-text text-transparent">
              Settings
            </span>
          }
          subtitle="Configure your CityPulse OS preferences and display options."
        />

        <div className="space-y-6">
          {/* Appearance */}
          <GlassCard delay={0.1} hover={false}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/20">
                <Palette className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Appearance</h3>
            </div>

            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-3">Theme</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'system', icon: Monitor, label: 'System' },
                  { value: 'light', icon: Sun, label: 'Light' },
                  { value: 'dark', icon: Moon, label: 'Dark' },
                ].map((option) => (
                  <motion.button
                    key={option.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setTheme(option.value as typeof theme)}
                    className={cn(
                      'flex items-center justify-center gap-2 p-3 rounded-xl border transition-all',
                      theme === option.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border/30 bg-secondary/20 text-muted-foreground hover:border-primary/30'
                    )}
                  >
                    <option.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{option.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <SettingToggle
                label="High Contrast"
                description="Increase contrast for better visibility"
                enabled={settings.highContrast}
                onToggle={() => toggleSetting('highContrast')}
                icon={<Shield className="w-4 h-4 text-muted-foreground" />}
              />
              <SettingToggle
                label="Reduced Motion"
                description="Minimize animations throughout the interface"
                enabled={settings.reducedMotion}
                onToggle={() => toggleSetting('reducedMotion')}
                icon={<RotateCcw className="w-4 h-4 text-muted-foreground" />}
              />
            </div>
          </GlassCard>

          {/* Notifications */}
          <GlassCard delay={0.2} hover={false}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-accent/20">
                <Bell className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-lg font-semibold">Notifications</h3>
            </div>

            <div className="space-y-3">
              <SettingToggle
                label="Push Notifications"
                description="Receive alerts for critical incidents"
                enabled={settings.notifications}
                onToggle={() => toggleSetting('notifications')}
                icon={<Bell className="w-4 h-4 text-muted-foreground" />}
              />
              <SettingToggle
                label="Sound Alerts"
                description="Play audio for emergency notifications"
                enabled={settings.soundAlerts}
                onToggle={() => toggleSetting('soundAlerts')}
                icon={settings.soundAlerts ? <Volume2 className="w-4 h-4 text-muted-foreground" /> : <VolumeX className="w-4 h-4 text-muted-foreground" />}
              />
            </div>
          </GlassCard>

          {/* Data & Sync */}
          <GlassCard delay={0.3} hover={false}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-[oklch(0.68_0.10_250/0.2)]">
                <Database className="w-5 h-5 text-[oklch(0.68_0.10_250)]" />
              </div>
              <h3 className="text-lg font-semibold">Data & Sync</h3>
            </div>

            <div className="space-y-3">
              <SettingToggle
                label="Auto Refresh"
                description="Automatically update dashboard data every 30 seconds"
                enabled={settings.autoRefresh}
                onToggle={() => toggleSetting('autoRefresh')}
                icon={<RotateCcw className="w-4 h-4 text-muted-foreground" />}
              />
            </div>

            <div className="mt-6 p-4 rounded-xl bg-secondary/20 border border-border/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Last synchronized</p>
                  <p className="text-xs text-muted-foreground">Today at 2:34 PM</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 rounded-lg bg-secondary/50 text-sm font-medium hover:bg-secondary transition-colors"
                >
                  Sync Now
                </motion.button>
              </div>
            </div>
          </GlassCard>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-end gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 rounded-xl bg-secondary/50 text-muted-foreground font-medium hover:bg-secondary transition-colors"
            >
              Reset to Defaults
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-primary to-accent text-primary-foreground font-medium"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </motion.button>
          </motion.div>
        </div>
      </main>
    </ToolPageShell>
  )
}
