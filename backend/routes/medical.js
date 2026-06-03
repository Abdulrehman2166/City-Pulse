const express = require('express');
const router = express.Router();

const { authenticate, authorize, requirePermissions } = require('../middleware/auth');
const { PERMISSIONS } = require('../rbac/permissions');
const store = require('../utils/incidentsStore');

router.use(authenticate, authorize('medical'));

router.get(
  '/incidents',
  requirePermissions(PERMISSIONS.MEDICAL_INCIDENT_READ_ASSIGNED),
  async (req, res) => {
    const incidents = await store.listAssignedIncidents('medical', req.user.id);
    res.json({ incidents });
  }
);

router.put(
  '/incidents/:id/status',
  requirePermissions(PERMISSIONS.MEDICAL_INCIDENT_UPDATE_ASSIGNED),
  async (req, res) => {
    const incident = await store.getIncidentById(req.params.id);
    if (!incident) return res.status(404).json({ message: 'Incident not found' });

    if (incident.type !== 'medical' || incident.assignedUserIds?.medical !== req.user.id) {
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
  requirePermissions(PERMISSIONS.MEDICAL_ANALYTICS_READ),
  async (req, res) => {
    const stats = await store.statsForRole('medical', req.user.id);
    res.json({ stats });
  }
);

module.exports = router;

