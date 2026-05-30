/**
 * CPU Scheduling Algorithms for CityPulse OS Simulation
 * Each process (incident) should have:
 * - _id: String
 * - arrivalTime: Number
 * - burstTime: Number
 * - priority: Number (1 is highest priority)
 */

function calculateMetrics(processes) {
  let totalWait = 0;
  let totalTurnaround = 0;
  processes.forEach(p => {
    totalWait += p.waitingTime;
    totalTurnaround += p.turnaroundTime;
  });
  return {
    averageWaitingTime: processes.length ? totalWait / processes.length : 0,
    averageTurnaroundTime: processes.length ? totalTurnaround / processes.length : 0
  };
}

// 1. First Come First Serve (FCFS)
exports.fcfs = (incidents) => {
  let processes = [...incidents].sort((a, b) => a.arrivalTime - b.arrivalTime);
  let timeline = [];
  let currentTime = 0;

  let results = processes.map(p => {
    if (currentTime < p.arrivalTime) currentTime = p.arrivalTime;
    
    let start = currentTime;
    currentTime += p.burstTime;
    let end = currentTime;
    
    timeline.push({ id: p._id, start, end });
    
    let turnaroundTime = end - p.arrivalTime;
    let waitingTime = turnaroundTime - p.burstTime;
    
    return { ...p, waitingTime, turnaroundTime, completionTime: end };
  });

  return { timeline, results, metrics: calculateMetrics(results) };
};

// 2. Shortest Job First (SJF) - Non-Preemptive
exports.sjf = (incidents) => {
  let processes = [...incidents].map(p => ({...p}));
  let timeline = [];
  let currentTime = 0;
  let completedCount = 0;
  let n = processes.length;
  
  while (completedCount < n) {
    let available = processes.filter(p => p.arrivalTime <= currentTime && p.completionTime === undefined);
    
    if (available.length > 0) {
      available.sort((a, b) => a.burstTime - b.burstTime);
      let selected = available[0];
      
      let start = currentTime;
      currentTime += selected.burstTime;
      let end = currentTime;
      
      timeline.push({ id: selected._id, start, end });
      
      selected.completionTime = end;
      selected.turnaroundTime = end - selected.arrivalTime;
      selected.waitingTime = selected.turnaroundTime - selected.burstTime;
      completedCount++;
    } else {
      currentTime++;
    }
  }
  
  return { timeline, results: processes, metrics: calculateMetrics(processes) };
};

// 3. Priority Scheduling - Non-Preemptive
exports.priorityScheduling = (incidents) => {
  let processes = [...incidents].map(p => ({...p}));
  let timeline = [];
  let currentTime = 0;
  let completedCount = 0;
  let n = processes.length;
  
  while (completedCount < n) {
    let available = processes.filter(p => p.arrivalTime <= currentTime && p.completionTime === undefined);
    
    if (available.length > 0) {
      // Lower number = higher priority
      available.sort((a, b) => a.priority - b.priority);
      let selected = available[0];
      
      let start = currentTime;
      currentTime += selected.burstTime;
      let end = currentTime;
      
      timeline.push({ id: selected._id, start, end });
      
      selected.completionTime = end;
      selected.turnaroundTime = end - selected.arrivalTime;
      selected.waitingTime = selected.turnaroundTime - selected.burstTime;
      completedCount++;
    } else {
      currentTime++;
    }
  }
  
  return { timeline, results: processes, metrics: calculateMetrics(processes) };
};

// 4. Round Robin
exports.roundRobin = (incidents, timeQuantum = 2) => {
  let processes = [...incidents].map(p => ({...p, remainingTime: p.burstTime})).sort((a, b) => a.arrivalTime - b.arrivalTime);
  let timeline = [];
  let currentTime = 0;
  let queue = [];
  let n = processes.length;
  let completedCount = 0;
  
  if (n === 0) return { timeline: [], results: [], metrics: calculateMetrics([]) };
  
  let pIdx = 0;
  
  // Initialize queue with processes that arrive at t=0
  while (pIdx < n && processes[pIdx].arrivalTime <= currentTime) {
    queue.push(processes[pIdx]);
    pIdx++;
  }
  
  if (queue.length === 0) {
    currentTime = processes[0].arrivalTime;
    queue.push(processes[pIdx]);
    pIdx++;
  }
  
  while (completedCount < n) {
    if (queue.length === 0) {
      currentTime = processes[pIdx].arrivalTime;
      while (pIdx < n && processes[pIdx].arrivalTime <= currentTime) {
        queue.push(processes[pIdx]);
        pIdx++;
      }
    }
    
    let currentProcess = queue.shift();
    let start = currentTime;
    
    let executeTime = Math.min(currentProcess.remainingTime, timeQuantum);
    currentProcess.remainingTime -= executeTime;
    currentTime += executeTime;
    
    timeline.push({ id: currentProcess._id, start, end: currentTime });
    
    // Check if new processes arrived during execution
    while (pIdx < n && processes[pIdx].arrivalTime <= currentTime) {
      queue.push(processes[pIdx]);
      pIdx++;
    }
    
    if (currentProcess.remainingTime > 0) {
      queue.push(currentProcess);
    } else {
      currentProcess.completionTime = currentTime;
      currentProcess.turnaroundTime = currentProcess.completionTime - currentProcess.arrivalTime;
      currentProcess.waitingTime = currentProcess.turnaroundTime - currentProcess.burstTime;
      completedCount++;
    }
  }
  
  // Merge consecutive timeline blocks for same process
  let mergedTimeline = [];
  if (timeline.length > 0) {
    let currentBlock = timeline[0];
    for (let i = 1; i < timeline.length; i++) {
      if (timeline[i].id === currentBlock.id) {
        currentBlock.end = timeline[i].end;
      } else {
        mergedTimeline.push(currentBlock);
        currentBlock = timeline[i];
      }
    }
    mergedTimeline.push(currentBlock);
  }
  
  return { timeline: mergedTimeline, results: processes, metrics: calculateMetrics(processes) };
};

function getInitialQueueLevel(priority) {
  if (priority <= 1) return 0;
  if (priority <= 3) return 1;
  return 2;
}

function mlfq(incidents, options = {}) {
  const agingThreshold = options.agingThreshold ?? 10;
  const processes = [...incidents]
    .map((p) => ({
      ...p,
      remainingTime: p.burstTime,
      queueLevel: getInitialQueueLevel(p.priority),
      lastEnqueuedTime: p.arrivalTime,
      completed: false,
      completionTime: undefined,
      turnaroundTime: undefined,
      waitingTime: undefined,
    }))
    .sort((a, b) => a.arrivalTime - b.arrivalTime);

  const queues = [[], [], []];
  const timeline = [];
  let currentTime = processes.length ? processes[0].arrivalTime : 0;
  let completedCount = 0;

  function enqueueArrivals() {
    processes
      .filter((p) => p.arrivalTime <= currentTime && !p.completed && !queues.flat().includes(p))
      .sort((a, b) => a.arrivalTime - b.arrivalTime)
      .forEach((process) => {
        queues[process.queueLevel].push(process);
        process.lastEnqueuedTime = currentTime;
      });
  }

  enqueueArrivals();

  while (completedCount < processes.length) {
    if (queues.every((queue) => queue.length === 0)) {
      const nextArrival = processes.find((p) => !p.completed && !queues.flat().includes(p));
      if (!nextArrival) break;
      currentTime = Math.max(currentTime, nextArrival.arrivalTime);
      enqueueArrivals();
      continue;
    }

    const queueIndex = queues.findIndex((queue) => queue.length > 0);
    const currentProcess = queues[queueIndex].shift();
    const quantum = queueIndex === 0 ? 2 : queueIndex === 1 ? 5 : Infinity;
    const executionTime = Math.min(currentProcess.remainingTime, quantum);

    timeline.push({
      id: currentProcess._id,
      start: currentTime,
      end: currentTime + executionTime,
      queueLevel: queueIndex,
      executedTime: executionTime,
    });

    currentProcess.remainingTime -= executionTime;
    currentTime += executionTime;
    enqueueArrivals();

    if (currentProcess.remainingTime <= 0) {
      currentProcess.completed = true;
      currentProcess.completionTime = currentTime;
      currentProcess.turnaroundTime = currentProcess.completionTime - currentProcess.arrivalTime;
      currentProcess.waitingTime = currentProcess.turnaroundTime - currentProcess.burstTime;
      completedCount += 1;
    } else {
      if (executionTime === quantum && queueIndex < 2) {
        currentProcess.queueLevel += 1;
      }
      currentProcess.lastEnqueuedTime = currentTime;
      queues[currentProcess.queueLevel].push(currentProcess);
    }

    queues.forEach((queue, idx) => {
      queue.slice().forEach((process) => {
        if (idx > 0 && currentTime - process.lastEnqueuedTime >= agingThreshold) {
          const promoted = queue.splice(queue.indexOf(process), 1)[0];
          promoted.queueLevel = idx - 1;
          promoted.lastEnqueuedTime = currentTime;
          queues[promoted.queueLevel].push(promoted);
        }
      });
    });
  }

  return {
    algorithm: 'Multi-Level Feedback Queue',
    timeline,
    results: processes.map((process) => ({
      _id: process._id,
      arrivalTime: process.arrivalTime,
      burstTime: process.burstTime,
      priority: process.priority,
      completionTime: process.completionTime,
      turnaroundTime: process.turnaroundTime,
      waitingTime: process.waitingTime,
    })),
    metrics: calculateMetrics(processes),
  };
}

exports.mlfq = mlfq;

exports.dispatch = ({ incidents, algorithm, timeQuantum, options }) => {
  switch ((algorithm || '').toLowerCase()) {
    case 'fcfs':
      return exports.fcfs(incidents);
    case 'sjf':
      return exports.sjf(incidents);
    case 'priority':
      return exports.priorityScheduling(incidents);
    case 'rr':
    case 'roundrobin':
      return exports.roundRobin(incidents, timeQuantum);
    case 'mlfq':
      return exports.mlfq(incidents, options);
    default:
      throw new Error(`Unsupported scheduling algorithm: ${algorithm}`);
  }
};
