import { effect as $effect } from '@maverick-js/signals';

import { noop } from '../std/unit';

/**
 * Invokes the given function each time any of the signals that are read inside are updated
 * (i.e., their value changes). The effect is immediately invoked on initialization.
 *
 * @see {@link https://github.com/maverick-js/signals#effect}
 */
export const effect = (__SERVER__ ? noop : $effect) as typeof $effect;

export * from '@maverick-js/signals';
export * from './store';
