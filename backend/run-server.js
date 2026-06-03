
console.log("=== Starting CityPulse Backend ===");
console.log("Loading .env from", __dirname + "/.env");
require('dotenv').config({ path: __dirname + "/.env" });
console.log("Environment variables:", Object.keys(process.env).filter(k => k.startsWith('MONGO') || k.startsWith('PORT')));
console.log("Now requiring server.js...");
require('./server');
