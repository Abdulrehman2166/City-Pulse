
const mongoose = require('mongoose');

console.log('Testing MongoDB connection...');
const MONGO_URI = 'mongodb://localhost:27017/cityPulse';
console.log('MONGO_URI:', MONGO_URI);

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully!');
    return mongoose.disconnect();
  })
  .then(() => {
    console.log('Disconnected from MongoDB');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
