export function run<T>(fn: () => T): T {
  return fn();
}

export function runAll<Arg = never>(fns: ((arg: Arg) => unknown)[], arg: Arg) {
  for (const fn of fns) fn(arg);
}
