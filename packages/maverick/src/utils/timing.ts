import { isUndefined, noop } from './unit';

/**
 * Resolves after the given `delay` timeout has passed.
 */
export function waitTimeout(delay: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Requests an animation frame and waits for it to be resolved. This is safe to call server-side,
 * no action will be performed.
 *
 * @param callback - Invoked on the next animation frame.
 */
export function waitAnimationFrame(callback?: FrameRequestCallback): Promise<void> {
  if (__SERVER__) return Promise.resolve();
  return new Promise((resolve) => {
    window.requestAnimationFrame((time) => {
      callback?.(time);
      resolve();
    });
  });
}

export type AnimationFrameThrottled<Fn extends (...args: any) => void> = Fn & {
  cancel: () => void;
  pending: () => boolean;
};

/**
 * Creates a throttled function that only invokes `func` at most once per animation frame. This is
 * a noop server-side.
 *
 * @param func - The function to throttle.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame}
 */
export function animationFrameThrottle<Fn extends (...args: any[]) => void>(
  func: Fn,
): AnimationFrameThrottled<Fn> {
  if (__SERVER__) {
    const raf = noop as AnimationFrameThrottled<Fn>;
    raf.cancel = noop;
    raf.pending = () => false;
    return raf;
  }

  let id: number | undefined;

  const pending = () => !isUndefined(id);

  const cancel = () => {
    if (isUndefined(id)) return;
    window.cancelAnimationFrame(id);
    id = undefined;
  };

  function throttled(this: any, ...args: any[]) {
    if (pending()) return;
    id = window.requestAnimationFrame(() => {
      func.apply(this, args);
      id = undefined;
    });
  }

  throttled.cancel = cancel;
  throttled.pending = pending;

  return throttled as AnimationFrameThrottled<Fn>;
}

const requestIdleCallback = __SERVER__
  ? noop
  : 'requestIdleCallback' in window
  ? window.requestIdleCallback
  : (cb) => window.requestAnimationFrame(cb);

/**
 * Queues and waits for a function to be called during a browser's idle periods. This enables
 * developers to perform background and low priority work on the main event loop, without impacting
 * latency-critical events such as animation and input response. Functions are generally called in
 * first-in-first-out order; however, callbacks which have a `timeout` specified may be called
 * out-of-order if necessary in order to run them before the timeout elapses.
 *
 * - If `requestIdleCallback` is not available, this function will wait for a new animation frame.
 * - This is safe to call server-side, the given `callback` won't be invoked.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback}
 */
export function waitIdlePeriod(
  callback?: (deadline?: IdleDeadline) => void,
  options?: IdleRequestOptions,
): Promise<void> {
  if (__SERVER__) return Promise.resolve();
  return new Promise((resolve) => {
    requestIdleCallback((deadline) => {
      callback?.(deadline);
      resolve();
    }, options);
  });
}
