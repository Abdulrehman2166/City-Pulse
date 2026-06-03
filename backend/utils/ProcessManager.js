
const scheduler = require('./scheduler');
const EventEmitter = require('events');

// --- 1. SEMAPHORE / MUTEX FOR SYNCHRONIZATION ---
class Semaphore {
  constructor(initial = 1) {
    this.counter = initial;
    this.queue = [];
  }

  async acquire() {
    return new Promise((resolve) => {
      if (this.counter > 0) {
        this.counter--;
        resolve();
      } else {
        this.queue.push(resolve);
      }
    });
  }

  release() {
    this.counter++;
    if (this.queue.length > 0) {
      const resolve = this.queue.shift();
      this.counter--;
      resolve();
    }
  }
}

class Mutex extends Semaphore {
  constructor() {
    super(1);
  }
}

// --- 2. PCB (PROCESS CONTROL BLOCK) ---
class PCB {
  constructor(process) {
    this.pid = process._id || Date.now() + Math.random();
    this.state = 'NEW'; // NEW -> READY -> RUNNING -> WAITING -> TERMINATED
    this.process = process;
    this.priority = process.priority;
    this.originalPriority = process.priority; // For aging
    this.arrivalTime = process.arrivalTime || 0;
    this.burstTime = process.burstTime;
    this.remainingTime = process.burstTime;
    this.startTime = null;
    this.completionTime = null;
    this.waitingTime = 0;
    this.turnaroundTime = 0;
    this.resourcesHeld = [];
    this.assignedCore = null;
    this.age = 0; // Priority age
  }
}

// --- 3. RESOURCE MANAGER & DEADLOCK DETECTION/RECOVERY ---
class ResourceManager {
  constructor() {
    this.resources = {
      fireEngine: { available: 2, max: 2, name: 'Fire Engine' },
      ambulance: { available: 2, max: 2, name: 'Ambulance' },
      policeCar: { available: 2, max: 2, name: 'Police Car' },
      powerUnit: { available: 1, max: 1, name: 'Power Unit' },
    };
    this.allocation = {}; // { pid: { resource: count } }
    this.request = {}; // { pid: { resource: count } }
    this.mutex = new Mutex(); // Protect resource operations
  }

  // Request resource
  async requestResource(pid, resource, count) {
    await this.mutex.acquire();
    try {
      if (!this.request[pid]) this.request[pid] = {};
      this.request[pid][resource] = (this.request[pid][resource] || 0) + count;

      // Check if we can allocate immediately
      if (this.resources[resource].available >= count) {
        this.allocateResource(pid, resource, count);
        return { success: true, message: 'Resource allocated' };
      }
      return { success: false, message: 'Resource waiting in queue' };
    } finally {
      this.mutex.release();
    }
  }

  // Allocate resource
  allocateResource(pid, resource, count) {
    this.resources[resource].available -= count;
    if (!this.allocation[pid]) this.allocation[pid] = {};
    this.allocation[pid][resource] = (this.allocation[pid][resource] || 0) + count;
    // Remove from request
    if (this.request[pid] && this.request[pid][resource]) {
      this.request[pid][resource] -= count;
      if (this.request[pid][resource] <= 0) delete this.request[pid][resource];
    }
  }

  // Release resource
  async releaseResource(pid, resource, count) {
    await this.mutex.acquire();
    try {
      if (this.allocation[pid] && this.allocation[pid][resource] >= count) {
        this.resources[resource].available += count;
        this.allocation[pid][resource] -= count;
        if (this.allocation[pid][resource] <= 0) delete this.allocation[pid];
        return { success: true, message: 'Resource released' };
      }
      return { success: false, message: 'Process does not hold this resource' };
    } finally {
      this.mutex.release();
    }
  }

  // Banker's Algorithm for Deadlock Detection
  detectDeadlock() {
    const work = JSON.parse(JSON.stringify(this.resources));
    const finish = {};
    const safeSequence = [];
    const allPids = [...Object.keys(this.allocation), ...Object.keys(this.request)];

    allPids.forEach(pid => { finish[pid] = false; });

    let found;
    do {
      found = false;
      for (const pid of allPids) {
        if (!finish[pid]) {
          let canAllocate = true;
          for (const resource in this.request[pid]) {
            if ((this.request[pid][resource] || 0) > work[resource].available) {
              canAllocate = false; break;
            }
          }
          if (canAllocate) {
            for (const resource in this.allocation[pid]) {
              work[resource].available += this.allocation[pid][resource] || 0;
            }
            finish[pid] = true;
            safeSequence.push(pid);
            found = true;
          }
        }
      }
    } while (found);

    const deadlockedPids = allPids.filter(pid => !finish[pid]);
    return {
      isDeadlocked: deadlockedPids.length > 0,
      safeSequence,
      deadlockedPids
    };
  }

  // Deadlock Recovery: Preempt resources from lowest priority process
  async recoverFromDeadlock(deadlockedPids, pcbs) {
    if (deadlockedPids.length === 0) return { success: true, message: 'No deadlock' };
    
    // Find lowest priority process to terminate
    let lowestPriorityPid = null;
    let lowestPriority = Infinity;
    for (const pid of deadlockedPids) {
      const pcb = pcbs.find(p => p.pid == pid);
      if (pcb && pcb.priority < lowestPriority) {
        lowestPriority = pcb.priority;
        lowestPriorityPid = pid;
      }
    }

    // Terminate lowest priority process and release all resources
    if (lowestPriorityPid) {
      for (const resource in this.allocation[lowestPriorityPid]) {
        this.resources[resource].available += this.allocation[lowestPriorityPid][resource];
      }
      delete this.allocation[lowestPriorityPid];
      delete this.request[lowestPriorityPid];
    }

    return { success: true, terminatedPid: lowestPriorityPid, message: 'Deadlock recovered by preemption' };
  }
}

// --- 4. REAL-TIME SCHEDULER WITH LOAD BALANCING & AGING ---
class AutoOptimizingScheduler extends EventEmitter {
  constructor() {
    super();
    this.pcbs = [];
    this.resourceManager = new ResourceManager();
    this.currentAlgorithm = 'rr';
    this.timeQuantum = 2;
    this.cores = [ // Simulate 2 CPU cores
      { id: 0, currentProcess: null, utilization: 0 },
      { id: 1, currentProcess: null, utilization: 0 }
    ];
    this.tickInterval = null;
    this.globalTime = 0;
  }

  // Add process
  addProcess(process) {
    const pcb = new PCB(process);
    this.pcbs.push(pcb);
    this.emit('processAdded', pcb);
    return pcb;
  }

  // Apply priority aging: Increase priority of waiting processes every 5 ticks
  applyPriorityAging() {
    this.pcbs.forEach(pcb => {
      if (pcb.state === 'READY' || pcb.state === 'WAITING') {
        pcb.age++;
        if (pcb.age % 5 === 0 && pcb.priority > 1) {
          pcb.priority--; // Lower number = higher priority
          this.emit('priorityIncreased', pcb);
        }
      }
    });
  }

  // Load balancing: Distribute processes across cores
  loadBalance() {
    const runningProcesses = this.pcbs.filter(pcb => pcb.state === 'RUNNING');
    const readyProcesses = this.pcbs.filter(pcb => pcb.state === 'READY');
    const freeCores = this.cores.filter(core => core.currentProcess === null);

    // Assign free cores to READY processes
    freeCores.forEach(core => {
      if (readyProcesses.length > 0) {
        const process = readyProcesses.shift();
        process.state = 'RUNNING';
        process.assignedCore = core.id;
        process.startTime = process.startTime === null ? this.globalTime : process.startTime;
        core.currentProcess = process.pid;
        this.emit('processStarted', process);
      }
    });
  }

  // Run simulation tick
  async runTick() {
    this.globalTime++;
    this.emit('tick', this.globalTime);

    // 1. Apply priority aging
    this.applyPriorityAging();

    // 2. Check for deadlock & recover if needed
    const deadlockCheck = this.resourceManager.detectDeadlock();
    if (deadlockCheck.isDeadlocked) {
      this.emit('deadlockDetected', deadlockCheck.deadlockedPids);
      await this.resourceManager.recoverFromDeadlock(deadlockCheck.deadlockedPids, this.pcbs);
      this.emit('deadlockRecovered');
    }

    // 3. Run current processes for 1 tick
    this.cores.forEach(core => {
      if (core.currentProcess !== null) {
        const pcb = this.pcbs.find(p => p.pid === core.currentProcess);
        if (pcb) {
          pcb.remainingTime--;
          if (pcb.remainingTime <= 0) {
            // Process complete
            pcb.state = 'TERMINATED';
            pcb.completionTime = this.globalTime;
            pcb.turnaroundTime = pcb.completionTime - pcb.arrivalTime;
            pcb.waitingTime = pcb.turnaroundTime - pcb.burstTime;
            core.currentProcess = null;
            this.emit('processCompleted', pcb);
          }
        }
      }
    });

    // 4. Load balance cores
    this.loadBalance();
  }

  // Start real-time simulation
  startSimulation() {
    if (this.tickInterval) return;
    // Set initial states
    this.pcbs.forEach(pcb => {
      if (pcb.state === 'NEW') {
        pcb.state = 'READY';
      }
    });
    this.loadBalance();
    this.tickInterval = setInterval(() => this.runTick(), 1000);
    this.emit('simulationStarted');
  }

  // Stop simulation
  stopSimulation() {
    if (this.tickInterval) clearInterval(this.tickInterval);
    this.tickInterval = null;
    this.emit('simulationStopped');
  }

  // Get system metrics
  getSystemMetrics() {
    const completed = this.pcbs.filter(p => p.state === 'TERMINATED');
    const avgTurnaround = completed.length ? 
      completed.reduce((sum, p) => sum + p.turnaroundTime, 0) / completed.length : 0;
    const avgWaiting = completed.length ? 
      completed.reduce((sum, p) => sum + p.waitingTime, 0) / completed.length : 0;

    return {
      globalTime: this.globalTime,
      totalProcesses: this.pcbs.length,
      states: {
        new: this.pcbs.filter(p => p.state === 'NEW').length,
        ready: this.pcbs.filter(p => p.state === 'READY').length,
        running: this.pcbs.filter(p => p.state === 'RUNNING').length,
        waiting: this.pcbs.filter(p => p.state === 'WAITING').length,
        terminated: this.pcbs.filter(p => p.state === 'TERMINATED').length
      },
      cores: this.cores,
      resources: this.resourceManager.resources,
      metrics: { avgTurnaround, avgWaiting }
    };
  }

  // Auto-optimize scheduler based on current workload benchmarks
  async autoOptimize(timeQuantum = 2) {
    if (this.pcbs.length === 0) {
      return {
        success: false,
        message: 'No processes in the queue to optimize.'
      };
    }

    // Format current PCBs as incident inputs for scheduler benchmarking
    const incidents = this.pcbs.map(pcb => ({
      _id: pcb.pid,
      title: pcb.process.title || `Incident ${pcb.pid}`,
      type: pcb.process.type || 'police',
      arrivalTime: pcb.arrivalTime,
      burstTime: pcb.burstTime,
      priority: pcb.priority
    }));

    const algorithms = ['fcfs', 'sjf', 'priority', 'rr', 'mlfq', 'srtf'];
    const comparison = {};

    algorithms.forEach(alg => {
      try {
        const result = scheduler.dispatch({
          incidents,
          algorithm: alg,
          timeQuantum,
        });

        // Use backend metrics engine to calculate advanced scheduling metrics
        const metricsEngine = require('./metrics');
        const analysis = metricsEngine.analyseRun({
          algorithm: alg,
          results: result.results,
          timeline: result.timeline
        });

        comparison[alg] = analysis;
      } catch (err) {
        console.error(`Benchmarking failed for ${alg}:`, err);
      }
    });

    // Select optimal algorithm based on lowest average waiting time,
    // fallback to highest fairness if waiting times are similar.
    let optimalAlgorithm = this.currentAlgorithm;
    let lowestWaitingTime = Infinity;
    let highestFairness = -Infinity;

    for (const [alg, data] of Object.entries(comparison)) {
      const awt = data.avgWaitingTime;
      const fairness = data.fairnessIndex;

      if (awt < lowestWaitingTime) {
        lowestWaitingTime = awt;
        highestFairness = fairness;
        optimalAlgorithm = alg;
      } else if (Math.abs(awt - lowestWaitingTime) < 0.1 && fairness > highestFairness) {
        highestFairness = fairness;
        optimalAlgorithm = alg;
      }
    }

    const previousAlgorithm = this.currentAlgorithm;
    this.currentAlgorithm = optimalAlgorithm;

    // Calculate percentage improvements
    const currentMetrics = comparison[previousAlgorithm] || comparison.fcfs;
    const optimalMetrics = comparison[optimalAlgorithm];

    const waitTimeReduction = currentMetrics.avgWaitingTime > 0
      ? parseFloat((((currentMetrics.avgWaitingTime - optimalMetrics.avgWaitingTime) / currentMetrics.avgWaitingTime) * 100).toFixed(2))
      : 0;

    const turnaroundReduction = currentMetrics.avgTurnaroundTime > 0
      ? parseFloat((((currentMetrics.avgTurnaroundTime - optimalMetrics.avgTurnaroundTime) / currentMetrics.avgTurnaroundTime) * 100).toFixed(2))
      : 0;

    const report = {
      success: true,
      previousAlgorithm,
      optimalAlgorithm,
      waitTimeReductionPercent: Math.max(0, waitTimeReduction),
      turnaroundReductionPercent: Math.max(0, turnaroundReduction),
      comparison,
      recommendation: {
        algorithm: optimalAlgorithm,
        justification: `Optimal algorithm automatically switched from '${previousAlgorithm}' to '${optimalAlgorithm}'. SJF/SRTF provides low average waiting times, MLFQ/RR optimizes fairness.`
      }
    };

    this.emit('autoOptimized', report);
    return report;
  }

  // Check and recover from resource deadlocks
  checkDeadlock() {
    const deadlockCheck = this.resourceManager.detectDeadlock();
    let recoveryReport = null;

    if (deadlockCheck.isDeadlocked) {
      this.emit('deadlockDetected', deadlockCheck.deadlockedPids);
      
      // Perform recovery by preemption
      const workList = this.pcbs;
      
      // Find lowest priority process in deadlock
      let lowestPriorityPid = null;
      let lowestPriority = Infinity;
      for (const pid of deadlockCheck.deadlockedPids) {
        const pcb = workList.find(p => p.pid == pid);
        if (pcb && pcb.priority < lowestPriority) {
          lowestPriority = pcb.priority;
          lowestPriorityPid = pid;
        }
      }

      if (lowestPriorityPid) {
        // Preempt resources
        for (const resource in this.resourceManager.allocation[lowestPriorityPid]) {
          this.resourceManager.resources[resource].available += this.resourceManager.allocation[lowestPriorityPid][resource];
        }
        delete this.resourceManager.allocation[lowestPriorityPid];
        delete this.resourceManager.request[lowestPriorityPid];

        // Transition the deadlocked process to TERMINATED
        const victimPcb = this.pcbs.find(p => p.pid == lowestPriorityPid);
        if (victimPcb) {
          victimPcb.state = 'TERMINATED';
          victimPcb.completionTime = this.globalTime;
          victimPcb.turnaroundTime = victimPcb.completionTime - victimPcb.arrivalTime;
          victimPcb.waitingTime = victimPcb.turnaroundTime - victimPcb.burstTime;
          victimPcb.preempted = true; // Mark as preempted victim
        }

        recoveryReport = {
          success: true,
          terminatedPid: lowestPriorityPid,
          message: `Deadlock recovered successfully by terminating victim process (PID: ${lowestPriorityPid}) and reclaiming its held resources.`
        };
      }

      this.emit('deadlockRecovered', recoveryReport);
    }

    return {
      isDeadlocked: deadlockCheck.isDeadlocked,
      deadlockedPids: deadlockCheck.deadlockedPids,
      safeSequence: deadlockCheck.safeSequence,
      recoveryReport,
      resources: this.resourceManager.resources
    };
  }
}

// --- EXPORT ---
module.exports = {
  Semaphore,
  Mutex,
  PCB,
  ResourceManager,
  AutoOptimizingScheduler
};
