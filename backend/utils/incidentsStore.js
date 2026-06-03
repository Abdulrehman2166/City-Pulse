const { assignRolesForIncident, calculateBurstTime, PRIORITY_LEVELS } = require('./assign');
const { processIncidentNotifications } = require('./notificationManager');
const { compareAllAlgorithms, assignIncidents } = require('./incidentDispatcher');
const users = require('./users');
const Incident = require('../models/Incident');

function normalizeIncidentType(type) {
  const t = (type || '').toLowerCase().trim();
  if (['fire', 'medical', 'police'].includes(t)) return t;
  if (['crime', 'theft', 'traffic'].includes(t)) return 'police';
  if (['accident'].includes(t)) return 'medical';
  if (['fire_alarm'].includes(t)) return 'fire';
  return 'police';
}

function calculateETA(type) {
  // Simple ETA calculation based on incident type (minutes)
  const etaMap = {
    fire: 5,
    medical: 3,
    police: 4,
    infrastructure: 10
  };
  return etaMap[type] || 5;
}

function pickAssigneeIdForRole(role) {
  const u = users.find(x => x.role === role && x.status === 'active');
  return u ? u.id : null;
}

async function createIncident({ type, location, description, reporterId }) {
  const normalizedType = normalizeIncidentType(type);

  const assignmentResult = assignRolesForIncident(normalizedType);
  const assignedRoles = assignmentResult.roles;

  const assignedUserIds = {};
  assignedRoles.forEach(role => {
    assignedUserIds[role] = pickAssigneeIdForRole(role);
  });

  const burstEstimate = calculateBurstTime(normalizedType, description || '');
  const meta = PRIORITY_LEVELS[normalizedType] || PRIORITY_LEVELS.default;
  const etaMinutes = calculateETA(normalizedType);

  const incidentDoc = new Incident({
    type: normalizedType,
    location,
    description: description || '',
    reporterId,
    status: 'received',
    assignedRoles,
    assignedUserIds,
    etaMinutes,
    schedulingMeta: {
      priority: meta.priority,
      burstEstimate,
      priorityLabel: meta.label,
      assignedAt: new Date(),
    },
    logs: [{
      at: new Date(),
      kind: 'status',
      status: 'received'
    }],
  });

  const savedIncident = await incidentDoc.save();
  
  // Convert to plain object for backward compatibility
  const incident = {
    id: savedIncident._id.toString(),
    _id: savedIncident._id,
    ...savedIncident.toObject(),
  };

  // Automatically mark as assigned since we've already assigned roles
  incidentDoc.status = 'assigned';
  incidentDoc.logs.push({
    at: new Date(),
    kind: 'status',
    status: 'assigned'
  });
  await incidentDoc.save();
  incident.status = 'assigned';

  // Load all incidents for notification processing and scheduling
  const allIncidents = await getAllIncidents();

  // ── HIDDEN OS SCHEDULING ENGINE (NO USER EXPOSURE) ──
  try {
    // Get active incidents to schedule
    const activeIncidents = allIncidents.filter(inc => 
      ['received', 'assigned', 'dispatched'].includes(inc.status)
    ).map(inc => ({
      _id: inc._id,
      type: inc.type,
      title: `${inc.type.toUpperCase()} at ${inc.location}`,
      arrivalTime: Math.floor((new Date(inc.createdAt) - new Date(allIncidents[allIncidents.length -1]?.createdAt || new Date())) / 1000) || 0,
      burstTime: inc.schedulingMeta?.burstEstimate || 5,
      priority: inc.schedulingMeta?.priority || 3,
    }));

    if (activeIncidents.length > 0) {
      // Compare all algorithms to find the best one
      const comparison = compareAllAlgorithms(activeIncidents);
      console.log(`🤖 [HIDDEN ENGINE] Auto-selected best algorithm: ${comparison.bestAlgorithm}`);
      console.log(`⏱️ [HIDDEN ENGINE] Average waiting time: ${comparison.bestWaitingTime}s`);

      // Run scheduling and log it internally only
      await assignIncidents(activeIncidents, comparison.bestAlgorithm, 2, {});

      // Log scheduling result internally (not visible to users)
      incidentDoc.logs.push({
        at: new Date(),
        kind: 'scheduling',
        algorithm: comparison.bestAlgorithm,
        metrics: comparison.comparison[comparison.bestAlgorithm].metrics,
      });
      await incidentDoc.save();
    }
  } catch (err) {
    console.error('⚠️ [HIDDEN ENGINE] Scheduling failed:', err);
  }
  // ── END HIDDEN ENGINE ──

  // ── Notification Engine ──
  processIncidentNotifications(incident, allIncidents);

  return incident;
}

async function getIncidentById(id) {
  try {
    const incidentDoc = await Incident.findById(id);
    if (!incidentDoc) return null;
    return {
      id: incidentDoc._id.toString(),
      _id: incidentDoc._id,
      ...incidentDoc.toObject(),
    };
  } catch (e) {
    return null;
  }
}

async function getAllIncidents() {
  const docs = await Incident.find().sort({ createdAt: -1 });
  return docs.map(doc => ({
    id: doc._id.toString(),
    _id: doc._id,
    ...doc.toObject(),
  }));
}

async function listCitizenIncidents(reporterId) {
  const docs = await Incident.find({ reporterId });
  return docs.map(doc => ({
    id: doc._id.toString(),
    _id: doc._id,
    ...doc.toObject(),
  }));
}

async function listAssignedIncidents(role, userId) {
  // For MongoDB query with Map field: assignedUserIds[role] == userId
  const docs = await Incident.find({ [`assignedUserIds.${role}`]: userId });
  return docs.map(doc => ({
    id: doc._id.toString(),
    _id: doc._id,
    ...doc.toObject(),
  }));
}

async function addLog(incident, entry) {
  const incidentDoc = await Incident.findById(incident._id || incident.id);
  if (!incidentDoc) return null;
  incidentDoc.logs.push({
    at: new Date(),
    ...entry,
  });
  await incidentDoc.save();
  return {
    id: incidentDoc._id.toString(),
    _id: incidentDoc._id,
    ...incidentDoc.toObject(),
  };
}

async function updateIncidentStatus(incident, status, actor) {
  const incidentDoc = await Incident.findById(incident._id || incident.id);
  if (!incidentDoc) return null;
  
  incidentDoc.status = status;
  incidentDoc.logs.push({
    at: new Date(),
    kind: 'status',
    status,
    actor,
  });
  await incidentDoc.save();
  return {
    id: incidentDoc._id.toString(),
    _id: incidentDoc._id,
    ...incidentDoc.toObject(),
  };
}

async function statsForCitizen(reporterId) {
  const mine = await listCitizenIncidents(reporterId);
  const total = mine.length;
  const active = mine.filter(i => i.status !== 'resolved').length;
  const resolved = mine.filter(i => i.status === 'resolved').length;
  return { total, active, resolved };
}

async function statsForRole(role, userId) {
  const mine = await listAssignedIncidents(role, userId);
  const total = mine.length;
  const active = mine.filter(i => i.status !== 'resolved').length;
  const resolved = mine.filter(i => i.status === 'resolved').length;
  const byStatus = mine.reduce((acc, i) => {
    acc[i.status] = (acc[i.status] || 0) + 1;
    return acc;
  }, {});
  return { total, active, resolved, byStatus };
}

async function deleteIncident(id) {
  try {
    await Incident.findByIdAndDelete(id);
    return true;
  } catch (error) {
    console.error('Error deleting incident:', error);
    return false;
  }
}

module.exports = {
  normalizeIncidentType,
  createIncident,
  getIncidentById,
  listCitizenIncidents,
  listAssignedIncidents,
  updateIncidentStatus,
  deleteIncident,
  statsForCitizen,
  statsForRole,
  getAllIncidents,
  // For backward compatibility - return a promise that resolves to all incidents
  get _incidents() {
    return (async () => await getAllIncidents())();
  },
};

