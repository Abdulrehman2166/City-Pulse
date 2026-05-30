const mongoose = require('mongoose');
require('dotenv').config();

async function checkDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/cityPulse');
    console.log('✅ Connected to MongoDB!');

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📦 Collections in cityPulse DB:');
    collections.forEach(c => console.log('  -', c.name));

    // Also show sample data for each collection
    for (const col of collections) {
      const model = mongoose.model(col.name, new mongoose.Schema({}, { strict: false }));
      const docs = await model.find().limit(3);
      if (docs.length > 0) {
        console.log(`\n📄 Sample data from ${col.name} (first ${docs.length} entries):`);
        docs.forEach((doc, i) => console.log(`  ${i+1}.`, JSON.stringify(doc, null, 2)));
      }
    }

    await mongoose.connection.close();
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

checkDB();
