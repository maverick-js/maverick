import type { PickReadonly, PickWritable } from '@maverick-js/std';

import { useContext } from './context';
import { computed, type ReadSignal, signal, type WriteSignal } from './signals';
import type { AnyRecord, ReadSignalRecord } from './types';

/**
 * Converts objects into signals. The factory stores the initial object and enables producing new
 * objects where each value in the provided object becomes a signal.
 *
 * @example
 * ```ts
 * const factory = new State({
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
export class State<Record> {
  readonly id = Symbol('maverick.state');
  readonly record: Record;

  #descriptors: {
    [P in keyof Record]: TypedPropertyDescriptor<Record[P]>;
  };

  constructor(record: Record) {
    this.record = record;
    this.#descriptors = Object.getOwnPropertyDescriptors(record);
  }

  create(): Store<Record> {
    const store = {} as Store<Record>,
      state = new Proxy(store, { get: (_, prop: any) => store[prop]() });

    for (const name of Object.keys(this.record as AnyRecord) as any[]) {
      const getter = this.#descriptors[name].get;
      store[name] = getter ? computed(getter.bind(state)) : signal(this.record[name]);
    }

    return store;
  }

  reset(store: Store<Record>, filter?: (key: keyof Record) => boolean): void {
    for (const name of Object.keys(store) as any[]) {
      if (!this.#descriptors[name].get && (!filter || filter(name))) {
        (store[name] as WriteSignal<any>).set(this.record[name]);
      }
    }
  }
}

export type Store<T> = {
  readonly [P in keyof PickReadonly<T>]: ReadSignal<T[P]>;
} & {
  readonly [P in keyof PickWritable<T>]: WriteSignal<T[P]>;
};

export type InferStore<T> =
  T extends State<infer Record> ? Store<Record> : T extends Store<any> ? T : never;

export type InferStoreRecord<T> =
  T extends State<infer Record> ? Record : T extends Store<infer Record> ? Record : never;

export type StateContext<T> = ReadSignalRecord<T extends State<infer Record> ? Record : T>;

/**
 * Returns the state record context value for the current component tree.
 */
export function useState<Record extends AnyRecord>(state: State<Record>): StateContext<Record> {
  return useContext(state);
}
