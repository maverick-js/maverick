import { ATTACH, CONNECT, DESTROY, getCustomElementInstance, MOUNT } from './internal';

export interface ElementLifecycleCallback {
  (): any;
}

export interface ElementLifecycleManager {
  [ATTACH]: ElementLifecycleCallback[];
  [CONNECT]: ElementLifecycleCallback[];
  [MOUNT]: ElementLifecycleCallback[];
  [DESTROY]: ElementLifecycleCallback[];
}

const createLifecycleMethod = /* #__PURE__ */ (type: keyof ElementLifecycleManager) => {
  return (callback: ElementLifecycleCallback) => {
    if (__SERVER__ && type !== ATTACH) return;

    const instance = getCustomElementInstance();

    if (!instance) {
      if (__DEV__) throw Error('[maverick] lifecycle hook called outside of element setup');
      return;
    }

    instance[type].push(callback);
  };
};

/**
 * The given callback is invoked when the component instance has attached to a host element.
 *
 * - This hook will only run once when the component is attached.
 * - This hook may be called while the host element is not connected to the DOM yet.
 * - This hook is called both client-side and server-side.
 */
export const onAttach = /* #__PURE__ */ createLifecycleMethod(ATTACH);

/**
 * The given callback is invoked when the host element has connected to the DOM.
 *
 * - This hook can run more than once as the host disconnects and re-connects to the DOM.
 * - If a function is returned it will be invoked when the host disconnects from the DOM.
 */
export const onConnect = /* #__PURE__ */ createLifecycleMethod(CONNECT);

/**
 * The given callback is invoked when the host element has connected to the DOM and rendered its
 * contents.
 *
 * - This hook will only run once after the first connect.
 * - If a function is returned it will be called when the instance is destroyed.
 */
export const onMount = /* #__PURE__ */ createLifecycleMethod(MOUNT);
