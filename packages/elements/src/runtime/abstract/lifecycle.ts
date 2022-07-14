import { getCurrentInstance, type InternalLifecycleHooks } from './instance';

function createLifecycleMethod(name: keyof InternalLifecycleHooks) {
  return (callback: () => void) => {
    const instance = getCurrentInstance();

    if (!instance) {
      if (__DEV__) throw Error('Lifecycle method called outside of component setup.');
      return;
    }

    instance[name].push(callback);
  };
}

/**
 * The given callback is invoked before each component render except the initial render.
 *
 * - This hook is only called client-side.
 * - This hook is _not_ called on the first mount.
 * - This hook can run more than once (before each render).
 */
export const onBeforeUpdate = createLifecycleMethod('$bu');

/**
 * The given callback is invoked when the component has connected to the DOM and rendered it's
 * contents inside the shadow root.
 *
 * - This hook is only called client-side.
 * - This hook will only run once.
 */
export const onMounted = createLifecycleMethod('$m');

/**
 * The given callback is invoked each time _after_ the component has re-rendered (animation frame tick)
 * except the initial render.
 *
 * - This hook is only called client-side.
 * - This hook is _not_ called on the first mount.
 * - This hook can run more than once (after each render).
 */
export const onAfterUpdate = createLifecycleMethod('$au');

/**
 * The given callback is invoked when the component has connected to the DOM. If a function is
 * returned from the invoked callback, it will be run when the component disconnects from the DOM.
 *
 * - This hook is called both client-side and server-side.
 * - This hook can run more than once as the component disconnects and re-connects to the DOM.
 */
export const onConnected = createLifecycleMethod('$c');

/**
 * The given callback is invoked when the component has disconnected from the DOM.
 *
 * - This hook is called both client-side and server-side.
 * - This hook can run more than once as the component disconnects and re-connects to the DOM.
 */
export const onDisconnected = createLifecycleMethod('$d');

/**
 * The given callback is invoked when the component is destroyed either by _not_ re-connecting
 * to the DOM after a animation frame, or when destroyed by the application.
 *
 * - This hook is called both client-side and server-side.
 * - This hook will only run once.
 */
export const onDestroy = createLifecycleMethod('$dy');
