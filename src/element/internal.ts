import { peek } from '@maverick-js/observables';
import { isNull } from '../utils/unit';
import type { ElementLifecycleCallback, ElementLifecycleManager } from './lifecycle';
import type { MaverickElement } from './types';

let _elements: (MaverickElement | null)[] = [null];

export function getHostElement(): MaverickElement | null {
  return _elements[_elements.length - 1];
}

export function setHostElement(element: MaverickElement | null) {
  if (isNull(element)) {
    _elements.pop();
    return;
  }

  _elements.push(element);
}

export const CONNECT = Symbol('CONNECT');
export const MOUNT = Symbol('MOUNT');
export const BEFORE_UPDATE = Symbol('BEFORE_UPDATE');
export const AFTER_UPDATE = Symbol('AFTER_UPDATE');
export const DISCONNECT = Symbol('DISCONNECT');
export const DESTROY = Symbol('DESTROY');

export const LIFECYCLES = [
  CONNECT,
  MOUNT,
  BEFORE_UPDATE,
  AFTER_UPDATE,
  DISCONNECT,
  DESTROY,
] as const;

export function createLifecycleMethod(name: keyof ElementLifecycleManager) {
  return (callback: ElementLifecycleCallback) => {
    if (__NODE__) return;

    const element = getHostElement();

    if (!element) {
      if (__DEV__) throw Error('[maverick] lifecycle hook called outside of element setup');
      return;
    }

    element[name].push(() => peek(callback));
  };
}
