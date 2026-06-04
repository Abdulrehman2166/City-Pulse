const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/simulate', require('./routes/simulate'));
app.use('/api/algorithms', require('./routes/algorithms'));
app.use('/api/gantt', require('./routes/gantt'));
app.use('/api/generator', require('./routes/generator'));
app.use('/api/queue', require('./routes/queue'));
app.use('/api/metrics', require('./routes/metrics'));
app.use('/api/realtime', require('./routes/realtime'));
app.use('/api/auto-optimize', require('./routes/auto-optimize'));
app.use('/api/system', require('./routes/systemMonitor'));
// Auth and incident management
app.use('/api/auth', require('./routes/auth'));
app.use('/api/incidents', require('./routes/incidents'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/citizen', require('./routes/citizen'));
app.use('/api/police', require('./routes/police'));
app.use('/api/fire', require('./routes/fire'));
app.use('/api/medical', require('./routes/medical'));
// Notification & ADR Management
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/prioritize', require('./routes/prioritize'));

// API Documentation overview
app.get('/api', (req, res) => {
  res.json({
    message: 'CityPulse OS Scheduling API',
    version: '2.0',
    availableEndpoints: [
      'GET /api/algorithms - List all available scheduling algorithms',
      'GET /api/algorithms/:id - Get details about a specific algorithm',
      'POST /api/algorithms/best - Get recommended algorithm for your data',
      'POST /api/algorithms/test - Test an algorithm with sample data',
      'POST /api/simulate - Run a single scheduling simulation',
      'POST /api/simulate/batch - Run multiple simulations at once',
      'POST /api/simulate/compare - Compare all algorithms',
      'POST /api/gantt - Generate Gantt chart data',
      'POST /api/gantt/compare - Compare Gantt charts for algorithms',
      'POST /api/generator/incidents - Generate test incidents',
      'POST /api/generator/scenario - Generate specific test scenarios',
      'GET /api/queue - Get current process queue',
      'POST /api/queue/push - Add incident to queue',
      'POST /api/queue/pop - Remove incident from queue',
      'POST /api/metrics/calculate - Calculate detailed performance metrics',
      'POST /api/metrics/compare - Compare metrics across algorithms',
    ],
  });
});

// Database connection (optional for initial mock testing, but needed for full MERN)
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));
} else {
  console.log('No MONGO_URI provided in .env, running without database for simulations.');
}

app.get('/', (req, res) => {
  res.send('CityPulse OS Backend is running 🚀');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API docs at http://localhost:${PORT}/api`);
});
