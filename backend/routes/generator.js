const express = require('express');
const router = express.Router();

// Sample incident templates
const INCIDENT_TEMPLATES = {
  fire: [
    'Structure fire at residential building',
    'Wildfire reported near highway',
    'Vehicle fire in parking lot',
    'Commercial building fire alarm activated',
  ],
  police: [
    'Theft reported at convenience store',
    'Traffic accident on Main St',
    'Suspicious activity near park',
    'Domestic disturbance call',
  ],
  medical: [
    'Medical emergency - chest pain',
    'Car accident with injuries',
    'Fall at senior care facility',
    'Allergic reaction reported',
  ],
  infrastructure: [
    'Power outage reported in downtown',
    'Water main break on Oak Ave',
    'Traffic light malfunction',
    'Gas leak reported',
  ],
};

const LOCATIONS = [
  '123 Main St', '456 Oak Ave', '789 Pine Rd', '321 Maple Dr',
  '654 Cedar Ln', '987 Birch Blvd', '147 Spruce Ct', '258 Walnut Way',
];

// Helper function to generate random integer
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper function to shuffle array
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// POST /api/generator/incidents
// Generate random test incidents
router.post('/incidents', (req, res) => {
  const {
    count = 10,
    types = ['fire', 'police', 'medical', 'infrastructure'],
    minArrival = 0,
    maxArrival = 20,
    minBurst = 2,
    maxBurst = 15,
    minPriority = 1,
    maxPriority = 5,
  } = req.body;

  const incidents = [];

  for (let i = 0; i < count; i++) {
    const type = types[randomInt(0, types.length - 1)];
    const descriptions = INCIDENT_TEMPLATES[type];
    const description = descriptions[randomInt(0, descriptions.length - 1)];
    const location = LOCATIONS[randomInt(0, LOCATIONS.length - 1)];

    incidents.push({
      _id: `inc-${Date.now()}-${i}`,
      title: description,
      type,
      location,
      description,
      arrivalTime: randomInt(minArrival, maxArrival),
      burstTime: randomInt(minBurst, maxBurst),
      priority: randomInt(minPriority, maxPriority),
      priorityLabel: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'ROUTINE'][randomInt(0, 4)],
      status: 'pending',
      createdAt: new Date(Date.now() - randomInt(0, 3600000)).toISOString(),
    });
  }

  // Sort by arrival time
  incidents.sort((a, b) => a.arrivalTime - b.arrivalTime);

  res.json({
    count: incidents.length,
    types: [...new Set(incidents.map(i => i.type))],
    incidents,
  });
});

// POST /api/generator/scenario
// Generate specific test scenarios
router.post('/scenario', (req, res) => {
  const { scenario = 'emergency' } = req.body;

  let incidents = [];

  switch (scenario) {
    case 'emergency':
      // Multiple high-priority emergencies
      incidents = [
        { _id: 'e1', arrivalTime: 0, burstTime: 12, priority: 1, type: 'medical', title: 'Cardiac Arrest', location: '123 Main St', priorityLabel: 'CRITICAL' },
        { _id: 'e2', arrivalTime: 1, burstTime: 8, priority: 1, type: 'fire', title: 'House Fire', location: '456 Oak Ave', priorityLabel: 'CRITICAL' },
        { _id: 'e3', arrivalTime: 3, burstTime: 6, priority: 2, type: 'police', title: 'Armed Robbery', location: '789 Pine Rd', priorityLabel: 'HIGH' },
        { _id: 'e4', arrivalTime: 5, burstTime: 10, priority: 3, type: 'medical', title: 'Broken Leg', location: '321 Maple Dr', priorityLabel: 'MEDIUM' },
        { _id: 'e5', arrivalTime: 7, burstTime: 4, priority: 4, type: 'infrastructure', title: 'Power Outage', location: '654 Cedar Ln', priorityLabel: 'LOW' },
      ];
      break;

    case 'mixed':
      // Mix of short and long jobs
      incidents = [
        { _id: 'm1', arrivalTime: 0, burstTime: 15, priority: 3, type: 'infrastructure', title: 'Major Power Restoration', location: 'Downtown', priorityLabel: 'MEDIUM' },
        { _id: 'm2', arrivalTime: 2, burstTime: 3, priority: 2, type: 'medical', title: 'Minor Cut', location: 'Clinic', priorityLabel: 'HIGH' },
        { _id: 'm3', arrivalTime: 4, burstTime: 8, priority: 1, type: 'fire', title: 'Kitchen Fire', location: 'Restaurant', priorityLabel: 'CRITICAL' },
        { _id: 'm4', arrivalTime: 6, burstTime: 2, priority: 4, type: 'police', title: 'Noise Complaint', location: 'Apartment', priorityLabel: 'LOW' },
        { _id: 'm5', arrivalTime: 8, burstTime: 6, priority: 3, type: 'medical', title: 'Flu Symptoms', location: 'Home', priorityLabel: 'MEDIUM' },
      ];
      break;

    case 'fcfs_test':
      // Simple FCFS test case
      incidents = [
        { _id: 'f1', arrivalTime: 0, burstTime: 5, priority: 3, type: 'police', title: 'Incident 1', location: 'Loc 1', priorityLabel: 'MEDIUM' },
        { _id: 'f2', arrivalTime: 1, burstTime: 3, priority: 2, type: 'medical', title: 'Incident 2', location: 'Loc 2', priorityLabel: 'HIGH' },
        { _id: 'f3', arrivalTime: 2, burstTime: 7, priority: 1, type: 'fire', title: 'Incident 3', location: 'Loc 3', priorityLabel: 'CRITICAL' },
      ];
      break;

    default:
      return res.status(400).json({ message: 'Unknown scenario. Choose from: emergency, mixed, fcfs_test' });
  }

  res.json({
    scenario,
    count: incidents.length,
    incidents,
  });
});

// GET /api/generator/scenarios
// List available scenarios
router.get('/scenarios', (req, res) => {
  res.json({
    availableScenarios: [
      { id: 'emergency', name: 'Multiple High-Priority Emergencies', description: 'Tests handling of critical situations' },
      { id: 'mixed', name: 'Mixed Short & Long Jobs', description: 'Tests algorithms with varying burst times' },
      { id: 'fcfs_test', name: 'FCFS Test Case', description: 'Simple scenario for FCFS testing' },
    ],
  });
});

module.exports = router;
