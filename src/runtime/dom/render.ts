import { root as $root, type Dispose } from '../reactivity';
import type { JSX } from '../jsx';
import { createMarkerWalker, type MarkerWalker } from './markers';
import { insert } from './utils';

export let hydration: HydrationContext | null = null;

export type HydrationContext = {
  w: MarkerWalker;
};

export { type MarkerWalker };

export type HydrateOptions = RenderOptions & {
  resume?: boolean;
};

export function hydrate(root: () => JSX.Element, options: HydrateOptions): Dispose {
  const prev = hydration;
  hydration = options.resume && hydration ? hydration : { w: createMarkerWalker(options.target) };
  const dispose = render(root, options);
  hydration = prev;
  return dispose;
}

export type RenderOptions = {
  target: Node;
  before?: Node;
};

export function render(root: () => JSX.Element, options: RenderOptions): Dispose {
  const { target, before } = options;
  return $root((dispose) => {
    if (!hydration) {
      insert(target, root(), before);
    } else {
      root();
    }
    return dispose;
  });
}
