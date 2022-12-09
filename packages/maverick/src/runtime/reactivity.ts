import { effect as $effect, scope } from '@maverick-js/signals';

import { noop } from '../std/unit';

/**
 * Invokes the given function each time any of the signals that are read inside are updated
 * (i.e., their value changes). The effect is immediately invoked on initialization.
 *
 * @see {@link https://github.com/maverick-js/signals#effect}
 */
export const effect = (__SERVER__ ? noop : $effect) as typeof $effect;

/**
 * Creates a runner that executes functions in the current lexical scope.
 */
export function createScopedRunner() {
  let currentFn: (() => any) | undefined,
    run = scope(() => currentFn?.());
  return function runWithScope<T>(fn: () => T) {
    currentFn = fn;
    const result = run();
    currentFn = undefined;
    return result;
  };
}

export * from '@maverick-js/signals';
export * from './store';
