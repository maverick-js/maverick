import { type ReadSignal, signal, type WriteSignal } from '@maverick-js/signals';

import type { PickReadonly } from '../std/types';
import type { PickWritable } from '../std/types';
import { useContext } from './context';
import type { AnyRecord, ReadSignalRecord } from './types';

/**
 * Converts objects into stores. A store stores the initial object and enables producing new
 * objects where each value in the provided object becomes a signal.
 *
 * @example
 * ```ts
 * const factory = new StoreFactory({
 *   foo: 0,
 *   bar: '...',
 *   get baz() {
 *     return this.foo + 1;
 *   }
 * });
 *
 * console.log(factory.record); // logs `{ foo: 0, bar: '...' }`
 *
 * const $state = factory.create();
 *
 * effect(() => console.log($state.foo()));
 * // Run effect ^
 * $state.foo.set(1);
 *
 * // Reset all values
 * factory.reset($state);
 * ```
 */
export class StoreFactory<Record extends AnyRecord> {
  readonly id = Symbol(__DEV__ ? 'STORE' : 0);
  readonly record: Record;

  private _descriptors: {
    [P in keyof Record]: TypedPropertyDescriptor<Record[P]>;
  };

  constructor(record: Record) {
    this.record = record;
    this._descriptors = Object.getOwnPropertyDescriptors(record);
  }

  create(): Store<Record> {
    const store = {} as Store<Record>,
      state = new Proxy(store, { get: (_, prop: any) => store[prop]() });

    for (const name of Object.keys(this.record) as any[]) {
      store[name] = this._descriptors[name].get
        ? () => this._descriptors[name].get!.call(state)
        : signal(this.record[name]);
    }

    return store;
  }

  reset(record: Store<Record>, filter?: (key: keyof Record) => boolean): void {
    for (const name of Object.keys(record) as any[]) {
      if (!this._descriptors[name].get && (!filter || filter(name))) {
        (record[name] as WriteSignal<any>).set(this.record[name]);
      }
    }
  }
}

export type Store<T> = {
  readonly [P in keyof PickReadonly<T>]: ReadSignal<T[P]>;
} & {
  readonly [P in keyof PickWritable<T>]: WriteSignal<T[P]>;
};

export type InferStore<T> = T extends StoreFactory<infer Record> ? Store<Record> : never;

export type InferStoreRecord<T> = T extends StoreFactory<infer Record> ? Record : never;

export type StoreContext<T> = ReadSignalRecord<T extends StoreFactory<infer Record> ? Record : T>;

/**
 * Returns the store record context value for the current component tree.
 */
export function useStore<Record extends AnyRecord>(
  store: StoreFactory<Record>,
): StoreContext<Record> {
  return useContext(store);
}
