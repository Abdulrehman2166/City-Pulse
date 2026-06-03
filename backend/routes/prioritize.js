/**
 * prioritize.js — Admin Decision Request (ADR) Resolution API
 * ============================================================
 * Allows admin to resolve concurrent incident scheduling conflicts
 * via two strategies:
 *   POST /api/prioritize/admin  — Manual override: admin specifies PID execution order
 *   POST /api/prioritize/system — Automated: system resolves using CFS/SJF heuristic
 *   GET  /api/prioritize/status — View current process queue ordering
 */

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { markADRResolved, getADRsForAdmin } = require('../utils/notificationManager');
const store = require('../utils/incidentsStore');

// All routes require admin authentication
router.use(authenticate, authorize('admin'));

// ── POST /api/prioritize/admin ── Manual Priority Override
// Body: { adrId, orderedPids: [1, 3, 2] }
router.post('/admin', async (req, res) => {
  const { adrId, orderedPids } = req.body || {};

  if (!adrId || !Array.isArray(orderedPids) || orderedPids.length === 0) {
    return res.status(400).json({
      message: 'adrId and orderedPids[] are required.',
      example: { adrId: 5, orderedPids: [3, 1, 4] }
    });
  }

  // Validate that PIDs exist in the incident store
  const allIncidents = await store.getAllIncidents();
  const valid = orderedPids.every(pid => allIncidents.find(i => i.id === String(pid) || i.id === Number(pid)));
  if (!valid) {
    return res.status(422).json({ message: 'One or more PIDs do not exist in the incident store.' });
  }

  // Mark the ADR as admin-resolved with the given order
  const resolved = markADRResolved(adrId, orderedPids, 'admin');
  if (!resolved) {
    return res.status(404).json({ message: `ADR #${adrId} not found or already resolved.` });
  }

  // Build human-readable resolution summary
  const resolutionSummary = orderedPids.map((pid, idx) => {
    const inc = allIncidents.find(i => i.id === String(pid) || i.id === Number(pid));
    return {
      rank: idx + 1,
      pid: String(pid).padStart(4, '0'),
      type: inc?.type || 'unknown',
      location: inc?.location || 'unknown',
      priority: inc?.schedulingMeta?.priorityLabel || 'MEDIUM',
    };
  });

  res.json({
    message: 'ADR resolved via admin manual override. Dispatch order updated.',
    adrState: 'admin_resolved',
    resolutionStrategy: 'MANUAL_OVERRIDE',
    resolvedOrder: resolutionSummary,
    adr: resolved,
  });
});

// ── POST /api/prioritize/system ── Automated CFS/SJF Resolution
// Body: { adrId }
router.post('/system', (req, res) => {
  const { adrId } = req.body || {};

  if (!adrId) {
    return res.status(400).json({ message: 'adrId is required.' });
  }

  // Fetch the ADR to find which processes are in contention
  const adrs = getADRsForAdmin('pending');
  const adr = adrs.find(a => a.id === Number(adrId));
  if (!adr) {
    return res.status(404).json({ message: `ADR #${adrId} not found or not pending.` });
  }

  // Re-run the CFS/SJF optimizer on the ADR's process list
  const processes = adr.meta.processes || [];
  const sorted = [...processes].sort((a, b) => {
    // Primary: priority class (lower number = higher urgency)
    if (a.priority !== b.priority) return a.priority - b.priority;
    // Secondary: SJF — shorter burst time = runs first
    if (a.burstTime !== b.burstTime) return a.burstTime - b.burstTime;
    // Tertiary: FCFS — earlier arrival wins
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  const orderedPids = sorted.map(p => Number(p.pid));

  // Mark the ADR as system-resolved
  const resolved = markADRResolved(adrId, orderedPids, 'system');

  // Compute Jain's Fairness Index for the resolved schedule
  const burstTimes = sorted.map(p => p.burstTime);
  const n = burstTimes.length;
  const sumBurst = burstTimes.reduce((s, b) => s + b, 0);
  const sumBurstSq = burstTimes.reduce((s, b) => s + b * b, 0);
  const jainsFairnessIndex = (sumBurst * sumBurst) / (n * sumBurstSq);

  // Build resolution summary
  const resolutionSummary = sorted.map((p, idx) => ({
    rank: idx + 1,
    pid: p.pid,
    type: p.type,
    location: p.location,
    priority: p.priorityLabel,
    burstTime: p.burstTime,
    severity: p.severity,
    schedulingReason: idx === 0
      ? `Highest urgency (${p.severity}) — dispatched first`
      : `Queued at rank ${idx + 1} by CFS/SJF optimizer`,
  }));

  res.json({
    message: 'ADR resolved via automated CFS/SJF scheduler optimization.',
    adrState: 'system_resolved',
    resolutionStrategy: 'AUTO_CFS_SJF',
    jainsFairnessIndex: Math.round(jainsFairnessIndex * 1000) / 1000,
    fairnessComment: jainsFairnessIndex > 0.8 ? 'High — all processes treated fairly' : 'Moderate — some resource imbalance present',
    resolvedOrder: resolutionSummary,
    adr: resolved,
  });
});

// ── GET /api/prioritize/status ── View current queue order
router.get('/status', async (req, res) => {
  const allIncidents = await store.getAllIncidents();
  const activeIncidents = allIncidents
    .filter(i => i.status !== 'resolved')
    .sort((a, b) => {
      const pa = a.schedulingMeta?.priority || 3;
      const pb = b.schedulingMeta?.priority || 3;
      if (pa !== pb) return pa - pb;
      return (a.schedulingMeta?.burstEstimate || 5) - (b.schedulingMeta?.burstEstimate || 5);
    })
    .map((inc, idx) => ({
      rank: idx + 1,
      pid: String(inc.id).padStart(4, '0'),
      type: inc.type,
      location: inc.location,
      status: inc.status,
      severity: inc.schedulingMeta?.priorityLabel || 'MEDIUM',
      burstTime: inc.schedulingMeta?.burstEstimate || 5,
      assignedRoles: inc.assignedRoles,
      createdAt: inc.createdAt,
    }));

  const pendingAdrs = getADRsForAdmin('pending');

  res.json({
    activeProcessCount: activeIncidents.length,
    hasPendingADRs: pendingAdrs.length > 0,
    pendingADRCount: pendingAdrs.length,
    currentQueue: activeIncidents,
  });
});

module.exports = router;
