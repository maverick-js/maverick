import { effect as $effect, type Effect, scope, type StopEffect } from '@maverick-js/observables';

import { noop } from '../std/unit';

/**
 * Invokes the given function each time any of the observables that are read inside are updated
 * (i.e., their value changes). The effect is immediately invoked on initialization.
 *
 * @see {@link https://github.com/maverick-js/observables#effect}
 */
export function effect(fn: Effect, opts?: { id?: string }): StopEffect {
  if (__SERVER__) return noop;
  return $effect(fn, opts);
}

/**
 * Creates a runner that executes functions in the current lexical scope.
 */
export function createScopedRunner() {
  let currentFn: (() => any) | undefined;
  const run = scope(() => currentFn?.());
  return <T>(fn: () => T) => {
    currentFn = fn;
    const result = run();
    currentFn = undefined;
    return result;
  };
}

export * from '@maverick-js/observables';
export * from './store';
