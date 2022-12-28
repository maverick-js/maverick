import { isFunction } from './unit';

/**
 * Unwraps possible function calls and returns the value. It will return the value if the given
 * argument is not a function.
 */
export function unwrap<T>(fn: T): T extends () => any ? ReturnType<T> : T {
  return isFunction(fn) ? fn() : fn;
}

/**
 * Recursively unwraps possible function calls and returns the final value. It will return
 * the value if the given argument is not a function.
 */
export function unwrapDeep<T>(fn: T): DeepReturnType<T> {
  let value: any = fn;
  while (typeof value === 'function') value = value();
  return value;
}

export type DeepReturnType<T> = T extends () => any
  ? ReturnType<T> extends () => any
    ? DeepReturnType<ReturnType<T>>
    : ReturnType<T>
  : T;
