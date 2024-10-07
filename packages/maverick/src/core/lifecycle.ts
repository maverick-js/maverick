import type { MaverickEvent } from '@maverick-js/std';

import { $$_current_instance } from './instance';

export const SETUP_SYMBOL = Symbol.for('maverick.setup');
export const ATTACH_SYMBOL = Symbol.for('maverick.attach');
export const CONNECT_SYMBOL = Symbol.for('maverick.connect');
export const DESTROY_SYMBOL = Symbol.for('maverick.destroy');

export const componentLifecycleSymbols = [
  SETUP_SYMBOL,
  ATTACH_SYMBOL,
  CONNECT_SYMBOL,
  DESTROY_SYMBOL,
];

export interface ComponentLifecycleEvents {
  /** Fired when the component attaches to a host element. */
  attach: MaverickEvent<void>;
  /** Fired when the component detaches from a host element. */
  detach: MaverickEvent<void>;
  /** Fired when the host element connects to the DOM. */
  connect: MaverickEvent<void>;
  /** Fired when the host element disconnects from the DOM. */
  disconnect: MaverickEvent<void>;
  /** Fired when the component instance is destroyed. */
  destroy: MaverickEvent<void>;
}

/**
 * The given callback is invoked when the component is ready to be set up.
 *
 * - This hook will run once.
 * - It's safe to use context inside this hook.
 * - The host element has not attached yet - wait for `onAttach`.
 */
export function onSetup(callback: SetupCallback) {
  $$_current_instance![SETUP_SYMBOL].push(callback);
}

export interface SetupCallback {
  (): void;
}

/**
 * The given callback is invoked when the component instance has attached to a host element.
 *
 * - This hook can run more than once as the component attaches/detaches from a host element.
 * - This hook may be called while the host element is not connected to the DOM yet.
 */
export function onAttach(callback: AttachCallback) {
  $$_current_instance![ATTACH_SYMBOL].push(callback);
}

export interface AttachCallback extends HostElementCallback {}

export interface HostElementCallback {
  (host: HTMLElement): any;
}

/**
 * The given callback is invoked when the host element has connected to the DOM.
 *
 * - This hook can run more than once as the host disconnects and re-connects to the DOM.
 */
export function onConnect(callback: ConnectCallback) {
  $$_current_instance![CONNECT_SYMBOL].push(callback);
}

export interface ConnectCallback extends HostElementCallback {}

/**
 * The given callback is invoked when the component is destroyed.
 *
 * - This hook will only run once when the component is finally destroyed.
 * - This hook may be called before being attached to a host element.
 * - This hook is called both client-side and server-side.
 */
export function onDestroy(callback: DestroyCallback) {
  $$_current_instance![DESTROY_SYMBOL].push(callback);
}

export interface DestroyCallback {
  (el: HTMLElement | null): void;
}
