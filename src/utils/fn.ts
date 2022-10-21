export function onceFn<T>(fn: () => T): () => T {
  let result: T;
  return () => result ?? (result = fn());
}

export function run<T>(fn: () => T): T {
  return fn();
}

export function runAll(fns: (() => unknown)[]) {
  for (const fn of fns) fn();
}
