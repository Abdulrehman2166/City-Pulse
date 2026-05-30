'use client'

export default function RolesPage() {
  const roles = [
    { name: 'admin', description: 'System administrator with full access', permissions: ['read', 'write', 'delete', 'manage_users'] },
    { name: 'fire', description: 'Fire handling department', permissions: ['read', 'write', 'fire_incidents'] },
    { name: 'police', description: 'Police department', permissions: ['read', 'write', 'crime_incidents'] },
    { name: 'medical', description: 'Medical/Ambulance teams', permissions: ['read', 'write', 'medical_incidents'] },
    { name: 'user', description: 'General public / incident reporters', permissions: ['read', 'report_incident'] },
  ]

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-[var(--foreground)]">Role Management</h2>
        <p className="text-[var(--muted-foreground)] mt-1">Configure roles, permissions, and access levels</p>
      </header>

      <div className="space-y-4">
        {roles.map(role => (
          <div key={role.name} className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--border)]">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-semibold text-[var(--foreground)] capitalize">{role.name}</h3>
                <p className="text-[var(--muted-foreground)] text-sm mt-1">{role.description}</p>
              </div>
              <button className="text-[var(--muted-foreground)] hover:text-[var(--primary)] text-sm">Edit</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {role.permissions.map(perm => (
                <span key={perm} className="px-2 py-1 bg-[var(--secondary)]/20 text-[var(--secondary)] text-xs rounded">
                  {perm}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--border)]">
        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Create New Role</h3>
        <div className="space-y-4">
          <input type="text" placeholder="Role name" className="w-full p-2 rounded bg-[var(--muted)]/60 text-[var(--foreground)] border border-[var(--border)]/30" />
          <textarea placeholder="Description" className="w-full p-2 rounded bg-[var(--muted)]/60 text-[var(--foreground)] border border-[var(--border)]/30" rows={2}></textarea>
          <button className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:bg-[var(--primary)]/90 transition">Create Role</button>
        </div>
      </div>
    </div>
  )
}
