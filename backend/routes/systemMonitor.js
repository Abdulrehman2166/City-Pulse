
const express = require('express');
const router = express.Router();
const { AutoOptimizingScheduler } = require('../utils/ProcessManager');

// Global scheduler instance
const scheduler = new AutoOptimizingScheduler();

// --- ENDPOINTS ---

// 1. Add a process
router.post('/process', (req, res) => {
  try {
    const process = req.body;
    const pcb = scheduler.addProcess(process);
    res.status(201).json({ success: true, pcb });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 2. Get all processes
router.get('/processes', (req, res) => {
  res.json({ processes: scheduler.pcbs });
});

// 3. Start simulation
router.post('/simulation/start', (req, res) => {
  try {
    scheduler.startSimulation();
    res.json({ success: true, message: 'Simulation started' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 4. Stop simulation
router.post('/simulation/stop', (req, res) => {
  try {
    scheduler.stopSimulation();
    res.json({ success: true, message: 'Simulation stopped' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 5. Get system metrics
router.get('/metrics', (req, res) => {
  try {
    const metrics = scheduler.getSystemMetrics();
    res.json({ success: true, metrics });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 6. Request resource
router.post('/resource/request', async (req, res) => {
  try {
    const { pid, resource, count } = req.body;
    const result = await scheduler.resourceManager.requestResource(pid, resource, count);
    res.json({ success: result.success, message: result.message });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 7. Release resource
router.post('/resource/release', async (req, res) => {
  try {
    const { pid, resource, count } = req.body;
    const result = await scheduler.resourceManager.releaseResource(pid, resource, count);
    res.json({ success: result.success, message: result.message });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 8. Detect deadlock manually
router.get('/deadlock/check', (req, res) => {
  try {
    const deadlockCheck = scheduler.resourceManager.detectDeadlock();
    res.json({ success: true, deadlockCheck });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// --- EVENTS STREAM FOR REAL-TIME UPDATES (SSE) ---
router.get('/events', (req, res) => {
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Send initial message
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'SSE connected' })}\n\n`);

  // Event listeners
  const listeners = [
    ['tick', (time) => sendEvent('tick', { time })],
    ['processAdded', (pcb) => sendEvent('processAdded', pcb)],
    ['processStarted', (pcb) => sendEvent('processStarted', pcb)],
    ['processCompleted', (pcb) => sendEvent('processCompleted', pcb)],
    ['deadlockDetected', (pids) => sendEvent('deadlockDetected', { pids })],
    ['deadlockRecovered', () => sendEvent('deadlockRecovered', { message: 'Deadlock recovered' })],
    ['priorityIncreased', (pcb) => sendEvent('priorityIncreased', pcb)]
  ];

  listeners.forEach(([event, handler]) => scheduler.on(event, handler));

  // Clean up on client disconnect
  req.on('close', () => {
    listeners.forEach(([event, handler]) => scheduler.off(event, handler));
  });

  function sendEvent(type, data) {
    res.write(`data: ${JSON.stringify({ type, data })}\n\n`);
  }
});

module.exports = router;
