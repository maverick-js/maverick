import type { JSX } from '../../runtime/jsx';
import { computedMap, computedKeyedMap, type Maybe, type Observable } from '../reactivity';
import { unwrap } from '../../utils/obs';

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
