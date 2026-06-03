
const express = require('express');
const router = express.Router();
const { AutoOptimizingScheduler } = require('../utils/ProcessManager');

let globalScheduler = new AutoOptimizingScheduler();

// POST /api/auto-optimize/reset
router.post('/reset', (req, res) => {
  globalScheduler = new AutoOptimizingScheduler();
  res.json({ message: 'Scheduler reset successfully' });
});

// POST /api/auto-optimize/add-incident
router.post('/add-incident', (req, res) => {
  try {
    const incident = req.body;
    const pcb = globalScheduler.addProcess(incident);
    res.json({ pcb, message: 'Incident added to process queue' });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to add incident' });
  }
});

// POST /api/auto-optimize/run
router.post('/run', async (req, res) => {
  try {
    const { timeQuantum } = req.body;
    const result = await globalScheduler.autoOptimize(timeQuantum);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to auto-optimize' });
  }
});

// GET /api/auto-optimize/check-deadlock
router.get('/check-deadlock', (req, res) => {
  try {
    const status = globalScheduler.checkDeadlock();
    res.json(status);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to check deadlock' });
  }
});

module.exports = router;
