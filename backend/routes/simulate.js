const express = require('express');
const router = express.Router();
const kernel = require('../utils/kernel');

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

module.exports = router;
