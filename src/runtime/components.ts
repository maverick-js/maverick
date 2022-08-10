import type { JSX } from '../runtime/jsx';
import {
  peek,
  observable,
  computed,
  computedMap,
  computedKeyedMap,
  onError,
  type Maybe,
  type Observable,
} from './reactivity';
import { unwrap } from '../utils/obs';
import { isFunction } from '../utils/unit';

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
  children: JSX.Element | ErrorBoundaryHandler;
  onError?: (error: unknown, handled: () => void) => void;
}): Observable<JSX.Element> {
  const $e = observable<unknown>(null);

  const $error: ObservableError = () => $e();
  $error.handled = () => $e.set(null);

  return computed(() => {
    const children = props.children;

    onError((error) => {
      if (__DEV__ && (!isFunction(children) || children.length === 0)) {
        console.error(error);
      }

      $e.set(error);
      props.onError?.(error, $error.handled);
    });

    return isFunction(children) && children.length > 0
      ? peek(() => (children as any)($error))
      : children;
  });
}

/**
 * Non-keyed list iteration where rendered nodes are keyed to an array index. This is useful when
 * there is no conceptual key (i.e., primitives).
 *
 * Prefer `ForKeyed` when referential checks are required (e.g., `[{}, {}]`) - the value is fixed
 * but index changes.
 *
 * @example
 * ```jsx
 * <For each={[0, 1, 2]}>
 *   {($value, index) => <div>{$value()} - {index}</div>}
 * </For>
 * ```
 */
export function For<Item, Element extends JSX.Element>(props: {
  each: Maybe<Item[] | Observable<Item[]>>;
  children: (item: Observable<Item>, index: number) => Element;
}): Observable<Element[]> {
  return computedMap(() => unwrap(props.each), props.children);
}

/**
 * A referentially keyed loop with efficient updating of only changed items.
 *
 * Prefer `For` when working with primitives (e.g., `[1, 2, 3]`) - the index is fixed but the
 * value changes.
 *
 * @example
 * ```jsx
 * <ForKeyed each={[{ id: 0 }, { id: 1 }, { id: 2 }]}>
 *   {(item, $index) => <div>{item.id} - {$index()}</div>}
 * </ForKeyed>
 * ```
 */
export function ForKeyed<Item, Element extends JSX.Element>(props: {
  each: Maybe<Item[] | Observable<Item[]>>;
  children: (item: Item, index: Observable<number>) => Element;
}): Observable<Element[]> {
  return computedKeyedMap(() => unwrap(props.each), props.children);
}
