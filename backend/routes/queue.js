const express = require('express');
const router = express.Router();
const store = require('../utils/incidentsStore');

let processQueue = [];
let queueHistory = [];

// Helper to save queue history
function saveToHistory() {
  queueHistory.push({
    timestamp: new Date(),
    queue: [...processQueue],
  });
}

// GET /api/queue
// Get current process queue
router.get('/', async (req, res) => {
  const allIncidents = await store.getAllIncidents();
  const activeIncidents = allIncidents
    .filter(i => i.status !== 'resolved')
    .sort((a, b) => {
      const pa = a.schedulingMeta?.priority || 3;
      const pb = b.schedulingMeta?.priority || 3;
      if (pa !== pb) return pa - pb;
      return (a.schedulingMeta?.burstEstimate || 5) - (b.schedulingMeta?.burstEstimate || 5);
    });

  res.json({
    queueLength: activeIncidents.length,
    queue: activeIncidents.map((inc, idx) => ({
      position: idx + 1,
      id: inc.id || inc._id,
      type: inc.type,
      title: inc.title || inc.description?.substring(0, 50),
      location: inc.location,
      status: inc.status,
      priority: inc.schedulingMeta?.priority || 3,
      burstTime: inc.schedulingMeta?.burstEstimate || 5,
      waitTime: inc.schedulingMeta?.waitTime || 0,
    })),
  });
});

// POST /api/queue/push
// Add incident to queue
router.post('/push', async (req, res) => {
  const { incidentId } = req.body;

  if (!incidentId) {
    return res.status(400).json({ message: 'incidentId is required' });
  }

  const allIncidents = await store.getAllIncidents();
  const incident = allIncidents.find(i => i.id === incidentId || i._id === incidentId);

  if (!incident) {
    return res.status(404).json({ message: 'Incident not found' });
  }

  // If not already in queue, add it
  if (!processQueue.find(p => p.id === incidentId)) {
    processQueue.push({
      id: incident.id || incident._id,
      incident,
      addedAt: new Date(),
    });
    saveToHistory();
  }

  res.json({
    message: 'Incident added to queue',
    queueLength: processQueue.length,
  });
});

// POST /api/queue/pop
// Remove and return next incident from queue
router.post('/pop', async (req, res) => {
  if (processQueue.length === 0) {
    return res.status(400).json({ message: 'Queue is empty' });
  }

  const { algorithm = 'fcfs' } = req.body;

  let popped;
  if (algorithm === 'fcfs') {
    popped = processQueue.shift();
  } else if (algorithm === 'priority') {
    // Sort by priority then pop first
    processQueue.sort((a, b) => (a.incident.schedulingMeta?.priority || 3) - (b.incident.schedulingMeta?.priority || 3));
    popped = processQueue.shift();
  } else if (algorithm === 'sjf') {
    // Sort by burst time then pop first
    processQueue.sort((a, b) => (a.incident.schedulingMeta?.burstEstimate || 5) - (b.incident.schedulingMeta?.burstEstimate || 5));
    popped = processQueue.shift();
  } else {
    // Default to FCFS
    popped = processQueue.shift();
  }

  saveToHistory();
  res.json({
    message: 'Incident popped from queue',
    incident: popped?.incident,
    queueLength: processQueue.length,
  });
});

// POST /api/queue/clear
// Clear the entire queue
router.post('/clear', (req, res) => {
  const cleared = [...processQueue];
  processQueue = [];
  saveToHistory();
  res.json({
    message: 'Queue cleared',
    clearedCount: cleared.length,
    clearedIncidents: cleared,
  });
});

// GET /api/queue/history
// Get queue history
router.get('/history', (req, res) => {
  res.json({
    historyCount: queueHistory.length,
    history: queueHistory.slice(-20), // Last 20 entries
  });
});

module.exports = router;
