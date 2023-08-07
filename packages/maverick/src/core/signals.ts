import { effect as $effect, type Effect, type StopEffect } from '@maverick-js/signals';

import { noop } from '../std/unit';

export {
  type Callable,
  type Computation,
  type ComputedSignalOptions,
  type Disposable,
  type Dispose,
  type Effect,
  type InferSignalValue,
  type Maybe,
  type MaybeDisposable,
  type MaybeFunction,
  type MaybeSignal,
  type MaybeStopEffect,
  type NextValue,
  type ReadSignal,
  type Scope,
  type SignalOptions,
  type StopEffect,
  type WriteSignal,
  createScope,
  computed,
  getScope,
  isReadSignal,
  isWriteSignal,
  onDispose,
  onError,
  peek,
  readonly,
  root,
  scoped,
  signal,
  tick,
  untrack,
} from '@maverick-js/signals';

/**
 * Invokes the given function each time any of the signals that are read inside are updated
 * (i.e., their value changes). The effect is immediately invoked on initialization.
 *
 * @see {@link https://github.com/maverick-js/signals#effect}
 */
export const effect = (__SERVER__ ? serverEffect : $effect) as typeof $effect;

function serverEffect(effect: Effect, options?: { id?: string }): StopEffect {
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') {
    return $effect(effect, options);
  }

  return noop;
}
