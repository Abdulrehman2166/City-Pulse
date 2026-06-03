
const fs = require('fs');
const path = require('path');
const logFile = path.join(__dirname, 'test-output.log');

function log(msg) {
    console.log(msg);
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`);
}

log("=== Starting write-test-file.js ===");
log("__dirname: " + __dirname);

try {
    log("Loading dotenv...");
    require('dotenv').config({ path: path.join(__dirname, '.env') });
    log("MONGO_URI: " + (process.env.MONGO_URI ? "set" : "NOT set"));

    log("Testing require('./server')...");
    require('./server');
    log("Server required successfully!");

} catch (err) {
    log("ERROR: " + err.message);
    log(err.stack);
}
