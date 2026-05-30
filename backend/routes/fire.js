const express = require('express');
const router = express.Router();

const { authenticate, authorize, requirePermissions } = require('../middleware/auth');
const { PERMISSIONS } = require('../rbac/permissions');
const store = require('../utils/incidentsStore');

router.use(authenticate, authorize('fire'));

router.get(
  '/incidents',
  requirePermissions(PERMISSIONS.FIRE_INCIDENT_READ_ASSIGNED),
  (req, res) => {
    const incidents = store.listAssignedIncidents('fire', req.user.id);
    res.json({ incidents });
  }
);

router.put(
  '/incidents/:id/status',
  requirePermissions(PERMISSIONS.FIRE_INCIDENT_UPDATE_ASSIGNED),
  (req, res) => {
    const incident = store.getIncidentById(req.params.id);
    if (!incident) return res.status(404).json({ message: 'Incident not found' });

    if (incident.type !== 'fire' || incident.assignedUserIds?.fire !== req.user.id) {
      return res.status(403).json({ message: 'Access denied: Not assigned to this incident' });
    }

    const { status } = req.body || {};
    if (!status) return res.status(400).json({ message: 'status required' });

    store.updateIncidentStatus(incident, status, { role: req.user.role, id: req.user.id, username: req.user.username });
    res.json({ incident });
  }
);

router.get(
  '/analytics',
  requirePermissions(PERMISSIONS.FIRE_ANALYTICS_READ),
  (req, res) => {
    res.json({ stats: store.statsForRole('fire', req.user.id) });
  }
);

module.exports = router;

