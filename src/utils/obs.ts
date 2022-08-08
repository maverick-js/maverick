import { isFunction } from './unit';

export function unwrap<T>(fn: T): T extends Function ? ReturnType<T> : T {
  return isFunction(fn) ? fn() : fn;
}
