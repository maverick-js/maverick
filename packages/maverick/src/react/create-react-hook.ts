import * as React from 'react';

import {
  effect,
  isWriteSignal,
  provideContextMap,
  type ReadSignal,
  root,
  tick,
  type WriteSignal,
} from '../runtime';
import { ReactContextMap } from './use-react-context';

/**
 * Creates a React hook given a signal. Read only or computed signals will only return the current
 * value. Write signals will return a tuple `[value, setValue]`.
 *
 * @example
 * ```ts
 * const $value = signal(0);
 *
 * function Component() {
 *   const [value, setValue] = createReactHook($value);
 *   // ...
 * }
 * ```
 */
export function createReactHook<T extends ReadSignal<any>>(
  signal: T,
): T extends WriteSignal<infer U>
  ? [value: U, setValue: (value: U) => void]
  : T extends ReadSignal<infer V>
  ? V extends WriteSignal<infer X>
    ? X
    : V
  : never {
  const [state, setState] = React.useState<T>();
  const context = React.useContext(ReactContextMap);
  const disposal = React.useRef<() => void>();

  React.useMemo(() => {
    root((dispose) => {
      if (context) provideContextMap(context);

      effect(() => {
        setState(signal());
      });

      disposal.current = dispose;
    });
  }, []);

  React.useEffect(() => () => disposal.current?.(), []);

  return (
    isWriteSignal(signal)
      ? [
          state,
          (value) => {
            signal.set(value);
            tick();
          },
        ]
      : state
  ) as any;
}
