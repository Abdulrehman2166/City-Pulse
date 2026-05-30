const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['fire', 'medical', 'police', 'infrastructure'],
    required: true,
  },
  arrivalTime: {
    type: Number,
    required: true,
  },
  burstTime: {
    type: Number,
    required: true,
  },
  priority: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  status: {
    type: String,
    enum: ['waiting', 'executing', 'completed'],
    default: 'waiting',
  },
  location: {
    type: String,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Incident', incidentSchema);
