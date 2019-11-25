import { getHook, scheduleWork } from './reconciler';

let cursor = 0;

function getKey() {
  let key = '$' + cursor;
  cursor++;
  return key;
}

export function resetCursor() {
  cursor = 0;
}

export function useState(initialState) {
  return useReducer(null, initialState);
}

export function useReducer(reducer, initialState) {
  let WIP = getHook();
  let key = getKey();

  function setter(value) {
    value = reducer ? reducer(WIP.state[key], value) : value;
    WIP.state[key] = value;
    scheduleWork(WIP, true);
  }

  if (key in WIP.state) {
    return [WIP.state[key], setter];
  } else {
    WIP.state[key] = initialState;
    return [initialState, setter];
  }
}
