import { isFunction, isString } from '@maverick-js/std';
import {
  computed,
  effect,
  getSlots,
  type JSX,
  onDispose,
  type PortalProps,
  type PortalTarget,
} from 'maverick.js';

import { insert } from '../insert';

export function Portal({ to }: PortalProps) {
  const slots = getSlots();
  if (isFunction(to)) {
    const target = computed(() => getTarget(to()));
    effect(() => portal(target(), slots.default?.()));
  } else {
    portal(getTarget(to), slots.default?.());
  }
}

function getTarget(target: PortalTarget) {
  return isString(target) ? document.querySelector(target) : target;
}

function portal(target: Node | null, children: JSX.Element) {
  if (!target) return;

  const root = document.createElement('div');
  root.style.display = 'contents';
  root.setAttribute('data-portal', '');
  insert(root, children, null);

  target.appendChild(root);
  onDispose(() => void target.removeChild(root));
}
