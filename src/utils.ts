export function isFunc(func) {
  return typeof func === 'function';
}

export function isArray(arr) {
  return !arr ? [] : arr.pop ? arr : [arr];
}
