const scheduler = require('./scheduler');

const SYSCALL_IDS = {
  SCHED_DISPATCH: 'SCHED_DISPATCH',
};

const syscallHandlers = {
  [SYSCALL_IDS.SCHED_DISPATCH]: async ({ incidents, algorithm, timeQuantum, options }) => {
    if (!incidents || !Array.isArray(incidents)) {
      throw new Error('Invalid incidents payload');
    }
    return scheduler.dispatch({ incidents, algorithm, timeQuantum, options });
  },
};

function syscall(callId, params) {
  const handler = syscallHandlers[callId];
  if (!handler) {
    throw new Error(`Unknown syscall: ${callId}`);
  }
  return handler(params);
}

module.exports = {
  SYSCALL_IDS,
  syscall,
};
