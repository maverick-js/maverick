import { unwrap } from '../../std/signal';
import type { JSX } from '../jsx';
import { computedKeyedMap, computedMap, type Maybe, type ReadSignal } from '../reactivity';

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
  each: Maybe<Item[] | ReadSignal<Item[]>>;
  $children: (item: ReadSignal<Item>, index: number) => Element;
}): ReadSignal<Element[]> {
  return computedMap(
    () => unwrap(props.each),
    unwrap(props.$children),
    __DEV__ ? { id: 'For' } : undefined,
  );
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
  each: Maybe<Item[] | ReadSignal<Item[]>>;
  $children: (item: Item, index: ReadSignal<number>) => Element;
}): ReadSignal<Element[]> {
  return computedKeyedMap(
    () => unwrap(props.each),
    unwrap(props.$children),
    __DEV__ ? { id: 'ForKeyed' } : undefined,
  );
}
