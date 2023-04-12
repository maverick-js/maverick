import { signal, type WriteSignal } from '@maverick-js/signals';

import type { AnyRecord } from './types';

export interface Store<Record extends AnyRecord> {
  initial: Record;
  create(): Record;
  reset(record: Record, filter?: (key: keyof Record) => boolean): void;
}

/**
 * Converts an object into a store. A store stores the initial object and enables producing new
 * objects where each value in the provided object becomes a signal with respective getters
 * and setters for convenient access.
 *
 * @example
 * ```ts
 * const store = createStore({
 *   foo: 0,
 *   bar: '...',
 *   get baz() {
 *     return this.foo + 1;
 *   }
 * });
 *
 * console.log(store.initial); // logs `{ foo: 0, bar: '...' }`
 *
 * const record = store.create();
 * effect(() => console.log(record.foo));
 * // Run effect ^
 * record.foo = 1;
 *
 * // Reset all values
 * store.reset(record);
 * ```
 */
export function createStore<Record extends AnyRecord>(initial: Record): Store<Record> {
  const descriptors = Object.getOwnPropertyDescriptors(initial);
  return {
    initial,
    create: () => {
      const store = {} as Record;

      for (const name of Object.keys(initial)) {
        const $value = descriptors[name].get || signal(initial[name]);
        Object.defineProperty(store, name, {
          configurable: true,
          enumerable: true,
          get: $value,
          set: ($value as WriteSignal<any>).set,
        });
      }

      return store;
    },
    reset: (record, filter) => {
      for (const name of Object.keys(record)) {
        if (!descriptors[name].get && (!filter || filter(name))) {
          record[name as keyof Record] = initial[name];
        }
      }
    },
  };
}
