import { scope } from '@maverick-js/observables';

import { isNull } from '../std/unit';
import type { ElementLifecycleCallback, ElementLifecycleManager } from './lifecycle';
import type { AnyElementInstance } from './types';

let _instances: (AnyElementInstance | null)[] = [null],
  _current = 0;

export function getElementInstance(): AnyElementInstance | null {
  return _instances[_current];
}

export function setElementInstance(host: AnyElementInstance | null) {
  if (isNull(host)) {
    _instances.pop();
    _current--;
    return;
  }

  _instances.push(host);
  _current++;
}

// Host
export const HOST = Symbol(__DEV__ ? 'HOST' : undefined);
export const SCOPE = Symbol(__DEV__ ? 'SCOPE' : undefined);
export const PROPS = Symbol(__DEV__ ? 'PROPS' : undefined);
export const MEMBERS = Symbol(__DEV__ ? 'MEMBERS' : undefined);
export const RENDER = Symbol(__DEV__ ? 'RENDER' : undefined);

// Lifecycle
export const ATTACH = Symbol(__DEV__ ? 'ATTACH' : undefined);
export const CONNECT = Symbol(__DEV__ ? 'CONNECT' : undefined);
export const MOUNT = Symbol(__DEV__ ? 'MOUNT' : undefined);
export const BEFORE_UPDATE = Symbol(__DEV__ ? 'BEFORE_UPDATE' : undefined);
export const AFTER_UPDATE = Symbol(__DEV__ ? 'AFTER_UPDATE' : undefined);
export const DISCONNECT = Symbol(__DEV__ ? 'DISCONNECT' : undefined);
export const DESTROY = Symbol(__DEV__ ? 'DESTROY' : undefined);

export const LIFECYCLES = [
  ATTACH,
  CONNECT,
  MOUNT,
  BEFORE_UPDATE,
  AFTER_UPDATE,
  DISCONNECT,
  DESTROY,
] as const;

export function createLifecycleMethod(type: keyof ElementLifecycleManager) {
  return (callback: ElementLifecycleCallback) => {
    if (__SERVER__ && type !== ATTACH) return;

    const instance = getElementInstance();

    if (!instance) {
      if (__DEV__) throw Error('[maverick] lifecycle hook called outside of element setup');
      return;
    }

    instance[type].push(scope(() => callback(instance.host.el!)));
  };
}
