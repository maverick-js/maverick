import { effect as $effect, type Effect, type StopEffect } from '@maverick-js/observables';
import { noop } from '../utils/unit';

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

export * from '@maverick-js/observables';
