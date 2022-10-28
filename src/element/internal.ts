import { peek } from '@maverick-js/observables';
import { isNull } from '../utils/unit';
import type { ElementLifecycleCallback, ElementLifecycleManager } from './lifecycle';
import type { MaverickHost } from './types';

let _hosts: (MaverickHost | null)[] = [null];

export const INTERNAL_START = '#internal' as const;
export const INTERNAL_END = `/${INTERNAL_START}` as const;

export function getHost(): MaverickHost | null {
  return _hosts[_hosts.length - 1];
}

export function setHost(host: MaverickHost | null) {
  if (isNull(host)) {
    _hosts.pop();
    return;
  }

  _hosts.push(host);
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

    const host = getHost();

    if (!host) {
      if (__DEV__) throw Error('[maverick] lifecycle hook called outside of element setup');
      return;
    }

    host[name].push(() => peek(callback));
  };
}
