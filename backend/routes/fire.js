const express = require('express');
const router = express.Router();

const { authenticate, authorize, requirePermissions } = require('../middleware/auth');
const { PERMISSIONS } = require('../rbac/permissions');
const store = require('../utils/incidentsStore');

router.use(authenticate, authorize('fire'));

router.get(
  '/incidents',
  requirePermissions(PERMISSIONS.FIRE_INCIDENT_READ_ASSIGNED),
  async (req, res) => {
    const incidents = await store.listAssignedIncidents('fire', req.user.id);
    res.json({ incidents });
  }
);

router.put(
  '/incidents/:id/status',
  requirePermissions(PERMISSIONS.FIRE_INCIDENT_UPDATE_ASSIGNED),
  async (req, res) => {
    console.log('=== PUT /api/fire/incidents/:id/status ===');
    console.log('req.user:', req.user);
    console.log('req.params.id:', req.params.id);
    
    const incident = await store.getIncidentById(req.params.id);
    console.log('Incident found:', incident);
    if (!incident) return res.status(404).json({ message: 'Incident not found' });

    console.log('incident.type:', incident.type);
    console.log('incident.assignedUserIds.fire:', incident.assignedUserIds?.fire);
    console.log('req.user.id:', req.user.id);
    console.log('incident.type !== fire:', incident.type !== 'fire');
    console.log('assignedUserIds.fire !== req.user.id:', incident.assignedUserIds?.fire !== req.user.id);
    
    if (incident.type !== 'fire' || incident.assignedUserIds?.fire !== req.user.id) {
      return res.status(403).json({ message: 'Access denied: Not assigned to this incident' });
    }

    const { status } = req.body || {};
    if (!status) return res.status(400).json({ message: 'status required' });

    const updatedIncident = await store.updateIncidentStatus(incident, status, { role: req.user.role, id: req.user.id, username: req.user.username });
    res.json({ incident: updatedIncident });
  }
);

router.get(
  '/analytics',
  requirePermissions(PERMISSIONS.FIRE_ANALYTICS_READ),
  async (req, res) => {
    const stats = await store.statsForRole('fire', req.user.id);
    res.json({ stats });
  }
);

module.exports = router;

