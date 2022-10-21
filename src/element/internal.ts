import { isNull } from '../utils/unit';
import type { ElementLifecycleHandler, ElementLifecycleManager } from './lifecycle';
import type { MaverickElement } from './types';

let _elements: (MaverickElement | null)[] = [null];

export function getCurrentHostElement(): MaverickElement | null {
  return _elements[_elements.length - 1];
}

export function setCurrentHostElement(element: MaverickElement | null) {
  if (isNull(element)) {
    _elements.pop();
    return;
  }

  _elements.push(element);
}

export const CONNECT = Symbol();
export const MOUNT = Symbol();
export const BEFORE_UPDATE = Symbol();
export const AFTER_UPDATE = Symbol();
export const DISCONNECT = Symbol();
export const DESTROY = Symbol();

export const LIFECYCLES = [
  CONNECT,
  MOUNT,
  BEFORE_UPDATE,
  AFTER_UPDATE,
  DISCONNECT,
  DESTROY,
] as const;

export function createLifecycleMethod(name: keyof ElementLifecycleManager) {
  return (handler: ElementLifecycleHandler) => {
    if (__NODE__) return;

    const element = getCurrentHostElement();

    if (!element) {
      if (__DEV__) throw Error('[maverick] lifecycle hook called outside of element setup');
      return;
    }

    element[name].push(handler);
  };
}
