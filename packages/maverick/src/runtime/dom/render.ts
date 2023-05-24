import { unwrapDeep } from '../../std/signal';
import type { JSX } from '../jsx';
import { root as createRoot, type Dispose } from '../reactivity';
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
  return runHydration(root, render, options);
}

export function runHydration(
  root: () => JSX.Element,
  renderer: Renderer,
  options: HydrateOptions,
): Dispose {
  const prev = hydration;
  hydration = { w: createMarkerWalker(options.target) };
  const dispose = renderer(root, options);
  hydration = prev;
  return dispose;
}

export interface RenderOptions {
  target: Node;
  before?: Node;
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
