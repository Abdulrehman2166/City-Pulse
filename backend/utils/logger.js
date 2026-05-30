/**
 * logger.js — Kernel System Event Logger
 * ----------------------------------------
 * OS Concept: Every real OS maintains a kernel ring buffer / system log
 * for auditing process events, syscalls, errors, and performance traces.
 *
 * This module provides:
 *   - Structured event logging (INFO, WARN, ERROR, SYSCALL, DISPATCH)
 *   - In-memory ring buffer (last 200 events)
 *   - Per-category filtering
 *   - Log export (for frontend consumption)
 */

const LOG_LEVELS = {
  INFO:     'INFO',
  WARN:     'WARN',
  ERROR:    'ERROR',
  SYSCALL:  'SYSCALL',
  DISPATCH: 'DISPATCH',
  SCHEDULE: 'SCHEDULE',
  SECURITY: 'SECURITY',
};

const MAX_BUFFER = 200;

// In-memory ring buffer
const logBuffer = [];

let logSequence = 0;

/**
 * Internal write — pushes a log entry into the ring buffer.
 */
function _write(level, category, message, data = {}) {
  const entry = {
    seq:       ++logSequence,
    level,
    category,
    message,
    data,
    timestamp: new Date().toISOString(),
    pid:       process.pid,
  };

  logBuffer.push(entry);

  // Keep ring buffer size bounded
  if (logBuffer.length > MAX_BUFFER) {
    logBuffer.shift();
  }

  // Also write to stdout with color coding
  const prefix = `[${entry.timestamp}] [${level.padEnd(8)}] [${category}]`;
  if (level === LOG_LEVELS.ERROR) {
    console.error(prefix, message, Object.keys(data).length ? data : '');
  } else {
    console.log(prefix, message, Object.keys(data).length ? data : '');
  }

  return entry;
}

// ── Public API ───────────────────────────────────────────────────────────────

function info(category, message, data)     { return _write(LOG_LEVELS.INFO,     category, message, data); }
function warn(category, message, data)     { return _write(LOG_LEVELS.WARN,     category, message, data); }
function error(category, message, data)    { return _write(LOG_LEVELS.ERROR,    category, message, data); }
function syscall(category, message, data)  { return _write(LOG_LEVELS.SYSCALL,  category, message, data); }
function dispatch(category, message, data) { return _write(LOG_LEVELS.DISPATCH, category, message, data); }
function schedule(category, message, data) { return _write(LOG_LEVELS.SCHEDULE, category, message, data); }
function security(category, message, data) { return _write(LOG_LEVELS.SECURITY, category, message, data); }

/**
 * getLogs
 * -------
 * Retrieve filtered log entries for the frontend dashboard.
 */
function getLogs({ limit = 50, level = null, category = null } = {}) {
  let filtered = [...logBuffer].reverse(); // newest first

  if (level)    filtered = filtered.filter(e => e.level    === level.toUpperCase());
  if (category) filtered = filtered.filter(e => e.category === category.toUpperCase());

  return filtered.slice(0, limit);
}

/**
 * getStats
 * --------
 * Count logs per level for analytics widgets.
 */
function getStats() {
  const counts = {};
  Object.values(LOG_LEVELS).forEach(l => { counts[l] = 0; });
  logBuffer.forEach(e => { counts[e.level] = (counts[e.level] || 0) + 1; });
  return { totalEntries: logBuffer.length, byLevel: counts };
}

/**
 * clearLogs
 */
function clearLogs() {
  logBuffer.length = 0;
  logSequence = 0;
}

module.exports = {
  LOG_LEVELS,
  info,
  warn,
  error,
  syscall,
  dispatch,
  schedule,
  security,
  getLogs,
  getStats,
  clearLogs,
};
