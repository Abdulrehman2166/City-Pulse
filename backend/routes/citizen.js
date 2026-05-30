const express = require('express');
const router = express.Router();

const { authenticate, authorize, requirePermissions } = require('../middleware/auth');
const { PERMISSIONS } = require('../rbac/permissions');
const store = require('../utils/incidentsStore');

router.use(authenticate, authorize('citizen'));

// POST /api/citizen/incidents - report emergency
router.post(
  '/incidents',
  requirePermissions(PERMISSIONS.CITIZEN_INCIDENT_CREATE),
  (req, res) => {
    const { type, location, description } = req.body || {};
    if (!type || !location) return res.status(400).json({ message: 'type and location required' });

    const incident = store.createIncident({
      type,
      location,
      description,
      reporterId: req.user.id,
    });

    res.status(201).json({ incident });
  }
);

// GET /api/citizen/incidents - list my reports
router.get(
  '/incidents',
  requirePermissions(PERMISSIONS.CITIZEN_INCIDENT_READ_OWN),
  (req, res) => {
    const incidents = store.listCitizenIncidents(req.user.id);
    res.json({ incidents });
  }
);

// GET /api/citizen/analytics - personal stats
router.get(
  '/analytics',
  requirePermissions(PERMISSIONS.CITIZEN_ANALYTICS_READ_OWN),
  (req, res) => {
    res.json({ stats: store.statsForCitizen(req.user.id) });
  }
);

module.exports = router;

