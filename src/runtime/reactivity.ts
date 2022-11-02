import {
  effect as $effect,
  type Effect,
  isSubject,
  type StopEffect,
} from '@maverick-js/observables';

import { noop } from '../utils/unit';
import type { ObservableRecord, ObservableRecordValues } from './types';

/**
 * Invokes the given function each time any of the observables that are read inside are updated
 * (i.e., their value changes). The effect is immediately invoked on initialization.
 *
 * @see {@link https://github.com/maverick-js/observables#effect}
 */
export function effect(fn: Effect, opts?: { id?: string }): StopEffect {
  if (__SERVER__) return noop;
  return $effect(fn, opts);
}

export * from '@maverick-js/observables';

/**
 * Converts an observable record into a new record with respective getters and setters for
 * convenient access.
 *
 * @example
 * ```ts
 * const record = accessors({
 *   foo: observable(0),
 *   bar: observable('1'),
 * });
 *
 * record.foo = 10;
 * console.log(record.foo); // logs 10
 *
 * // Values are still observable.
 * effect(() => console.log(record.foo));
 * ```
 */
export function accessors<T extends ObservableRecord, R>(
  record: T,
  options?: { readonly?: R },
): R extends true ? Readonly<ObservableRecordValues<T>> : ObservableRecordValues<T> {
  const accessors: any = {};

  for (const name of Object.keys(record)) {
    const observable = record[name];
    Object.defineProperty(accessors, name, {
      get: observable,
      set: options?.readonly || !isSubject(observable) ? undefined : observable.set,
      enumerable: true,
    });
  }

  return accessors;
}
