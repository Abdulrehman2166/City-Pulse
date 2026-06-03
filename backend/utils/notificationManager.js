/**
 * notificationManager.js — Incident Notification & Prioritization Engine
 * =========================================================================
 * OS Concept: Inter-Process Communication (IPC) + Signal Dispatch
 *
 * When an incident (process) is created, this engine analyzes the system state,
 * determines the notification routing strategy, and constructs context-rich
 * operational briefings — never generic templates.
 *
 * Key behaviors:
 *   • 1 active incident  → Direct Briefing to assigned role's dashboard
 *   • 2+ active incidents → Role briefings + Admin Decision Request (ADR)
 *   • ADR includes: PID telemetry, priority ranking, resource contention analysis
 */

// ── In-memory Notification Store ─────────────────────────────────────────────
const notificationStore = [];
let _notifIdCounter = 1;

// ── Severity Map ──────────────────────────────────────────────────────────────
const SEVERITY_MAP = {
  CRITICAL: { label: 'CRITICAL', color: '#FF4444', urgencyPhrase: 'Immediate deployment required' },
  HIGH:     { label: 'HIGH',     color: '#FF8C00', urgencyPhrase: 'Prioritized dispatch recommended' },
  MEDIUM:   { label: 'MEDIUM',  color: '#FFD700', urgencyPhrase: 'Standard response protocol activated' },
  LOW:      { label: 'LOW',     color: '#4a8c6f', urgencyPhrase: 'Monitor and log, delayed response acceptable' },
};

// ── Department Tactical Vocabulary ───────────────────────────────────────────
const TACTICAL_TEMPLATES = {
  fire: {
    roleLabel: 'Fire Response Unit',
    actionVerb: 'thermal containment operation',
    unit: 'Fire Crew',
    systemMeta: 'Deploy aerial thermal imaging and ground suppression units.',
    severityKeyword: {
      CRITICAL: 'Active combustion escalation',
      HIGH: 'Structural fire hazard',
      MEDIUM: 'Controlled burn risk',
      LOW: 'Smoke detection alert'
    }
  },
  medical: {
    roleLabel: 'Emergency Medical Services',
    actionVerb: 'medical intervention protocol',
    unit: 'EMT Unit',
    systemMeta: 'Activate trauma team and coordinate hospital pre-alert.',
    severityKeyword: {
      CRITICAL: 'Life-threatening multi-casualty event',
      HIGH: 'Critical injury response required',
      MEDIUM: 'Non-critical medical emergency',
      LOW: 'Minor injury or wellness check'
    }
  },
  police: {
    roleLabel: 'Police Command Division',
    actionVerb: 'tactical law enforcement operation',
    unit: 'Patrol Unit',
    systemMeta: 'Secure perimeter, coordinate with dispatch for backup assessment.',
    severityKeyword: {
      CRITICAL: 'Active armed threat in progress',
      HIGH: 'Violent incident escalation',
      MEDIUM: 'Criminal activity reported',
      LOW: 'Non-emergency law enforcement request'
    }
  },
  admin: {
    roleLabel: 'System Administrator',
    actionVerb: 'resource arbitration',
    unit: 'Control Node',
    systemMeta: 'Admin intervention required to prevent priority inversion and resource starvation.',
    severityKeyword: {
      CRITICAL: 'Critical multi-system contention',
      HIGH: 'High-priority scheduling conflict',
      MEDIUM: 'Moderate queue overload',
      LOW: 'Minor workload imbalance'
    }
  }
};

// ── Priority → Severity Label ─────────────────────────────────────────────────
function deriveSeverity(priorityNumber) {
  if (priorityNumber === 1) return 'CRITICAL';
  if (priorityNumber === 2) return 'HIGH';
  if (priorityNumber === 3) return 'MEDIUM';
  return 'LOW';
}

// ── Direct Role Briefing Generator ───────────────────────────────────────────
function generateDirectBriefing(incident, role) {
  const template = TACTICAL_TEMPLATES[role] || TACTICAL_TEMPLATES.admin;
  const severity = deriveSeverity(incident.schedulingMeta?.priority || 3);
  const severityInfo = SEVERITY_MAP[severity];
  const keyword = template.severityKeyword[severity];
  const burstTime = incident.schedulingMeta?.burstEstimate || 5;
  const pid = String(incident.id).padStart(4, '0');
  const timestamp = new Date().toLocaleTimeString('en-US', {
    hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  return {
    id: _notifIdCounter++,
    recipientRole: role,
    incidentId: incident.id,
    kind: 'direct_briefing',
    severity,
    adrState: 'none',
    read: false,
    createdAt: new Date().toISOString(),
    headline: `🚨 ${severity} OPERATIONAL BRIEFING — PID #${pid}`,
    content:
      `${keyword} detected at ${incident.location}. ` +
      `Incident analysis: "${incident.description || 'No additional description provided'}". ` +
      `Estimated CPU burst window: ${burstTime} dispatch units. ` +
      `${template.systemMeta} ` +
      `Action required: Deploy ${template.unit} for ${template.actionVerb} at target coordinates. ` +
      `System priority tier: ${severity} (${severityInfo.urgencyPhrase}). ` +
      `Dispatch timestamp: ${timestamp} · Process remains in READY state until acknowledged.`,
    meta: {
      location: incident.location,
      type: incident.type,
      pid,
      burstTime,
      severity,
      priorityLabel: incident.schedulingMeta?.priorityLabel || severity,
      timestamp,
      color: severityInfo.color,
    }
  };
}

// ── Admin Decision Request (ADR) Generator ────────────────────────────────────
function generateADR(incidentsList, newIncident) {
  const allActive = [
    ...incidentsList.filter(i => i.id !== newIncident.id && i.status !== 'resolved'),
    newIncident
  ];
  const pid = String(newIncident.id).padStart(4, '0');
  const timestamp = new Date().toLocaleTimeString('en-US', {
    hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  // Build process telemetry summary
  const processSummary = allActive.map(inc => {
    const sev = deriveSeverity(inc.schedulingMeta?.priority || 3);
    return `PID#${String(inc.id).padStart(4,'0')} [${inc.type.toUpperCase()}@${inc.location}] · Priority=${sev} · Burst=${inc.schedulingMeta?.burstEstimate || '?'}u · Status=${inc.status}`;
  }).join(' | ');

  // Automated recommendation: CFS-inspired sort (priority first, then burst time)
  const recommended = [...allActive].sort((a, b) => {
    const pa = a.schedulingMeta?.priority || 3;
    const pb = b.schedulingMeta?.priority || 3;
    if (pa !== pb) return pa - pb;
    return (a.schedulingMeta?.burstEstimate || 5) - (b.schedulingMeta?.burstEstimate || 5);
  });

  const topPID = String(recommended[0].id).padStart(4, '0');
  const topRole = recommended[0].type;
  const highestSeverity = deriveSeverity(
    allActive.reduce((min, i) => Math.min(min, i.schedulingMeta?.priority || 3), 5)
  );

  return {
    id: _notifIdCounter++,
    recipientRole: 'admin',
    incidentId: newIncident.id,
    kind: 'admin_adr',
    severity: highestSeverity,
    adrState: 'pending',
    read: false,
    createdAt: new Date().toISOString(),
    headline: `⚠️ CONCURRENT WORKLOAD ALERT — ${allActive.length} ACTIVE PROCESSES · PID #${pid}`,
    content:
      `Multiple emergency incidents are now active simultaneously, creating potential resource contention. ` +
      `Scheduler analysis detected ${allActive.length} ready-state threads competing for dispatch resources. ` +
      `Process Table: [${processSummary}]. ` +
      `System Recommendation: CFS heuristic suggests PID#${topPID} (${topRole.toUpperCase()}) as highest-priority thread based on priority class and burst estimate. ` +
      `⚡ Action Required: Admin may override scheduling order manually or authorize automated Fair-Share resolution. ` +
      `Priority inversion risk: ${allActive.length > 3 ? 'HIGH — Starvation possible for lower-priority threads' : 'MODERATE — Monitor for aging threshold breach'}. ` +
      `ADR timestamp: ${timestamp}`,
    meta: {
      activeCount: allActive.length,
      recommendedPID: topPID,
      recommendedRole: topRole,
      processes: allActive.map(inc => ({
        pid: String(inc.id).padStart(4, '0'),
        type: inc.type,
        location: inc.location,
        status: inc.status,
        severity: deriveSeverity(inc.schedulingMeta?.priority || 3),
        burstTime: inc.schedulingMeta?.burstEstimate || 5,
        priority: inc.schedulingMeta?.priority || 3,
        priorityLabel: inc.schedulingMeta?.priorityLabel || 'MEDIUM',
        createdAt: inc.createdAt,
      })),
      timestamp,
      color: SEVERITY_MAP[highestSeverity].color,
    }
  };
}

// ── Main Dispatch Engine ──────────────────────────────────────────────────────
function processIncidentNotifications(newIncident, allIncidents) {
  const generatedNotifs = [];

  const previouslyActiveCount = allIncidents.filter(
    i => i.id !== newIncident.id && i.status !== 'resolved'
  ).length;

  if (previouslyActiveCount === 0) {
    // Case A: Single incident — direct briefing only
    const assignedRoles = newIncident.assignedRoles || [newIncident.type];
    assignedRoles.forEach(role => {
      if (TACTICAL_TEMPLATES[role]) {
        const notif = generateDirectBriefing(newIncident, role);
        notificationStore.push(notif);
        generatedNotifs.push(notif);
      }
    });
    console.log(`[NOTIF-ENGINE] Case A: Direct briefing → [${(newIncident.assignedRoles || [newIncident.type]).join(', ')}] for PID#${String(newIncident.id).padStart(4,'0')}`);
  } else {
    // Case B: Multiple incidents — role briefings + ADR
    const assignedRoles = newIncident.assignedRoles || [newIncident.type];
    assignedRoles.forEach(role => {
      if (TACTICAL_TEMPLATES[role]) {
        const notif = generateDirectBriefing(newIncident, role);
        notificationStore.push(notif);
        generatedNotifs.push(notif);
      }
    });

    const adr = generateADR(allIncidents, newIncident);
    notificationStore.push(adr);
    generatedNotifs.push(adr);

    console.log(`[NOTIF-ENGINE] Case B: ${assignedRoles.length} briefing(s) + ADR · ${previouslyActiveCount + 1} active processes.`);
  }

  return generatedNotifs;
}

// ── Notification Query API ────────────────────────────────────────────────────
function getNotificationsForRole(role, includeRead = false) {
  return notificationStore
    .filter(n => n.recipientRole === role && (includeRead || !n.read))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function getADRsForAdmin(stateFilter = null) {
  return notificationStore
    .filter(n => n.recipientRole === 'admin' && n.kind === 'admin_adr' &&
      (stateFilter ? n.adrState === stateFilter : true))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function markNotificationRead(notifId, role) {
  const notif = notificationStore.find(n => n.id === Number(notifId) && n.recipientRole === role);
  if (notif) { notif.read = true; return notif; }
  return null;
}

function markADRResolved(adrId, resolution, resolvedBy) {
  const adr = notificationStore.find(n => n.id === Number(adrId) && n.kind === 'admin_adr');
  if (adr) {
    adr.adrState = resolvedBy === 'admin' ? 'admin_resolved' : 'system_resolved';
    adr.resolvedAt = new Date().toISOString();
    adr.resolvedBy = resolvedBy;
    adr.resolutionOrder = resolution;
    return adr;
  }
  return null;
}

function getAllNotifications() {
  return [...notificationStore].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function getUnreadCount(role) {
  return notificationStore.filter(n => n.recipientRole === role && !n.read).length;
}

module.exports = {
  processIncidentNotifications,
  getNotificationsForRole,
  getADRsForAdmin,
  markNotificationRead,
  markADRResolved,
  getAllNotifications,
  getUnreadCount,
  SEVERITY_MAP,
  TACTICAL_TEMPLATES,
};
