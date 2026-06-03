const express = require('express');
const router = express.Router();
const store = require('../utils/incidentsStore');

// POST /api/incidents/report
router.post('/report', async (req, res) => {
  const { type, location, description, reporter } = req.body;
  if (!type || !location) return res.status(400).json({ message: 'type and location required' });

  // Legacy endpoint (unprotected): keep for backward compatibility with older UI
  const incident = await store.createIncident({
    type,
    location,
    description,
    reporterId: reporter || null,
  });

  res.status(201).json({ incident });
});

// GET /api/incidents
router.get('/', async (req, res) => {
  // Legacy endpoint (unprotected): returns all incidents (dev/demo only)
  const incidents = await store.getAllIncidents();
  res.json({ incidents });
});

// PUT /api/incidents/:id/status
router.put('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const incident = await store.getIncidentById(id);
  if (!incident) {
    return res.status(404).json({ message: 'Incident not found' });
  }

  const updatedIncident = await store.updateIncidentStatus(incident, status || incident.status, { role: 'legacy', id: null, username: 'legacy' });
  res.json({ message: 'Incident status updated successfully', incident: updatedIncident });
});

module.exports = router;
