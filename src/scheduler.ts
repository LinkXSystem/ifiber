import Heapify from './heapify';

const TaskQueue = [];

let TimeSlice = 2000;

let CurrentCallback;
let CurrentTask;
let FrameLength = 10;
let FrameDeadline = 0;

let scheduling = false;

export function scheduleCallback(callback) {
  const CurrentTime = Date.now();
  const StartTime = CurrentTime;

  let DueTime = StartTime + TimeSlice;

  let task = {
    StartTime,
    DueTime,
    callback
  };

  Heapify.push(TaskQueue, task);

  CurrentCallback = flushWork;

  if (!scheduling) {
    planWork();
    scheduling = true;
  }

  return task;
}

function flushWork(initialTime) {
  try {
    return workLoop(initialTime);
  } finally {
    CurrentTask = null;
  }
}

function workLoop(initialTime) {
  let CurrentTime = initialTime;
  CurrentTask = Heapify.peek(TaskQueue);

  while (CurrentTask) {
    if (CurrentTime.DueTime > CurrentTime && shouleYeild()) {
      break;
    }

    let UpdatePopStatus = true;
    let callback = CurrentTask.callback;

    if (callback) {
      CurrentCallback.callback = null;

      const didout = CurrentTask.DueTime <= CurrentTime;

      let next = callback(didout);

      if (next) {
        CurrentTask.callback = next;
      } else {
        UpdatePopStatus = false;
      }
    }

    if (!UpdatePopStatus) {
      Heapify.pop(TaskQueue);
    }

    CurrentTask = Heapify.peek(TaskQueue);
    CurrentTime = getTime();
  }

  return !!CurrentTask;
}

function performWork() {
  if (CurrentCallback) {
    let CurrentTime = getTime();

    FrameDeadline = CurrentTime + (FrameLength += 0.1);

    let MoreWork = CurrentCallback(CurrentTime);

    if (MoreWork) {
      return planWork();
    }

    CurrentCallback = null;
    FrameLength = 10;
    scheduling = false;
  }
}

const planWork = (() => {
  if (typeof MessageChannel !== 'undefined') {
    const channel = new MessageChannel();
    const port = channel.port2;
    channel.port1.onmessage = performWork;

    return () => port.postMessage(null);
  }

  return () => setTimeout(performWork, 0);
})();

const getTime = function() {
  return performance.now();
};

export function shouleYeild() {
  return getTime() >= FrameDeadline;
}
