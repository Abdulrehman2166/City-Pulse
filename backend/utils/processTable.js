/**
 * processTable.js — OS Process Control Block Table
 * --------------------------------------------------
 * OS Concept: Every real OS maintains a global Process Table in kernel memory.
 * Each entry = one Process Control Block (PCB).
 * 
 * This module simulates:
 *   - PCB creation with full scheduling attributes
 *   - Process state machine (CREATED → READY → RUNNING → WAITING → TERMINATED)
 *   - Context switch counter
 *   - Throughput & CPU utilization tracker
 */

// ── Process States (OS State Machine) ───────────────────────────────────────
const PROCESS_STATES = {
  CREATED:    'created',
  READY:      'ready',
  RUNNING:    'running',
  WAITING:    'waiting',
  TERMINATED: 'terminated',
};

// ── In-Memory Process Table ──────────────────────────────────────────────────
const processTable = new Map(); // pid → PCB

// ── Kernel Counters ──────────────────────────────────────────────────────────
let contextSwitchCount   = 0;
let totalCpuTimeUsed     = 0;
let simulationStartTime  = Date.now();

/**
 * createPCB
 * ---------
 * Allocates a new Process Control Block and registers it in the process table.
 */
function createPCB({ pid, type, priority, burstTime, arrivalTime, location }) {
  const pcb = {
    pid:              pid.toString(),
    type:             type || 'default',
    priority:         priority || 3,
    burstTime:        burstTime || 5,
    remainingTime:    burstTime || 5,
    arrivalTime:      arrivalTime || 0,
    startTime:        null,
    completionTime:   null,
    waitingTime:      null,
    turnaroundTime:   null,
    responseTime:     null,
    state:            PROCESS_STATES.CREATED,
    contextSwitches:  0,
    location:         location || 'Unknown',
    createdAt:        new Date().toISOString(),
    lastStateChange:  new Date().toISOString(),
    stateHistory:     [{ state: PROCESS_STATES.CREATED, at: new Date().toISOString() }],
  };
  processTable.set(pcb.pid, pcb);
  return pcb;
}

/**
 * transitionState
 * ---------------
 * OS Concept: Process State Machine transition with full audit trail.
 * Tracks context switches when moving in/out of RUNNING state.
 */
function transitionState(pid, newState) {
  const pcb = processTable.get(pid.toString());
  if (!pcb) return null;

  const prev = pcb.state;
  pcb.state = newState;
  pcb.lastStateChange = new Date().toISOString();
  pcb.stateHistory.push({ from: prev, to: newState, at: pcb.lastStateChange });

  // Count context switches: leaving RUNNING is a context switch
  if (prev === PROCESS_STATES.RUNNING && newState !== PROCESS_STATES.TERMINATED) {
    pcb.contextSwitches++;
    contextSwitchCount++;
  }
  // Record start time on first RUN
  if (newState === PROCESS_STATES.RUNNING && pcb.startTime === null) {
    pcb.startTime = Date.now();
    pcb.responseTime = pcb.startTime - (simulationStartTime + pcb.arrivalTime * 1000);
  }

  return pcb;
}

/**
 * completePCB
 * -----------
 * Finalise a PCB upon process termination — computes OS metrics.
 */
function completePCB(pid, completionTimeUnits) {
  const pcb = processTable.get(pid.toString());
  if (!pcb) return null;

  pcb.state          = PROCESS_STATES.TERMINATED;
  pcb.completionTime = completionTimeUnits;
  pcb.turnaroundTime = pcb.completionTime - pcb.arrivalTime;
  pcb.waitingTime    = pcb.turnaroundTime - pcb.burstTime;
  totalCpuTimeUsed  += pcb.burstTime;

  processTable.set(pid.toString(), pcb);
  return pcb;
}

/**
 * getPCB / getAllPCBs
 * -------------------
 * Retrieve individual or all process control blocks.
 */
function getPCB(pid) {
  return processTable.get(pid.toString()) || null;
}

function getAllPCBs() {
  return Array.from(processTable.values());
}

/**
 * clearTable
 * ----------
 * Reset process table (useful between simulation runs).
 */
function clearTable() {
  processTable.clear();
  contextSwitchCount  = 0;
  totalCpuTimeUsed    = 0;
  simulationStartTime = Date.now();
}

/**
 * getKernelStats
 * --------------
 * Returns live kernel-level statistics for the dashboard.
 */
function getKernelStats() {
  const all = getAllPCBs();
  const terminated = all.filter(p => p.state === PROCESS_STATES.TERMINATED);
  const uptimeMs = Date.now() - simulationStartTime;

  const avgWaiting    = terminated.length
    ? terminated.reduce((s, p) => s + (p.waitingTime    || 0), 0) / terminated.length
    : 0;
  const avgTurnaround = terminated.length
    ? terminated.reduce((s, p) => s + (p.turnaroundTime || 0), 0) / terminated.length
    : 0;
  const cpuUtilization = uptimeMs > 0
    ? Math.min(100, (totalCpuTimeUsed * 1000 / uptimeMs) * 100)
    : 0;

  return {
    totalProcesses:   all.length,
    terminated:       terminated.length,
    active:           all.filter(p => p.state === PROCESS_STATES.RUNNING).length,
    waiting:          all.filter(p => p.state === PROCESS_STATES.READY || p.state === PROCESS_STATES.WAITING).length,
    contextSwitches:  contextSwitchCount,
    totalCpuTime:     totalCpuTimeUsed,
    cpuUtilization:   parseFloat(cpuUtilization.toFixed(2)),
    avgWaitingTime:   parseFloat(avgWaiting.toFixed(2)),
    avgTurnaroundTime:parseFloat(avgTurnaround.toFixed(2)),
    uptimeSeconds:    Math.floor(uptimeMs / 1000),
    throughput:       uptimeMs > 0 ? parseFloat((terminated.length / (uptimeMs / 1000)).toFixed(4)) : 0,
  };
}

module.exports = {
  PROCESS_STATES,
  createPCB,
  transitionState,
  completePCB,
  getPCB,
  getAllPCBs,
  clearTable,
  getKernelStats,
};
