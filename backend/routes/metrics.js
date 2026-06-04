const express = require('express');
const router = express.Router();
const scheduler = require('../utils/scheduler');
const dispatcher = require('../utils/incidentDispatcher');

// Performance metrics storage
let performanceData = [];

// Helper to save performance data
function savePerformance(data) {
  performanceData.push({
    timestamp: new Date(),
    ...data,
  });
}

// POST /api/metrics/calculate
// Calculate detailed metrics for given incidents
router.post('/calculate', (req, res) => {
  const { incidents, algorithm, timeQuantum, options } = req.body;

  if (!incidents || !Array.isArray(incidents)) {
    return res.status(400).json({ message: 'Incidents array is required' });
  }

  try {
    const result = scheduler.dispatch({
      incidents,
      algorithm: algorithm || 'fcfs',
      timeQuantum,
      options,
    });

    // Calculate additional metrics
    const results = result.results || [];
    const totalBurstTimes = results.map(r => r.burstTime);
    const waitingTimes = results.map(r => r.waitingTime);
    const turnaroundTimes = results.map(r => r.turnaroundTime);

    const additionalMetrics = {
      maxWaitingTime: Math.max(...waitingTimes),
      minWaitingTime: Math.min(...waitingTimes),
      stdDevWaitingTime: calculateStdDev(waitingTimes),
      maxTurnaroundTime: Math.max(...turnaroundTimes),
      minTurnaroundTime: Math.min(...turnaroundTimes),
      stdDevTurnaroundTime: calculateStdDev(turnaroundTimes),
      throughput: incidents.length / (Math.max(...turnaroundTimes),
      cpuUtilization: totalBurstTimes.reduce((a, b) => a + b, 0) / Math.max(...turnaroundTimes),
      avgResponseTime: waitingTimes.reduce((a, b) => a + b, 0) / waitingTimes.length,
    };

    const fullMetrics = {
      ...result.metrics,
      ...additionalMetrics,
    };

    savePerformance({
      algorithm,
      metrics: fullMetrics,
      incidentCount: incidents.length,
    });

    res.json({
      algorithm,
      metrics: fullMetrics,
      details: results.map(r => ({
        id: r._id,
        arrivalTime: r.arrivalTime,
        burstTime: r.burstTime,
        priority: r.priority,
        waitingTime: r.waitingTime,
        turnaroundTime: r.turnaroundTime,
        completionTime: r.completionTime,
        responseTime: r.waitingTime, // For non-preemptive algorithms
      })),
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Helper: Calculate standard deviation
function calculateStdDev(arr) {
  if (arr.length === 0) return 0;
  const n = arr.length;
  const mean = arr.reduce((a, b) => a + b, 0) / n;
  const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
  return Math.sqrt(variance);
}

// POST /api/metrics/compare
// Compare metrics across all algorithms
router.post('/compare', (req, res) => {
  const { incidents, timeQuantum } = req.body;

  if (!incidents || !Array.isArray(incidents)) {
    return res.status(400).json({ message: 'Incidents array is required' });
  }

  const algorithms = ['fcfs', 'sjf', 'priority', 'rr', 'mlfq', 'srtf'];
  const comparison = {};

  algorithms.forEach(alg => {
    try {
      const result = scheduler.dispatch({
        incidents,
        algorithm: alg,
        timeQuantum,
      });
      const results = result.results || [];
      const waitingTimes = results.map(r => r.waitingTime);
      const turnaroundTimes = results.map(r => r.turnaroundTime);
      const burstTimes = results.map(r => r.burstTime);

      comparison[alg] = {
        ...result.metrics,
        maxWaitingTime: Math.max(...waitingTimes),
        minWaitingTime: Math.min(...waitingTimes),
        stdDevWaitingTime: calculateStdDev(waitingTimes),
        maxTurnaroundTime: Math.max(...turnaroundTimes),
        cpuUtilization: burstTimes.reduce((a, b) => a + b, 0) / Math.max(...turnaroundTimes),
      };
    } catch (error) {
      comparison[alg] = { error: error.message };
    }
  });

  // Determine best algorithm for each metric
  const rankings = {
    bestByAvgWait: Object.entries(comparison)
      .filter(([_, data]) => !data.error)
      .sort(([, a], [, b]) => a.averageWaitingTime - b.averageWaitingTime)[0],
    bestByAvgTurnaround: Object.entries(comparison)
      .filter(([_, data]) => !data.error)
      .sort(([, a], [, b]) => a.averageTurnaroundTime - b.averageTurnaroundTime)[0],
  };

  res.json({
    comparison,
    rankings: {
      avgWaitingTime: rankings.bestByAvgWait ? rankings.bestByAvgWait[0],
      avgTurnaroundTime: rankings.bestByAvgTurnaround ? rankings.bestByAvgTurnaround[0],
    },
  });
});

// GET /api/metrics/history
// Get performance history
router.get('/history', (req, res) => {
  res.json({
    totalRuns: performanceData.length,
    history: performanceData.slice(-50), // Last 50 runs
  });
});

// GET /api/metrics/reset
// Reset performance history
router.post('/reset', (req, res) => {
  performanceData = [];
  res.json({
    message: 'Performance history reset' });
});

module.exports = router;
