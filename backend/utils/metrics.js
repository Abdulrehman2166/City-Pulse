/**
 * metrics.js — Scheduling Performance Metrics Engine
 * ----------------------------------------------------
 * OS Concept: After each scheduler run, an OS evaluates algorithm efficiency
 * using standard CPU scheduling performance metrics.
 *
 * This module computes:
 *   - Average Waiting Time (AWT)
 *   - Average Turnaround Time (ATT)
 *   - Average Response Time (ART)
 *   - CPU Utilization %
 *   - Throughput (processes / unit time)
 *   - Convoy Effect likelihood score (FCFS)
 *   - Starvation Risk assessment (Priority / SJF)
 *   - Fairness Index (Round Robin / MLFQ)
 *   - Algorithm-specific insights
 */

/**
 * computeBaseMetrics
 * ------------------
 * Calculates the standard OS scheduling metrics from simulation results.
 */
function computeBaseMetrics(results, timeline) {
  if (!results || results.length === 0) {
    return {
      avgWaitingTime:     0,
      avgTurnaroundTime:  0,
      avgResponseTime:    0,
      cpuUtilization:     0,
      throughput:         0,
      totalTime:          0,
      totalIdleTime:      0,
    };
  }

  const valid = results.filter(p => p.completionTime !== undefined);

  const totalWT  = valid.reduce((s, p) => s + (p.waitingTime    || 0), 0);
  const totalTAT = valid.reduce((s, p) => s + (p.turnaroundTime || 0), 0);

  // Total span = last completion - first arrival
  const totalTime = timeline.length
    ? Math.max(...timeline.map(t => t.end)) - Math.min(...timeline.map(t => t.start))
    : 0;

  // Total CPU busy time
  const totalBusyTime = timeline.reduce((s, t) => s + (t.end - t.start), 0);
  const totalIdleTime = Math.max(0, totalTime - totalBusyTime);
  const cpuUtilization = totalTime > 0
    ? parseFloat(((totalBusyTime / totalTime) * 100).toFixed(2))
    : 0;

  // Throughput: processes completed per time unit
  const throughput = totalTime > 0
    ? parseFloat((valid.length / totalTime).toFixed(4))
    : 0;

  return {
    avgWaitingTime:    parseFloat((totalWT  / valid.length).toFixed(2)),
    avgTurnaroundTime: parseFloat((totalTAT / valid.length).toFixed(2)),
    avgResponseTime:   parseFloat((totalWT  / valid.length).toFixed(2)), // approx
    cpuUtilization,
    throughput,
    totalTime,
    totalIdleTime,
    processCount:      valid.length,
  };
}

/**
 * detectConvoyEffect
 * ------------------
 * OS Concept: Convoy Effect in FCFS — long processes block shorter ones.
 * Score 0–100: >60 = high convoy risk.
 */
function detectConvoyEffect(results) {
  if (!results || results.length < 2) return { score: 0, risk: 'None' };

  const burstTimes = results.map(p => p.burstTime || 0);
  const max = Math.max(...burstTimes);
  const min = Math.min(...burstTimes);
  const variance = max - min;
  const score = Math.min(100, Math.floor((variance / (max || 1)) * 100));

  let risk = 'Low';
  if (score > 60) risk = 'High';
  else if (score > 30) risk = 'Medium';

  return { score, risk, maxBurst: max, minBurst: min };
}

/**
 * detectStarvationRisk
 * --------------------
 * OS Concept: Starvation in Priority/SJF — low-priority / long jobs never execute.
 * Score 0–100: >70 = starvation likely.
 */
function detectStarvationRisk(results) {
  if (!results || results.length === 0) return { score: 0, risk: 'None', starvingCount: 0 };

  const avgWT = results.reduce((s, p) => s + (p.waitingTime || 0), 0) / results.length;
  const maxWT = Math.max(...results.map(p => p.waitingTime || 0));
  // Processes waiting more than 2x average are starvation candidates
  const starving = results.filter(p => (p.waitingTime || 0) > avgWT * 2);
  const score = Math.min(100, Math.floor((starving.length / results.length) * 100));

  let risk = 'Low';
  if (score > 60) risk = 'High';
  else if (score > 30) risk = 'Medium';

  return { score, risk, starvingCount: starving.length, maxWaitingTime: maxWT };
}

/**
 * computeFairnessIndex
 * --------------------
 * OS Concept: Jain's Fairness Index — 1.0 = perfectly fair (RR), < 0.5 = very unfair.
 */
function computeFairnessIndex(results) {
  if (!results || results.length === 0) return 1.0;

  const wts = results.map(p => p.waitingTime || 0);
  const n = wts.length;
  const sumSq = wts.reduce((s, w) => s + w * w, 0);
  const sum   = wts.reduce((s, w) => s + w, 0);

  if (sumSq === 0) return 1.0;
  return parseFloat(((sum * sum) / (n * sumSq)).toFixed(4));
}

/**
 * generateInsights
 * ----------------
 * Produces human-readable performance insight strings for the frontend.
 */
function generateInsights(algorithm, base, convoy, starvation, fairness) {
  const insights = [];

  if (base.avgWaitingTime < 3) {
    insights.push({ type: 'success', msg: `Excellent average waiting time of ${base.avgWaitingTime} units.` });
  } else if (base.avgWaitingTime > 8) {
    insights.push({ type: 'warning', msg: `High average waiting time (${base.avgWaitingTime} units). Consider a preemptive algorithm.` });
  }

  if (base.cpuUtilization > 90) {
    insights.push({ type: 'success', msg: `CPU utilization is ${base.cpuUtilization}% — near optimal throughput.` });
  } else if (base.cpuUtilization < 60) {
    insights.push({ type: 'info', msg: `CPU idle ${100 - base.cpuUtilization}% of the time. Some processes may not be arriving frequently enough.` });
  }

  if (convoy.risk === 'High' && algorithm === 'fcfs') {
    insights.push({ type: 'error', msg: `High Convoy Effect risk detected (score: ${convoy.score}/100). Long processes are blocking shorter ones.` });
  }

  if (starvation.risk === 'High') {
    insights.push({ type: 'error', msg: `Starvation detected: ${starvation.starvingCount} processes waiting excessively. Consider aging or switching to MLFQ.` });
  }

  if (fairness < 0.5) {
    insights.push({ type: 'warning', msg: `Fairness Index is low (${fairness}). Resource allocation is uneven across processes.` });
  } else if (fairness > 0.9) {
    insights.push({ type: 'success', msg: `Fairness Index ${fairness} — scheduling is highly equitable.` });
  }

  if (algorithm === 'rr') {
    insights.push({ type: 'info', msg: `Round Robin ensures time-sharing across all ${base.processCount} incidents. Best for interactive & mixed workloads.` });
  }

  if (algorithm === 'mlfq') {
    insights.push({ type: 'info', msg: `MLFQ dynamically demotes CPU-heavy tasks and promotes starving ones. Context switches may be elevated.` });
  }

  return insights;
}

/**
 * analyseRun
 * ----------
 * Master function — computes all metrics for one algorithm run.
 */
function analyseRun({ algorithm, results, timeline }) {
  const base       = computeBaseMetrics(results, timeline);
  const convoy     = detectConvoyEffect(results);
  const starvation = detectStarvationRisk(results);
  const fairness   = computeFairnessIndex(results);
  const insights   = generateInsights(algorithm, base, convoy, starvation, fairness);

  return {
    algorithm,
    ...base,
    convoySeverity: convoy,
    starvationRisk: starvation,
    fairnessIndex:  fairness,
    insights,
    analysedAt:     new Date().toISOString(),
  };
}

module.exports = {
  computeBaseMetrics,
  detectConvoyEffect,
  detectStarvationRisk,
  computeFairnessIndex,
  generateInsights,
  analyseRun,
};
