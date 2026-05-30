const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Incident = require('./models/Incident');

const sampleData = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/cityPulse');
    console.log('✅ Connected!');

    // Clear existing data (optional)
    await User.deleteMany({});
    await Incident.deleteMany({});
    console.log('🗑️ Cleared old data');

    // Create sample users
    const users = await User.create([
      { name: 'Alice Johnson', email: 'alice@citypulse.com', password: await bcrypt.hash('password123', 10), role: 'dispatcher' },
      { name: 'Bob Smith', email: 'bob@citypulse.com', password: await bcrypt.hash('password123', 10), role: 'citizen' },
      { name: 'Charlie Brown', email: 'charlie@citypulse.com', password: await bcrypt.hash('password123', 10), role: 'responder' },
    ]);
    console.log('👤 Created 3 sample users');

    // Create sample incidents
    const incidents = await Incident.create([
      { title: 'Apartment Fire', type: 'fire', arrivalTime: 0, burstTime: 15, priority: 1, status: 'waiting', location: '123 Main St' },
      { title: 'Heart Attack', type: 'medical', arrivalTime: 2, burstTime: 8, priority: 1, status: 'waiting', location: '456 Oak Ave' },
      { title: 'Car Crash', type: 'infrastructure', arrivalTime: 5, burstTime: 10, priority: 3, status: 'waiting', location: '789 Pine Rd' },
      { title: 'Theft Report', type: 'police', arrivalTime: 8, burstTime: 5, priority: 4, status: 'waiting', location: '321 Elm St' },
    ]);
    console.log('🚨 Created 4 sample incidents');

    console.log('\n✅ Sample data added successfully!');
    console.log('\n📌 Login credentials for testing:');
    console.log('   Email: alice@citypulse.com');
    console.log('   Password: password123');

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
};

sampleData();
