import type { WriteSignal } from '@maverick-js/signals';

import type { ReadSignals, SignalAccessors } from './types';

export function createAccessors<Record extends ReadSignals>(
  record: Record,
): SignalAccessors<Record> {
  const accessors = {} as SignalAccessors<Record>;

  for (const name of Object.keys(record)) {
    Object.defineProperty(accessors, name, {
      enumerable: true,
      get: record[name],
      set: (record[name] as WriteSignal<unknown>).set,
    });
  }

  return accessors;
}
