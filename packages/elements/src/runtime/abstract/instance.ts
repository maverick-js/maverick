import { ComponentLifecycleHook } from './types';

let _component: InternalInstance | null = null;

export function getCurrentInstance(): InternalInstance | null {
  return _component;
}

export function setCurrentInstance(instance: InternalInstance | null) {
  _component = instance;
}

export type InternalInstance = InternalLifecycleHooks;

export type InternalLifecycleHooks = {
  $c: ComponentLifecycleHook[]; // connect
  $bu: ComponentLifecycleHook[]; // before update
  $au: ComponentLifecycleHook[]; // after update
  $m: ComponentLifecycleHook[]; // mounted
  $d: ComponentLifecycleHook[]; // disconnect
  $dy: ComponentLifecycleHook[]; // destroy
};
