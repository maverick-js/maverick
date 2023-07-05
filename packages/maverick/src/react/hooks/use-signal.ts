import { effect, type ReadSignal } from '@maverick-js/signals';
import * as React from 'react';

export function useSignal<T>(signal: ReadSignal<T>): T {
  const [, scheduleReactUpdate] = React.useState<{}>(),
    value = React.useRef() as unknown as React.MutableRefObject<T>;

  if (value.current == null) {
    value.current = signal();
  }

  React.useEffect(() => {
    return effect(() => {
      const newValue = signal();
      if (value.current !== newValue) {
        value.current = newValue;
        scheduleReactUpdate({});
      }
    });
  }, [signal]);

  return value.current;
}
