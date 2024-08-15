import type { AnyRecord, ReadSignalRecord, State } from '../../core';
import { useReactContext } from '../scope';

export function useStateContext<Record extends AnyRecord>(
  state: State<Record>,
): ReadSignalRecord<Record> {
  return useReactContext(state) as ReadSignalRecord<Record>;
}
