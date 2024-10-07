import { unwrapDeep } from '@maverick-js/std';
import { root as createRoot, type Dispose, type JSX } from 'maverick.js';

import { insert } from './insert';
import { createMarkerWalker, type MarkerWalker } from './walker';

export let hydration: HydrationContext | null = null;

export type HydrationContext = {
  w: MarkerWalker;
};

export { type MarkerWalker };

export interface HydrateOptions extends RenderOptions {}

export interface Hydrator {
  (root: () => JSX.Element, options: HydrateOptions): Dispose;
}

export function hydrate(root: () => JSX.Element, options: HydrateOptions) {
  return runHydration(() => render(root, options), options);
}

export function runHydration<T>(run: () => T, options: HydrateOptions): T {
  const prev = hydration;
  try {
    hydration = { w: createMarkerWalker(options.target) };
    return run();
  } finally {
    hydration = prev;
  }
}

export interface RenderOptions {
  target: Node;
  before?: Node | null;
}

export interface Renderer {
  (root: () => JSX.Element, options: RenderOptions): Dispose;
}

export function render(root: () => JSX.Element, options: RenderOptions): Dispose {
  return createRoot((dispose) => {
    if (!hydration) {
      insert(options.target, root(), options.before);
    } else {
      unwrapDeep(root);
    }

    return dispose;
  });
}
