import {
  root as $root,
  effect as $effect,
  type Dispose,
  type Effect,
  type StopEffect,
} from '@maverick-js/observables';
import { noop } from '../utils/unit';

/**
 * Creates a computation root which is given a `dispose()` function to dispose of all inner
 * computations.
 *
 * @see {@link https://github.com/maverick-js/observables#root}
 */
export function root<T>(fn: (dispose: Dispose) => T): T {
  return $root(fn);
}

/**
 * Invokes the given function each time any of the observables that are read inside are updated
 * (i.e., their value changes). The effect is immediately invoked on initialization.
 *
 * @see {@link https://github.com/maverick-js/observables#effect}
 */
export function effect(fn: Effect, opts?: { id?: string }): StopEffect {
  if (__NODE__) return noop;
  return $effect(fn, opts);
}

export {
  createScheduler,
  type Scheduler,
  type ScheduledTask,
  type StopFlushUpdates,
} from '@maverick-js/scheduler';

export {
  observable,
  computed,
  tick,
  peek,
  readonly,
  dispose,
  onDispose,
  getParent,
  getScheduler,
  computedMap,
  computedKeyedMap,
  isObservable,
  isSubject,
  type Observable,
  type ObservableSubject,
  type ObservableValue,
  type Maybe,
  type MaybeDispose,
  type MaybeFunction,
  type MaybeObservable,
  type MaybeStopEffect,
  type Dispose,
  type Effect,
  type StopEffect,
} from '@maverick-js/observables';
