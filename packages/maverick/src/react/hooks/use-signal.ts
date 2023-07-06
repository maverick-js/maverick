import { effect, type ReadSignal } from '@maverick-js/signals';
import * as React from 'react';

export function useSignal<T>(signal: ReadSignal<T>): T {
  const [, scheduleReactUpdate] = React.useState<{}>();

  React.useEffect(() => {
    return effect(() => {
      signal();
      scheduleReactUpdate({});
    });
  }, [signal]);

  return signal();
}
