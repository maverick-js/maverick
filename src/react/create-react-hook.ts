import * as React from 'react';

import {
  effect,
  getScheduler,
  isSubject,
  type Observable,
  type ObservableSubject,
  root,
  setContextMap,
} from '../runtime';
import { ReactContextMap } from './use-react-context';

const scheduler = getScheduler();

/**
 * Creates a React hook given an observable. Readonly or computed observables will only return
 * the current value. Writable observables will return a tuple `[value, setValue]`.
 *
 * @example
 * ```ts
 * const $value = observable(0);
 *
 * function Component() {
 *   const [value, setValue] = createReactHook($value);
 *   // ...
 * }
 * ```
 */
export function createReactHook<T extends Observable<any>>(
  observable: T,
): T extends ObservableSubject<infer U>
  ? [value: U, setValue: (value: U) => void]
  : T extends Observable<infer V>
  ? V extends ObservableSubject<infer X>
    ? X
    : V
  : never {
  const [state, setState] = React.useState<T>();
  const context = React.useContext(ReactContextMap);
  const disposal = React.useRef<() => void>();

  React.useMemo(() => {
    root((dispose) => {
      if (context) setContextMap(context);

      effect(() => {
        setState(observable());
      });

      disposal.current = dispose;
    });
  }, []);

  React.useEffect(() => () => disposal.current?.(), []);

  return (
    isSubject(observable)
      ? [
          state,
          (value) => {
            observable.set(value);
            scheduler.flushSync();
          },
        ]
      : state
  ) as any;
}
