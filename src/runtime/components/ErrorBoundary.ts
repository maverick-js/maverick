import type { JSX } from '../../runtime/jsx';
import { peek, observable, computed, onError, type Observable } from '../reactivity';
import { isFunction } from '../../utils/unit';

export type ObservableError<T = unknown> = Observable<T | null> & { handled(): void };
export type ErrorBoundaryHandler<T = unknown> = (error: ObservableError<T>) => JSX.Element;

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
}): Observable<JSX.Element> {
  const $e = observable<unknown>(null);

  const $error: ObservableError = () => $e();
  $error.handled = () => $e.set(null);

  return computed(() => {
    const $children = props.$children;

    onError((error) => {
      if (__DEV__ && (!isFunction($children) || $children.length === 0)) {
        console.error(error);
      }

      $e.set(error);
      props.onError?.(error, $error.handled);
    });

    return isFunction($children) && $children.length > 0
      ? peek(() => ($children as any)($error))
      : $children;
  });
}
