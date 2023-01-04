import { unwrap } from '../../std/signal';
import { isFunction } from '../../std/unit';
import type { JSX } from '../jsx';
import { computed, onError, peek, type ReadSignal, signal } from '../reactivity';

export type ErrorSignal<T = unknown> = ReadSignal<T | null> & { handled(): void };
export type ErrorBoundaryHandler<T = unknown> = (error: ErrorSignal<T>) => JSX.Element;

/**
 * Catches errors that are thrown inside a child component and enables you to handle them
 * declaratively.
 *
 * @example
 * ```jsx
 * <ErrorBoundary>
 *   {($error) => (
 *     <div $on:click={$error.handled}>
 *       {$error()
 *         ? `Something went wrong: ${$error().toString()}`
 *         : 'No error.'}
 *     </div>
 *   )}
 * </ErrorBoundary>
 * ```
 * @example
 * ```jsx
 * <ErrorBoundary onError={(error, handled) => console.error(error)}>
 *  <Component />
 * </ErrorBoundary>
 * ```
 */
export function ErrorBoundary(props: {
  onError?: (error: unknown, handled: () => void) => void;
  $children: JSX.Element | ErrorBoundaryHandler;
}): ReadSignal<JSX.Element> {
  const $e = signal<unknown>(null);

  const $error: ErrorSignal = () => $e();
  $error.handled = () => $e.set(null);

  return computed(
    () => {
      const $children = unwrap(props.$children) as (() => JSX.Element) | ErrorBoundaryHandler;

      onError((error) => {
        if (__DEV__ && $children.length === 0) console.error(error);
        $e.set(error);
        props.onError?.(error, $error.handled);
      });

      return isFunction($children) && $children.length > 0
        ? peek(() => ($children as ErrorBoundaryHandler)($error))
        : ($children as JSX.Element);
    },
    { initial: null, scoped: true },
  );
}
