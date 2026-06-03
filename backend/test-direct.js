
console.log("Hello from test-direct.js!");
const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });
console.log("MONGO_URI from .env:", process.env.MONGO_URI);

async function main() {
    try {
        console.log("Trying to connect...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected successfully!");
        console.log("Collections:", await mongoose.connection.db.listCollections().toArray());
        await mongoose.disconnect();
        console.log("Disconnected.");
    } catch (err) {
        console.error("ERROR:", err);
    }
}

main();
