const express = require('express');
const router = express.Router();
const scheduler = require('../utils/scheduler');

// Helper function to generate color based on incident type
function getIncidentColor(type) {
  const colors = {
    fire: '#ff4444',
    police: '#ff8800',
    medical: '#44ff44',
    infrastructure: '#4488ff',
  };
  return colors[type] || '#888888';
}

// POST /api/gantt
// Generate Gantt chart data for visualization
router.post('/', (req, res) => {
  const { incidents, algorithm, timeQuantum, options } = req.body;

  if (!incidents || !Array.isArray(incidents)) {
    return res.status(400).json({ message: 'Incidents array is required' });
  }

  try {
    const scheduleResult = scheduler.dispatch({
      incidents,
      algorithm: algorithm || 'fcfs',
      timeQuantum: timeQuantum || 2,
      options,
    });

    // Transform timeline into Gantt chart format
    const ganttData = scheduleResult.timeline.map((item, index) => {
      const incident = incidents.find(i => i._id === item.id);
      return {
        id: index + 1,
        incidentId: item.id,
        incidentTitle: incident?.title || 'Unknown Incident',
        incidentType: incident?.type || 'unknown',
        start: item.start,
        end: item.end,
        duration: item.end - item.start,
        color: getIncidentColor(incident?.type),
        resource: incident?.type || 'unknown',
        description: incident?.description || '',
      };
    });

    // Generate resource usage data
    const resources = [...new Set(incidents.map(i => i.type || 'unknown'))];
    const resourceUsage = resources.map(resource => ({
      name: resource.toUpperCase(),
      color: getIncidentColor(resource),
      tasks: ganttData.filter(task => task.incidentType === resource),
    }));

    res.json({
      algorithm: algorithm || 'fcfs',
      metrics: scheduleResult.metrics,
      ganttData,
      resourceUsage,
      totalDuration: scheduleResult.timeline.length > 0
        ? Math.max(...scheduleResult.timeline.map(t => t.end))
        : 0,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST /api/gantt/compare
// Compare algorithms with side-by-side Gantt charts
router.post('/compare', (req, res) => {
  const { incidents, algorithms, timeQuantum } = req.body;

  if (!incidents || !Array.isArray(incidents)) {
    return res.status(400).json({ message: 'Incidents array is required' });
  }

  const algorithmsToCompare = algorithms || ['fcfs', 'sjf', 'priority', 'rr', 'mlfq', 'srtf'];

  try {
    const comparison = {};

    algorithmsToCompare.forEach(alg => {
      const scheduleResult = scheduler.dispatch({
        incidents,
        algorithm: alg,
        timeQuantum,
      });

      comparison[alg] = {
        metrics: scheduleResult.metrics,
        ganttData: scheduleResult.timeline.map((item, index) => {
          const incident = incidents.find(i => i._id === item.id);
          return {
            id: index + 1,
            incidentId: item.id,
            incidentTitle: incident?.title || 'Unknown',
            start: item.start,
            end: item.end,
            duration: item.end - item.start,
            color: getIncidentColor(incident?.type),
          };
        }),
      };
    });

    // Find algorithm with minimal average waiting time
    let bestAlg = 'fcfs';
    let minWait = Infinity;
    for (const [alg, data] of Object.entries(comparison)) {
      if (data.metrics.averageWaitingTime < minWait) {
        minWait = data.metrics.averageWaitingTime;
        bestAlg = alg;
      }
    }

    res.json({
      comparison,
      bestAlgorithm: bestAlg,
      bestAvgWaitingTime: minWait,
      algorithms: algorithmsToCompare,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
