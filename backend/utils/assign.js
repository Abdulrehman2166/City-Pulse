/**
 * assign.js — Role Assignment & Dispatch Engine
 * ------------------------------------------------
 * OS Concept: This models a CPU "Interrupt Handler" and "Dispatcher".
 * When a new process (incident) enters the system, the interrupt handler
 * identifies which execution context (role/core) should handle it,
 * assigns burst time, priority, and escalation rules.
 */

// ── Priority Map ────────────────────────────────────────────────────────────
// Lower number = higher OS priority (P1 = critical, P5 = low)
const PRIORITY_LEVELS = {
  fire:           { priority: 1, burstEstimate: 8,  label: 'CRITICAL' },
  medical:        { priority: 1, burstEstimate: 6,  label: 'CRITICAL' },
  police:         { priority: 2, burstEstimate: 5,  label: 'HIGH' },
  infrastructure: { priority: 3, burstEstimate: 7,  label: 'MEDIUM' },
  traffic:        { priority: 3, burstEstimate: 4,  label: 'MEDIUM' },
  utility:        { priority: 4, burstEstimate: 3,  label: 'LOW' },
  report:         { priority: 5, burstEstimate: 2,  label: 'MINIMAL' },
  default:        { priority: 3, burstEstimate: 5,  label: 'MEDIUM' },
};

// ── Role → Department Thread Mapping ────────────────────────────────────────
// OS Concept: I/O Device Routing — which hardware device handles which interrupt
const ROLE_ROUTING = {
  fire:           ['fire'],
  fire_alarm:     ['fire', 'police'],
  medical:        ['medical'],
  accident:       ['medical', 'police'],
  police:         ['police'],
  crime:          ['police'],
  theft:          ['police'],
  infrastructure: ['admin'],
  utility:        ['admin'],
  traffic:        ['police'],
  default:        ['admin'],
};

// ── Escalation Rules ─────────────────────────────────────────────────────────
// OS Concept: Aging — process waiting > threshold gets escalated to higher priority
const ESCALATION_RULES = {
  waitThresholdSeconds: 120, // 2 minutes
  escalatePriorityBy: 1,     // reduce priority number by 1 (i.e., upgrade)
};

/**
 * assignRolesForIncident
 * ----------------------
 * Determines which role "threads" should receive and execute this incident.
 * Returns the list of roles assigned, plus scheduling metadata.
 */
function assignRolesForIncident(incidentType) {
  const type = (incidentType || 'default').toLowerCase();
  const roles = ROLE_ROUTING[type] || ROLE_ROUTING.default;
  const meta  = PRIORITY_LEVELS[type] || PRIORITY_LEVELS.default;

  return {
    roles,
    schedulingMeta: {
      priority:      meta.priority,
      burstEstimate: meta.burstEstimate,
      priorityLabel: meta.label,
      assignedAt:    new Date().toISOString(),
    },
  };
}

/**
 * calculateBurstTime
 * ------------------
 * OS Concept: CPU Burst Time Estimator
 * Dynamically estimates burst time based on incident type and description length.
 */
function calculateBurstTime(incidentType, description = '') {
  const base = PRIORITY_LEVELS[incidentType]?.burstEstimate || 5;
  // Longer description = more complex task = more burst time
  const complexityBonus = Math.min(3, Math.floor(description.length / 60));
  return base + complexityBonus;
}

/**
 * applyAging
 * ----------
 * OS Concept: Process Aging to prevent starvation.
 * Checks if an incident has waited too long and upgrades its priority.
 */
function applyAging(incident) {
  const now = Date.now();
  const created = new Date(incident.createdAt).getTime();
  const waitSeconds = (now - created) / 1000;

  if (waitSeconds >= ESCALATION_RULES.waitThresholdSeconds && incident.priority > 1) {
    const newPriority = Math.max(1, incident.priority - ESCALATION_RULES.escalatePriorityBy);
    return {
      ...incident,
      priority: newPriority,
      aged: true,
      ageNote: `Priority escalated from ${incident.priority} → ${newPriority} (waited ${Math.floor(waitSeconds)}s)`,
    };
  }
  return { ...incident, aged: false };
}

/**
 * notifyAssigned
 * --------------
 * OS Concept: Interrupt Acknowledgement & Signal Dispatch.
 * Logs structured dispatch notifications (replace with real push/SMS in prod).
 */
function notifyAssigned(incident, assignmentResult) {
  const { roles, schedulingMeta } = assignmentResult;

  roles.forEach(role => {
    const msg = {
      timestamp:     new Date().toISOString(),
      incidentId:    incident.id,
      incidentType:  incident.type,
      location:      incident.location,
      assignedRole:  role,
      priority:      schedulingMeta.priorityLabel,
      burstEstimate: schedulingMeta.burstEstimate,
      channel:       `[DISPATCH:${role.toUpperCase()}]`,
    };
    console.log(JSON.stringify(msg));
  });
}

/**
 * buildProcessBlock
 * -----------------
 * OS Concept: Process Control Block (PCB) Creation.
 * Converts a raw incident report into a structured PCB for the scheduler.
 */
function buildProcessBlock(incident) {
  const type = (incident.type || 'default').toLowerCase();
  const meta = PRIORITY_LEVELS[type] || PRIORITY_LEVELS.default;

  return {
    _id:         incident.id?.toString() || Date.now().toString(),
    title:       incident.title || `${incident.type} @ ${incident.location}`,
    type:        type,
    location:    incident.location,
    arrivalTime: incident.arrivalTime ?? 0,
    burstTime:   incident.burstTime   ?? calculateBurstTime(type, incident.description),
    priority:    incident.priority    ?? meta.priority,
    status:      incident.status      || 'reported',
    createdAt:   incident.createdAt   || new Date().toISOString(),
  };
}

module.exports = {
  assignRolesForIncident,
  calculateBurstTime,
  applyAging,
  notifyAssigned,
  buildProcessBlock,
  PRIORITY_LEVELS,
  ROLE_ROUTING,
};
