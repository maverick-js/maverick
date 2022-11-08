import {
  AFTER_UPDATE,
  ATTACH,
  BEFORE_UPDATE,
  CONNECT,
  createLifecycleMethod,
  DESTROY,
  DISCONNECT,
  MOUNT,
} from './internal';

export type ElementLifecycleCallback = () => any;

export type ElementLifecycleManager = {
  [ATTACH]: ElementLifecycleCallback[];
  [CONNECT]: ElementLifecycleCallback[];
  [MOUNT]: ElementLifecycleCallback[];
  [BEFORE_UPDATE]: ElementLifecycleCallback[];
  [AFTER_UPDATE]: ElementLifecycleCallback[];
  [DISCONNECT]: ElementLifecycleCallback[];
  [DESTROY]: ElementLifecycleCallback[];
};

/**
 * The given callback is invoked when the component has attached to a host element.
 *
 * - This hook will only run once when the component is attached.
 * - This hook may be called while the host element is not connected to the DOM yet.
 * - This hook is called both client-side and server-side.
 */
export const onAttach = createLifecycleMethod(ATTACH);

/**
 * The given callback is invoked when the component has connected to the DOM. If a function is
 * returned from the invoked callback, it will be run when the component disconnects from the DOM.
 *
 * - This hook can run more than once as the component disconnects and re-connects to the DOM.
 */
export const onConnect = createLifecycleMethod(CONNECT);

/**
 * The given callback is invoked when the component has connected to the DOM and rendered its
 * contents.
 *
 * - This hook will only run once after the first connect.
 */
export const onMount = createLifecycleMethod(MOUNT);

/**
 * The given callback is invoked before each component render except the initial render.
 *
 * - This hook is _not_ called on the first mount.
 * - This hook can run more than once (before each render).
 */
export const onBeforeUpdate = createLifecycleMethod(BEFORE_UPDATE);

/**
 * The given callback is invoked each time _after_ the component has re-rendered except the initial
 * render.
 *
 * - This hook is _not_ called on the first mount.
 * - This hook can run more than once (after each render).
 */
export const onAfterUpdate = createLifecycleMethod(AFTER_UPDATE);

/**
 * The given callback is invoked when the component has disconnected from the DOM.
 *
 * - This hook can run more than once as the component disconnects and re-connects to the DOM.
 */
export const onDisconnect = createLifecycleMethod(DISCONNECT);

/**
 * The given callback is invoked when the component is destroyed either by _not_ re-connecting
 * to the DOM after a animation frame, or when destroyed by the application.
 *
 * - This hook will only run once.
 */
export const onDestroy = createLifecycleMethod(DESTROY);
