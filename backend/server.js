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
app.use('/api/realtime', require('./routes/realtime'));
app.use('/api/auto-optimize', require('./routes/auto-optimize'));
app.use('/api/system', require('./routes/systemMonitor')); // NEW: System Monitor API!
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
});
