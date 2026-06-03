
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();
const logFile = path.join(__dirname, 'debug-server.log');

function log(msg) {
    const fullMsg = `[${new Date().toISOString()}] ${msg}\n`;
    console.log(fullMsg.trim());
    fs.appendFileSync(logFile, fullMsg);
}

log("=== Starting debug server ===");
log("MONGO_URI is " + (process.env.MONGO_URI ? "set" : "not set"));

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

const Incident = require('./models/Incident');
const store = require('./utils/incidentsStore');

async function testMongo() {
    log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    log("MongoDB connected!");
    const count = await Incident.countDocuments();
    log("Number of incidents in MongoDB: " + count);
    const docs = await Incident.find();
    for (let doc of docs) {
        log("MongoDB doc: " + JSON.stringify(doc));
    }
}

app.get('/test', async (req, res) => {
    log("GET /test hit!");
    try {
        await testMongo();
        const storeIncidents = await store.getAllIncidents();
        log("store.getAllIncidents() returned " + JSON.stringify(storeIncidents));
        res.json({ ok: true, mongoCount: await Incident.countDocuments(), storeIncidents });
    } catch (err) {
        log("ERROR: " + err.stack);
        res.status(500).json({ ok: false, error: err.message });
    }
});

app.listen(PORT, () => {
    log("Debug server listening on port " + PORT);
});
