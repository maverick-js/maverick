export function run<T>(fn: () => T): T {
  return fn();
}

export function runAll(fns: (() => unknown)[]) {
  for (const fn of fns) fn();
}
