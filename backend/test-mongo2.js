
const mongoose = require('mongoose');
const Incident = require('./models/Incident');

console.log('Loading .env...');
require('dotenv').config();
console.log('MONGO_URI:', process.env.MONGO_URI);

async function test() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB!');

    console.log('Creating test incident...');
    const incident = new Incident({
      type: 'fire',
      location: 'Test Mongo Location',
      description: 'Test description for MongoDB',
      reporterId: 'test123',
      status: 'reported',
      assignedRoles: ['fire'],
      assignedUserIds: { fire: 1 },
      schedulingMeta: {
        priority: 1,
        burstEstimate: 15,
        priorityLabel: 'HIGH',
        assignedAt: new Date()
      },
      logs: []
    });

    console.log('Saving incident...');
    const saved = await incident.save();
    console.log('Saved incident:', JSON.stringify(saved, null, 2));

    console.log('Finding all incidents...');
    const all = await Incident.find();
    console.log('All incidents count:', all.length);
    console.log('All incidents:', JSON.stringify(all, null, 2));

    console.log('Disconnecting...');
    await mongoose.disconnect();
    console.log('Done!');
  } catch (err) {
    console.error('ERROR:', err);
  }
}

test();
