import * as React from 'react';

import {
  type AnyRecord,
  effect,
  type ReadSignalRecord,
  signal,
  type WriteSignal,
} from '../../core';
import { isArray } from '../../std';

export function useSignalRecord<T extends AnyRecord>($state: ReadSignalRecord<T>): T {
  const [, scheduleReactUpdate] = React.useState<{}>(),
    tracking = React.useRef(null) as unknown as React.MutableRefObject<{
      state: any;
      $update: WriteSignal<{}>;
      props: Set<keyof T>;
    }>;

  if (tracking.current == null) {
    tracking.current = {
      state: {},
      $update: signal({}),
      props: new Set(),
    };
  }

  React.useEffect(() => {
    let { state, $update, props } = tracking.current;
    return effect(() => {
      for (const prop of props) {
        const value = $state[prop as keyof T]();
        state[prop] = isArray(value) ? [...value] : value;
      }

      $update();
      scheduleReactUpdate({});
    });
  }, [$state]);

  return React.useMemo(() => {
    let { state, $update, props } = tracking.current,
      scheduledUpdate = false;

    props.clear();

    return new Proxy(state, {
      get(_, prop: keyof T & string) {
        if (!props.has(prop) && prop in $state) {
          props.add(prop);

          const value = $state[prop as keyof T]();
          state[prop] = isArray(value) ? [...value] : value;

          if (!scheduledUpdate) {
            $update.set({});
            scheduledUpdate = true;
            queueMicrotask(() => (scheduledUpdate = false));
          }
        }

        return state[prop];
      },
      set(_, prop, newValue) {
        if (!(prop in $state)) state[prop] = newValue;
        return true;
      },
    }) as T;
  }, [$state]);
}
