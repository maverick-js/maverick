import type { CustomElementInstance } from './types';

let _instances: (CustomElementInstance | null)[] = [null];

/** @internal */
export function getCustomElementInstance(): CustomElementInstance | null {
  return _instances[_instances.length - 1];
}

export function setCustomElementInstance(host: CustomElementInstance | null) {
  if (!host) {
    _instances.pop();
    return;
  }

  _instances.push(host);
}

// Host
export { SCOPE } from '@maverick-js/signals';
export const HOST = /* #__PURE__ */ Symbol(__DEV__ ? 'HOST' : 0);
export const PROPS = /* #__PURE__ */ Symbol(__DEV__ ? 'PROPS' : 0);
export const MEMBERS = /* #__PURE__ */ Symbol(__DEV__ ? 'MEMBERS' : 0);
export const RENDER = /* #__PURE__ */ Symbol(__DEV__ ? 'RENDER' : 0);

// Lifecycle
export const ATTACH = /* #__PURE__ */ Symbol(__DEV__ ? 'ATTACH' : 0);
export const CONNECT = /* #__PURE__ */ Symbol(__DEV__ ? 'CONNECT' : 0);
export const MOUNT = /* #__PURE__ */ Symbol(__DEV__ ? 'MOUNT' : 0);
export const DESTROY = /* #__PURE__ */ Symbol(__DEV__ ? 'DESTROY' : 0);
export const MOUNTED = /* #__PURE__ */ Symbol(__DEV__ ? 'MOUNTED' : 0);

export const LIFECYCLES = /* #__PURE__ */ [ATTACH, CONNECT, MOUNT, DESTROY] as const;
