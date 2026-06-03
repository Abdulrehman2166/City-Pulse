
const mongoose = require('mongoose');
const Incident = require('./models/Incident');
require('dotenv').config({ path: __dirname + '/.env' });

async function main() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB!");
        const docs = await Incident.find();
        console.log("Number of docs in incidents collection:", docs.length);
        for (let doc of docs) {
            console.log("Doc:", JSON.stringify(doc, null, 2));
        }
        await mongoose.disconnect();
    } catch (err) {
        console.error("ERROR:", err);
    }
}

main();
