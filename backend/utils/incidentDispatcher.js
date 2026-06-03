
const Incident = require('../models/Incident');
const scheduler = require('./scheduler');

// Sample responders (we can expand this to a model later)
const responders = [
  { id: 'r1', name: 'Engine 1', type: 'fire', status: 'available' },
  { id: 'r2', name: 'Medic 1', type: 'medical', status: 'available' },
  { id: 'r3', name: 'Patrol 1', type: 'police', status: 'available' },
  { id: 'r4', name: 'Crew 1', type: 'infrastructure', status: 'available' },
];

const dispatchHistory = [];

// 1. Priority Aging: Increase priority of waiting incidents over time
function applyAging(incidents, agingThreshold = 5) {
  return incidents.map(incident => {
    if (incident.status === 'waiting' && incident.waitDuration > agingThreshold) {
      return {
        ...incident,
        priority: Math.max(1, incident.priority - 1), // Increase priority (lower number = higher priority)
        waitDuration: 0,
      };
    }
    return { ...incident, waitDuration: (incident.waitDuration || 0) + 1 };
  });
}

// 2. Assign Incidents to Responders based on Scheduled Order
async function assignIncidents(incidents, algorithm, timeQuantum, options) {
  // First run scheduling algorithm
  const scheduleResult = scheduler.dispatch({
    incidents,
    algorithm,
    timeQuantum,
    options,
  });

  // Then assign available responders
  const assignments = [];
  let availableResponders = [...responders.filter(r => r.status === 'available')];

  for (const timelineItem of scheduleResult.timeline) {
    const incident = incidents.find(i => i._id === timelineItem.id);
    if (!incident) continue;

    // Find matching responder type
    const responderIndex = availableResponders.findIndex(r => r.type === incident.type);
    if (responderIndex !== -1) {
      const responder = availableResponders[responderIndex];
      assignments.push({
        incidentId: incident._id,
        incidentTitle: incident.title,
        responderId: responder.id,
        responderName: responder.name,
        startTime: timelineItem.start,
        endTime: timelineItem.end,
        algorithm: algorithm.toUpperCase(),
      });

      // Mark responder as busy during this time
      availableResponders.splice(responderIndex, 1);
    }
  }

  // Save to history
  dispatchHistory.push({
    timestamp: new Date(),
    algorithm,
    assignments,
    metrics: scheduleResult.metrics,
  });

  return {
    schedule: scheduleResult,
    assignments,
    history: dispatchHistory,
  };
}

// 3. Get Performance History of All Algorithms
function getPerformanceHistory() {
  return dispatchHistory;
}

// 4. Compare All Algorithms for Given Incidents
function compareAllAlgorithms(incidents, timeQuantum = 2) {
  const algorithms = ['fcfs', 'sjf', 'priority', 'rr', 'mlfq', 'srtf'];
  const comparison = {};

  algorithms.forEach(alg => {
    const result = scheduler.dispatch({
      incidents,
      algorithm: alg,
      timeQuantum,
    });
    comparison[alg] = {
      metrics: result.metrics,
      timeline: result.timeline,
    };
  });

  // Find best algorithm by avg waiting time
  let bestAlgorithm = 'fcfs';
  let bestWaitingTime = Infinity;
  
  for (const [alg, data] of Object.entries(comparison)) {
    if (data.metrics.averageWaitingTime < bestWaitingTime) {
      bestWaitingTime = data.metrics.averageWaitingTime;
      bestAlgorithm = alg;
    }
  }

  return {
    comparison,
    bestAlgorithm,
    bestWaitingTime,
  };
}

module.exports = {
  applyAging,
  assignIncidents,
  getPerformanceHistory,
  compareAllAlgorithms,
};
