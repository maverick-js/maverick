import { isNull } from '../std/unit';
import type { AnyCustomElementInstance } from './types';

let _instances: (AnyCustomElementInstance | null)[] = [null],
  _current = 0;

/** @internal */
export function getCustomElementInstance(): AnyCustomElementInstance | null {
  return _instances[_current];
}

export function setCustomElementInstance(host: AnyCustomElementInstance | null) {
  if (isNull(host)) {
    _instances.pop();
    _current--;
    return;
  }

  _instances.push(host);
  _current++;
}

// Host
export const HOST = Symbol(__DEV__ ? 'HOST' : 0);
export const SCOPE = Symbol(__DEV__ ? 'SCOPE' : 0);
export const PROPS = Symbol(__DEV__ ? 'PROPS' : 0);
export const MEMBERS = Symbol(__DEV__ ? 'MEMBERS' : 0);
export const RENDER = Symbol(__DEV__ ? 'RENDER' : 0);

// Lifecycle
export const ATTACH = Symbol(__DEV__ ? 'ATTACH' : 0);
export const CONNECT = Symbol(__DEV__ ? 'CONNECT' : 0);
export const MOUNT = Symbol(__DEV__ ? 'MOUNT' : 0);
export const DESTROY = Symbol(__DEV__ ? 'DESTROY' : 0);

export const LIFECYCLES = [ATTACH, CONNECT, MOUNT, DESTROY] as const;
