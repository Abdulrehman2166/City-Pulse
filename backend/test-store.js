
console.log("Hello from test-store.js!");
const mongoose = require('mongoose');
const store = require('./utils/incidentsStore');
const Incident = require('./models/Incident');

require('dotenv').config({ path: __dirname + '/.env' });

async function main() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected!");

        console.log("Creating test incident...");
        const incident = await store.createIncident({
            type: "fire",
            location: "Test Street 123",
            description: "Test fire incident",
            reporterId: "test-123"
        });
        console.log("Created incident:", JSON.stringify(incident, null, 2));

        console.log("Fetching all incidents from DB...");
        const allFromDB = await Incident.find();
        console.log("All from DB:", JSON.stringify(allFromDB, null, 2));

        console.log("store.getAllIncidents():", await store.getAllIncidents());

        await mongoose.disconnect();
        console.log("Done!");
    } catch (err) {
        console.error("ERROR:", err);
    }
}

main();
