const { assignRolesForIncident } = require('./assign');
const users = require('./users');

// In-memory store (replace with DB repositories in production)
const incidents = [];

function normalizeIncidentType(type) {
  const t = (type || '').toLowerCase().trim();
  if (['fire', 'medical', 'police'].includes(t)) return t;
  if (['crime', 'theft', 'traffic'].includes(t)) return 'police';
  if (['accident'].includes(t)) return 'medical';
  if (['fire_alarm'].includes(t)) return 'fire';
  return 'police';
}

function pickAssigneeIdForRole(role) {
  const u = users.find(x => x.role === role && x.status === 'active');
  return u ? u.id : null;
}

function createIncident({ type, location, description, reporterId }) {
  const id = incidents.length + 1;
  const normalizedType = normalizeIncidentType(type);

  const assignmentResult = assignRolesForIncident(normalizedType);
  const assignedRoles = assignmentResult.roles;

  // Map assignedRoles -> specific user IDs (first active user in that role)
  const assignedUserIds = {};
  assignedRoles.forEach(role => {
    assignedUserIds[role] = pickAssigneeIdForRole(role);
  });

  const incident = {
    id,
    type: normalizedType,
    location,
    description: description || '',
    reporterId,
    status: 'reported',
    createdAt: new Date(),
    assignedRoles,
    assignedUserIds,
    logs: [],
  };

  incidents.push(incident);
  return incident;
}

function getIncidentById(id) {
  return incidents.find(i => i.id === Number(id));
}

function listCitizenIncidents(reporterId) {
  return incidents.filter(i => i.reporterId === reporterId);
}

function listAssignedIncidents(role, userId) {
  return incidents.filter(i => i.type === role && i.assignedUserIds?.[role] === userId);
}

function addLog(incident, entry) {
  incident.logs.push({
    at: new Date().toISOString(),
    ...entry,
  });
}

function updateIncidentStatus(incident, status, actor) {
  incident.status = status;
  addLog(incident, { kind: 'status', status, actor });
  return incident;
}

function statsForCitizen(reporterId) {
  const mine = listCitizenIncidents(reporterId);
  const total = mine.length;
  const active = mine.filter(i => i.status !== 'resolved').length;
  const resolved = mine.filter(i => i.status === 'resolved').length;
  return { total, active, resolved };
}

function statsForRole(role, userId) {
  const mine = listAssignedIncidents(role, userId);
  const total = mine.length;
  const active = mine.filter(i => i.status !== 'resolved').length;
  const resolved = mine.filter(i => i.status === 'resolved').length;
  const byStatus = mine.reduce((acc, i) => {
    acc[i.status] = (acc[i.status] || 0) + 1;
    return acc;
  }, {});
  return { total, active, resolved, byStatus };
}

module.exports = {
  normalizeIncidentType,
  createIncident,
  getIncidentById,
  listCitizenIncidents,
  listAssignedIncidents,
  updateIncidentStatus,
  statsForCitizen,
  statsForRole,
  _incidents: incidents,
};

