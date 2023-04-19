import type { ComponentInstance } from './instance';

let _instances: (ComponentInstance | null)[] = [null];

/** @internal */
export function getComponentInstance(): ComponentInstance | null {
  return _instances[_instances.length - 1];
}

export function setComponentInstance(host: ComponentInstance | null) {
  if (!host) {
    _instances.pop();
    return;
  }

  _instances.push(host);
}

export const INSTANCE = /* #__PURE__ */ Symbol(__DEV__ ? 'INSTANCE' : 0);
export const CONNECT = /* #__PURE__ */ Symbol(__DEV__ ? 'CONNECT' : 0);
