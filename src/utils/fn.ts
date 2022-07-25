export function onceFn<T>(fn: () => T): () => T {
  let result: T;
  return () => result ?? (result = fn());
}
