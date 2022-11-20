import { effect } from '../runtime';
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
  return isFunction(fn) ? (unwrapDeep as any)(fn()) : fn;
}

export type DeepReturnType<T> = T extends () => any
  ? ReturnType<T> extends () => any
    ? DeepReturnType<ReturnType<T>>
    : ReturnType<T>
  : T;

/**
 * Observes the given `value`. This utility is useful when a side effect needs to run on both
 * the client and server.
 *
 * - If the given `value` is a function/observable it will be run in an effect and observed. The
 * observed value will be passed to the given `callback`.
 * - If the given `value` is _not_ a function/observable, it'll simply be passed to the given
 * `callback`.
 * - In a server environment the given `value` will be unwrapped if needed but no effect will be
 * created.
 */
export function observe<T>(value: T, onUpdate: (value: T) => void) {
  if (__SERVER__) {
    onUpdate(isFunction(value) ? value() : value);
    return;
  }

  if (isFunction(value)) {
    effect(() => onUpdate(value()));
  } else {
    onUpdate(value);
  }
}
