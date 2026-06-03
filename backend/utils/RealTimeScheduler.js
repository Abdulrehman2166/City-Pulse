
const EventEmitter = require('events');
const scheduler = require('./scheduler');

// Define Incident States
const INCIDENT_STATES = {
  WAITING: 'waiting',
  EXECUTING: 'executing',
  COMPLETED: 'completed',
  PREEMPTED: 'preempted',
};

// CPU Core Simulation
class CPUCore {
  constructor(id) {
    this.id = id;
    this.isBusy = false;
    this.currentProcess = null;
    this.remainingTime = 0;
  }

  assign(process, time) {
    this.isBusy = true;
    this.currentProcess = process;
    this.remainingTime = time;
  }

  tick() {
    if (this.isBusy && this.currentProcess) {
      this.remainingTime--;
      this.currentProcess.remainingBurstTime = (this.currentProcess.remainingBurstTime || this.currentProcess.burstTime) - 1;

      if (this.remainingTime <= 0) {
        const completedProcess = this.currentProcess;
        this.currentProcess = null;
        this.isBusy = false;
        return completedProcess;
      }
    }
    return null;
  }

  preempt() {
    if (this.isBusy && this.currentProcess) {
      const preemptedProcess = this.currentProcess;
      this.currentProcess = null;
      this.isBusy = false;
      return preemptedProcess;
    }
    return null;
  }
}

// Main Real-Time Scheduler
class RealTimeScheduler extends EventEmitter {
  constructor(options = {}) {
    super();
    this.numCores = options.numCores || 2; // Simulate 2 CPU cores
    this.cores = Array.from({ length: this.numCores }, (_, i) => new CPUCore(i + 1));
    this.readyQueue = [];
    this.waitingQueue = [];
    this.completedQueue = [];
    this.currentTime = 0;
    this.tickInterval = null;
    this.algorithm = options.algorithm || 'fcfs';
    this.timeQuantum = options.timeQuantum || 2;
    this.isRunning = false;
  }

  // Add incident to queue
  addIncident(incident) {
    const newProcess = {
      ...incident,
      state: INCIDENT_STATES.WAITING,
      arrivalTime: this.currentTime,
      remainingBurstTime: incident.burstTime,
      startTime: null,
      endTime: null,
    };

    if (newProcess.arrivalTime <= this.currentTime) {
      this.readyQueue.push(newProcess);
    } else {
      this.waitingQueue.push(newProcess);
    }

    this.emit('incidentAdded', newProcess);
    this.sortReadyQueue();
    return newProcess;
  }

  // Sort ready queue based on algorithm
  sortReadyQueue() {
    switch (this.algorithm) {
      case 'fcfs':
        this.readyQueue.sort((a, b) => a.arrivalTime - b.arrivalTime);
        break;
      case 'sjf':
      case 'srtf':
        this.readyQueue.sort((a, b) => a.remainingBurstTime - b.remainingBurstTime);
        break;
      case 'priority':
        this.readyQueue.sort((a, b) => a.priority - b.priority);
        break;
      case 'rr':
        // RR uses FIFO with time quantum
        break;
      case 'mlfq':
        this.readyQueue.sort((a, b) => (a.queueLevel || 0) - (b.queueLevel || 0));
        break;
    }
  }

  // Preemptive scheduling check for SRTF
  checkPreemption() {
    if (this.algorithm !== 'srtf') return;

    for (const core of this.cores) {
      if (core.isBusy && core.currentProcess) {
        const shorterJob = this.readyQueue.find(
          p => p.remainingBurstTime < core.currentProcess.remainingBurstTime
        );

        if (shorterJob) {
          const preempted = core.preempt();
          if (preempted) {
            preempted.state = INCIDENT_STATES.PREEMPTED;
            this.readyQueue.push(preempted);
            this.emit('incidentPreempted', preempted);
            this.sortReadyQueue();
          }
        }
      }
    }
  }

  // Move waiting incidents to ready queue when their arrival time comes
  moveWaitingToReady() {
    const arrived = this.waitingQueue.filter(i => i.arrivalTime <= this.currentTime);
    this.waitingQueue = this.waitingQueue.filter(i => i.arrivalTime > this.currentTime);
    this.readyQueue.push(...arrived);
    arrived.forEach(i => {
      i.state = INCIDENT_STATES.WAITING;
      this.emit('incidentReady', i);
    });
    this.sortReadyQueue();
  }

  // Assign processes to available cores
  assignProcessesToCores() {
    for (const core of this.cores) {
      if (!core.isBusy && this.readyQueue.length > 0) {
        let process;

        if (this.algorithm === 'rr') {
          process = this.readyQueue.shift();
          const executeTime = Math.min(process.remainingBurstTime, this.timeQuantum);
          core.assign(process, executeTime);
        } else {
          process = this.readyQueue.shift();
          core.assign(process, process.remainingBurstTime);
        }

        process.state = INCIDENT_STATES.EXECUTING;
        if (!process.startTime) process.startTime = this.currentTime;
        this.emit('incidentStarted', { process, coreId: core.id });
      }
    }
  }

  // Single tick of the scheduler
  tick() {
    this.currentTime++;
    this.emit('tick', this.currentTime);

    // Move waiting to ready
    this.moveWaitingToReady();

    // Check preemption
    this.checkPreemption();

    // Assign to cores
    this.assignProcessesToCores();

    // Run cores
    for (const core of this.cores) {
      const completed = core.tick();
      if (completed) {
        completed.state = INCIDENT_STATES.COMPLETED;
        completed.endTime = this.currentTime;
        this.completedQueue.push(completed);
        this.emit('incidentCompleted', completed);
      }
    }
  }

  // Start real-time simulation
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.emit('started');

    this.tickInterval = setInterval(() => {
      this.tick();

      // Stop if all processes are completed
      if (
        this.readyQueue.length === 0 &&
        this.waitingQueue.length === 0 &&
        this.cores.every(c => !c.isBusy)
      ) {
        this.stop();
      }
    }, 1000); // 1 tick per second
  }

  // Stop simulation
  stop() {
    if (!this.isRunning) return;
    this.isRunning = false;
    clearInterval(this.tickInterval);
    this.emit('stopped', this.getMetrics());
  }

  // Get current metrics
  getMetrics() {
    const allProcesses = [...this.completedQueue, ...this.readyQueue, ...this.waitingQueue, ...this.cores.map(c => c.currentProcess).filter(Boolean)];

    const completed = this.completedQueue;
    const avgTurnaround = completed.length
      ? completed.reduce((sum, p) => sum + (p.endTime - p.arrivalTime), 0) / completed.length
      : 0;
    const avgWaiting = completed.length
      ? completed.reduce((sum, p) => sum + (p.startTime - p.arrivalTime), 0) / completed.length
      : 0;

    return {
      currentTime: this.currentTime,
      readyQueue: this.readyQueue,
      waitingQueue: this.waitingQueue,
      completedQueue: this.completedQueue,
      cores: this.cores,
      avgTurnaroundTime: avgTurnaround,
      avgWaitingTime: avgWaiting,
      throughput: completed.length / Math.max(1, this.currentTime),
      cpuUtilization: this.cores.filter(c => c.isBusy).length / this.numCores * 100,
    };
  }
}

module.exports = { RealTimeScheduler, INCIDENT_STATES };
