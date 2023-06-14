import { onDispose } from '../core/signals';

export interface DisposalBin {
  add(...callbacks: (() => any)[]): void;
  empty(): void;
}

/**
 * Creates and returns a disposal bin for managing cleanup operations.
 *
 * @example
 * ```ts
 * const bin = createDisposalBin();
 * // Add callbacks
 * bin.add(() => {});
 * bin.add(() => {});
 * // Empty bin by running callbacks
 * bin.empty();
 * ```
 */
export function createDisposalBin(): DisposalBin {
  const disposal = new Set<() => unknown>();
  return {
    add(...callbacks) {
      for (const callback of callbacks) disposal.add(callback);
    },
    empty() {
      for (const callback of disposal) callback();
      disposal.clear();
    },
  };
}

/**
 * Creates and return a `DisposalBin`. This bin is emptied if the parent scope is disposed of.
 */
export function useDisposalBin() {
  const disposal = createDisposalBin();
  onDispose(disposal.empty);
  return disposal;
}
