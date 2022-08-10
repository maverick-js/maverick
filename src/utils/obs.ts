import { isFunction } from './unit';

export function unwrap<T>(fn: T): T extends () => void ? ReturnType<T> : T {
  return isFunction(fn) ? fn() : fn;
}

export function unwrapDeep(fn) {
  return isFunction(fn) ? unwrapDeep(fn()) : fn;
}
