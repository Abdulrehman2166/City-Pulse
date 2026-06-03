
const express = require('express');
const router = express.Router();
const { RealTimeScheduler } = require('../utils/RealTimeScheduler');

let activeScheduler = null;

// POST /api/realtime/start
router.post('/start', (req, res) => {
  try {
    const { algorithm, timeQuantum, numCores, incidents } = req.body;

    if (activeScheduler) {
      activeScheduler.stop();
    }

    activeScheduler = new RealTimeScheduler({ algorithm, timeQuantum, numCores });

    // Add incidents if provided
    if (incidents && Array.isArray(incidents)) {
      incidents.forEach(i => activeScheduler.addIncident(i));
    }

    // Attach listeners for real-time events
    activeScheduler.on('tick', (time) => console.log('Tick:', time));
    activeScheduler.on('incidentStarted', (data) => console.log('Incident Started:', data));
    activeScheduler.on('incidentCompleted', (data) => console.log('Incident Completed:', data));
    activeScheduler.on('stopped', (metrics) => console.log('Scheduler Stopped:', metrics));

    activeScheduler.start();

    res.json({ message: 'Real-time scheduler started' });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to start real-time scheduler' });
  }
});

// POST /api/realtime/add
router.post('/add', (req, res) => {
  try {
    if (!activeScheduler) {
      return res.status(400).json({ message: 'Scheduler not running' });
    }
    const incident = req.body;
    const added = activeScheduler.addIncident(incident);
    res.json({ incident: added });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to add incident' });
  }
});

// GET /api/realtime/metrics
router.get('/metrics', (req, res) => {
  try {
    if (!activeScheduler) {
      return res.status(400).json({ message: 'Scheduler not running' });
    }
    const metrics = activeScheduler.getMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to get metrics' });
  }
});

// POST /api/realtime/stop
router.post('/stop', (req, res) => {
  try {
    if (activeScheduler) {
      activeScheduler.stop();
      res.json({ message: 'Scheduler stopped', metrics: activeScheduler.getMetrics() });
    } else {
      res.status(400).json({ message: 'Scheduler not running' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to stop scheduler' });
  }
});

module.exports = router;
