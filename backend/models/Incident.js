const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['fire', 'medical', 'police', 'infrastructure'],
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  reporterId: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ['received', 'assigned', 'dispatched', 'arrived', 'resolved', 'completed'],
    default: 'received',
  },
  assignedRoles: {
    type: [String],
    default: [],
  },
  assignedUserIds: {
    type: Map,
    of: String,
    default: {},
  },
  etaMinutes: {
    type: Number,
    default: null,
  },
  schedulingMeta: {
    priority: Number,
    burstEstimate: Number,
    priorityLabel: String,
    assignedAt: Date,
  },
  logs: {
    type: [{
      at: Date,
      kind: String,
      status: String,
      actor: Object,
    }],
    default: [],
  },
}, { timestamps: true });

module.exports = mongoose.model('Incident', incidentSchema);
