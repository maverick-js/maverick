import { signal } from '@maverick-js/signals';

import type { AnyRecord } from './types';

export interface Store<Record extends AnyRecord> {
  initial: Record;
  create: () => Record;
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
 *   bar: '...'
 * });
 *
 * console.log(store.initial); // logs `{ foo: 0, bar: '...' }`
 *
 * const record = store.create();
 * effect(() => console.log(record.foo));
 * // Run effect ^
 * record.foo = 1;
 * ```
 */
export function createStore<Record extends AnyRecord>(initial: Record): Store<Record> {
  return {
    initial,
    create: () => {
      const store = {} as Record;

      for (const name of Object.keys(initial)) {
        const $value = signal(initial[name]);
        Object.defineProperty(store, name, {
          get: $value,
          set: $value.set,
          enumerable: true,
        });
      }

      return store;
    },
  };
}
