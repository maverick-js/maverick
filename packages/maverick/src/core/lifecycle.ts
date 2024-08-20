import type { DOMEvent } from '@maverick-js/std';

import { currentInstance } from './instance';

export interface SetupCallback {
  (): void;
}

export interface DestroyCallback {
  (): void;
}

export interface HostElementCallback {
  (host: HTMLElement): any;
}

export interface LifecycleHooks {
  onSetup?: SetupCallback;
  onAttach?: HostElementCallback;
  onConnect?: HostElementCallback;
  onDestroy?: DestroyCallback;
}

export interface LifecycleEvents {
  /** Fired when the component attaches to a host element. */
  attach: DOMEvent<void>;
  /** Fired when the component detaches from a host element. */
  detach: DOMEvent<void>;
  /** Fired when the host element connects to the DOM. */
  connect: DOMEvent<void>;
  /** Fired when the host element disconnects from the DOM. */
  disconnect: DOMEvent<void>;
  /** Fired when the component instance is destroyed. */
  destroy: DOMEvent<void>;
}

/**
 * The given callback is invoked when the component is ready to be set up.
 *
 * - This hook will run once.
 * - It's safe to use context inside this hook.
 * - The host element has not attached yet - wait for `onAttach`.
 */
export function onSetup(callback: SetupCallback) {
  currentInstance?.addHooks({ onSetup: callback });
}

/**
 * The given callback is invoked when the component instance has attached to a host element.
 *
 * - This hook can run more than once as the component attaches/detaches from a host element.
 * - This hook may be called while the host element is not connected to the DOM yet.
 */
export function onAttach(callback: HostElementCallback) {
  currentInstance?.addHooks({ onAttach: callback });
}

/**
 * The given callback is invoked when the host element has connected to the DOM.
 *
 * - This hook can run more than once as the host disconnects and re-connects to the DOM.
 */
export function onConnect(callback: HostElementCallback) {
  currentInstance?.addHooks({ onConnect: callback });
}

/**
 * The given callback is invoked when the component is destroyed.
 *
 * - This hook will only run once when the component is finally destroyed.
 * - This hook may be called before being attached to a host element.
 * - This hook is called both client-side and server-side.
 */
export function onDestroy(callback: DestroyCallback) {
  currentInstance?.addHooks({ onDestroy: callback });
}
