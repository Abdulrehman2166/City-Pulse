const express = require('express');
const router = express.Router();
const kernel = require('../utils/kernel');
const dispatcher = require('../utils/incidentDispatcher');

// POST /api/simulate
// Receives an array of incidents and the algorithm choice
router.post('/', async (req, res) => {
  const { incidents, algorithm, timeQuantum, options } = req.body;

  if (!incidents || !Array.isArray(incidents)) {
    return res.status(400).json({ message: 'Incidents array is required' });
  }

  try {
    const result = await kernel.syscall('SCHED_DISPATCH', {
      incidents,
      algorithm,
      timeQuantum,
      options,
    });

    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to dispatch scheduling syscall' });
  }
});

// POST /api/simulate/assign
// Simulate and assign responders to incidents
router.post('/assign', async (req, res) => {
  const { incidents, algorithm, timeQuantum, options } = req.body;

  if (!incidents || !Array.isArray(incidents)) {
    return res.status(400).json({ message: 'Incidents array is required' });
  }

  try {
    const result = await dispatcher.assignIncidents(incidents, algorithm, timeQuantum, options);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to assign incidents' });
  }
});

// POST /api/simulate/compare
// Compare all algorithms at once
router.post('/compare', async (req, res) => {
  const { incidents, timeQuantum } = req.body;

  if (!incidents || !Array.isArray(incidents)) {
    return res.status(400).json({ message: 'Incidents array is required' });
  }

  try {
    const result = dispatcher.compareAllAlgorithms(incidents, timeQuantum);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to compare algorithms' });
  }
});

// GET /api/simulate/history
// Get performance history
router.get('/history', (req, res) => {
  try {
    const history = dispatcher.getPerformanceHistory();
    res.json(history);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to get history' });
  }
});

module.exports = router;
