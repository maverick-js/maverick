import { isNull } from '../std/unit';
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
export const HOST = Symbol(__DEV__ ? 'HOST' : 0);
export const PROPS = Symbol(__DEV__ ? 'PROPS' : 0);
export const MEMBERS = Symbol(__DEV__ ? 'MEMBERS' : 0);
export const RENDER = Symbol(__DEV__ ? 'RENDER' : 0);

// Lifecycle
export const ATTACH = Symbol(__DEV__ ? 'ATTACH' : 0);
export const CONNECT = Symbol(__DEV__ ? 'CONNECT' : 0);
export const MOUNT = Symbol(__DEV__ ? 'MOUNT' : 0);
export const BEFORE_UPDATE = Symbol(__DEV__ ? 'BEFORE_UPDATE' : 0);
export const AFTER_UPDATE = Symbol(__DEV__ ? 'AFTER_UPDATE' : 0);
export const DISCONNECT = Symbol(__DEV__ ? 'DISCONNECT' : 0);
export const DESTROY = Symbol(__DEV__ ? 'DESTROY' : 0);

export const LIFECYCLES = [
  ATTACH,
  CONNECT,
  MOUNT,
  BEFORE_UPDATE,
  AFTER_UPDATE,
  DISCONNECT,
  DESTROY,
] as const;
