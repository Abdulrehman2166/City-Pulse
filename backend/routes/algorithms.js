const express = require('express');
const router = express.Router();
const scheduler = require('../utils/scheduler');

// Algorithm metadata
const ALGORITHM_META = {
  fcfs: {
    name: 'First Come First Serve (FCFS)',
    description: 'Processes incidents in the order they arrive. Simple and fair, but can lead to convoy effect.',
    type: 'non-preemptive',
    complexity: 'O(n log n)',
    useCases: ['Batch systems, simple queues',
    parameters: [],
  },
  sjf: {
    name: 'Shortest Job First (SJF)',
    description: 'Processes shortest incidents first. Minimizes average waiting time, but requires burst time knowledge.',
    type: 'non-preemptive',
    complexity: 'O(n²)',
    useCases: ['Systems with known burst times', 'Short jobs priority', 'Throughput optimization'],
    parameters: [],
  },
  srtf: {
    name: 'Shortest Remaining Time First (SRTF)',
    description: 'Preemptive version of SJF. Always runs the process with the shortest remaining time.',
    type: 'preemptive',
    complexity: 'O(n²)',
    useCases: ['Time-sensitive systems', 'Interactive applications', 'Shortest jobs first with preemption'],
    parameters: [],
  },
  priority: {
    name: 'Priority Scheduling',
    description: 'Processes incidents by priority (1 = highest). Can have starvation issues.',
    type: 'non-preemptive',
    complexity: 'O(n log n)',
    useCases: ['Emergency response systems', 'Priority-based queues', 'Critical systems'],
    parameters: [],
  },
  rr: {
    name: 'Round Robin (RR)',
    description: 'Time-sliced preemption. Each process gets a fixed time quantum. Fair and responsive.',
    type: 'preemptive',
    complexity: 'O(n * (total_time / quantum)',
    useCases: ['Interactive systems', 'Time-sharing systems', 'Fair scheduling'],
    parameters: ['timeQuantum'],
  },
  mlfq: {
    name: 'Multi-Level Feedback Queue (MLFQ)',
    description: 'Adaptive scheduling with multiple queues and aging. Balances responsiveness and throughput.',
    type: 'preemptive',
    complexity: 'O(n log n)',
    useCases: ['General-purpose OS', 'Desktop systems', 'Responsive systems'],
    parameters: ['agingThreshold'],
  },
};

// GET /api/algorithms
// Get info about all available algorithms
router.get('/', (req, res) => {
  res.json({
    total: Object.keys(ALGORITHM_META).length,
    algorithms: Object.entries(ALGORITHM_META).map(([key, meta]) => ({
      id: key,
      ...meta,
    })),
  });
});

// GET /api/algorithms/:id
// Get detailed info about a specific algorithm
router.get('/:id', (req, res) => {
  const algorithmId = req.params.id.toLowerCase();
  const algorithm = ALGORITHM_META[algorithmId];

  if (!algorithm) {
    return res.status(404).json({ message: `Algorithm '${req.params.id}' not found' });
  }

  res.json({
    id: algorithmId,
    ...algorithm,
  });
});

// POST /api/algorithms/best
// Recommend the best algorithm for given incidents
router.post('/best', (req, res) => {
  const { incidents, priorities } = req.body;

  if (!incidents || !Array.isArray(incidents)) {
    return res.status(400).json({ message: 'Incidents array is required' });
  }

  // Analyze incidents to recommend best algorithm
  const hasPriority = incidents.some(i => i.priority !== undefined);
  const varyingBurstTimes = incidents.some(i => i.burstTime !== undefined);
  const isTimeCritical = incidents.some(i => i.type === 'medical' || i.type === 'fire');

  let recommended = [];

  if (isTimeCritical && hasPriority) {
    recommended.push({
    id: 'priority',
    reason: 'Priority-based scheduling is best for time-critical emergency incidents with defined priorities',
    score: 95,
  });
  } else if (varyingBurstTimes && !isTimeCritical) {
    recommended.push({
    id: 'sjf',
    reason: 'SJF minimizes average waiting time for varying burst times',
    score: 90,
  });
  } else if (isTimeCritical) {
    recommended.push({
    id: 'mlfq',
    reason: 'MLFQ provides good responsiveness and fairness for time-critical systems',
    score: 85,
  });
  } else {
    recommended.push({
    id: 'fcfs',
    reason: 'FCFS is simple and fair for general-purpose use',
    score: 80,
  });
  }

  res.json({
    incidentsCount: incidents.length,
    analysis: { hasPriority, varyingBurstTimes, isTimeCritical },
    recommended,
  });
});

// POST /api/algorithms/test
// Test a single algorithm with sample data
router.post('/test', (req, res) => {
  const { algorithm, timeQuantum, options } = req.body;

  // Sample incidents
  const sampleIncidents = [
    { _id: 'i1', arrivalTime: 0, burstTime: 10, priority: 3, title: 'Fire at Main St' },
    { _id: 'i2', arrivalTime: 2, burstTime: 4, priority: 1, title: 'Medical Emergency' },
    { _id: 'i3', arrivalTime: 4, burstTime: 7, priority: 2, title: 'Police Assistance' },
  ];

  try {
    const result = scheduler.dispatch({
      incidents: sampleIncidents,
      algorithm: algorithm || 'fcfs',
      timeQuantum: timeQuantum || 2,
      options,
    });

    res.json({
      message: `Successfully tested ${algorithm || 'fcfs'} algorithm with sample data',
      sampleIncidents,
      result,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
