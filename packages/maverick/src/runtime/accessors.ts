import type { WriteSignal } from '@maverick-js/signals';

import type { ReadSignalRecord, SignalAccessorRecord } from './types';

export function createAccessors<Record extends ReadSignalRecord>(
  record: Record,
): SignalAccessorRecord<Record> {
  const accessors = {} as SignalAccessorRecord<Record>;

  for (const name of Object.keys(record)) {
    Object.defineProperty(accessors, name, {
      configurable: true,
      enumerable: true,
      get: record[name],
      set: (record[name] as WriteSignal<unknown>).set,
    });
  }

  return accessors;
}
