const express = require('express');
const router = express.Router();

const { authenticate, authorize, requirePermissions } = require('../middleware/auth');
const { PERMISSIONS } = require('../rbac/permissions');
const store = require('../utils/incidentsStore');

router.use(authenticate, authorize('police'));

// GET /api/police/incidents - assigned crime/case reports only
router.get(
  '/incidents',
  requirePermissions(PERMISSIONS.POLICE_INCIDENT_READ_ASSIGNED),
  async (req, res) => {
    const incidents = await store.listAssignedIncidents('police', req.user.id);
    res.json({ incidents });
  }
);

// PUT /api/police/incidents/:id/status - update status on assigned only
router.put(
  '/incidents/:id/status',
  requirePermissions(PERMISSIONS.POLICE_INCIDENT_UPDATE_ASSIGNED),
  async (req, res) => {
    const incident = await store.getIncidentById(req.params.id);
    if (!incident) return res.status(404).json({ message: 'Incident not found' });

    if (incident.type !== 'police' || incident.assignedUserIds?.police !== req.user.id) {
      return res.status(403).json({ message: 'Access denied: Not assigned to this incident' });
    }

    const { status } = req.body || {};
    if (!status) return res.status(400).json({ message: 'status required' });

    const updatedIncident = await store.updateIncidentStatus(incident, status, { role: req.user.role, id: req.user.id, username: req.user.username });
    res.json({ incident: updatedIncident });
  }
);

// GET /api/police/analytics - role stats for assigned workload
router.get(
  '/analytics',
  requirePermissions(PERMISSIONS.POLICE_ANALYTICS_READ),
  async (req, res) => {
    const stats = await store.statsForRole('police', req.user.id);
    res.json({ stats });
  }
);

module.exports = router;

