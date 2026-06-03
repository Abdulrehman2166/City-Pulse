
console.log("Testing route requires...");

try {
    console.log("1. Requiring ./routes/simulate...");
    require('./routes/simulate');
    console.log("   OK!");
} catch (e) { console.error("   ERROR:", e); }

try {
    console.log("2. Requiring ./routes/realtime...");
    require('./routes/realtime');
    console.log("   OK!");
} catch (e) { console.error("   ERROR:", e); }

try {
    console.log("3. Requiring ./routes/auto-optimize...");
    require('./routes/auto-optimize');
    console.log("   OK!");
} catch (e) { console.error("   ERROR:", e); }

try {
    console.log("4. Requiring ./routes/systemMonitor...");
    require('./routes/systemMonitor');
    console.log("   OK!");
} catch (e) { console.error("   ERROR:", e); }

try {
    console.log("5. Requiring ./routes/auth...");
    require('./routes/auth');
    console.log("   OK!");
} catch (e) { console.error("   ERROR:", e); }

try {
    console.log("6. Requiring ./routes/incidents...");
    require('./routes/incidents');
    console.log("   OK!");
} catch (e) { console.error("   ERROR:", e); }

try {
    console.log("7. Requiring ./routes/admin...");
    require('./routes/admin');
    console.log("   OK!");
} catch (e) { console.error("   ERROR:", e); }

try {
    console.log("8. Requiring ./routes/citizen...");
    require('./routes/citizen');
    console.log("   OK!");
} catch (e) { console.error("   ERROR:", e); }

try {
    console.log("9. Requiring ./routes/police...");
    require('./routes/police');
    console.log("   OK!");
} catch (e) { console.error("   ERROR:", e); }

try {
    console.log("10. Requiring ./routes/fire...");
    require('./routes/fire');
    console.log("   OK!");
} catch (e) { console.error("   ERROR:", e); }

try {
    console.log("11. Requiring ./routes/medical...");
    require('./routes/medical');
    console.log("   OK!");
} catch (e) { console.error("   ERROR:", e); }

try {
    console.log("12. Requiring ./routes/notifications...");
    require('./routes/notifications');
    console.log("   OK!");
} catch (e) { console.error("   ERROR:", e); }

try {
    console.log("13. Requiring ./routes/prioritize...");
    require('./routes/prioritize');
    console.log("   OK!");
} catch (e) { console.error("   ERROR:", e); }

console.log("Done testing!");
