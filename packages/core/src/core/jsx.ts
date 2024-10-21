import type { Maybe, ReadSignal } from '@maverick-js/signals';

import type { JSX } from '../jsx/jsx';
import type { ComponentLifecycleEvents } from './lifecycle';
import type { SignalOrValue } from './types';

// ---------------------------------------------------------------------------------------------
// <Host>
// ---------------------------------------------------------------------------------------------

export interface HostProps
  extends Omit<JSX.IntrinsicElementAttributes<HTMLElement>, 'as' | 'children'>,
    JSX.OnAttributes<HTMLElement, ComponentLifecycleEvents> {
  as: keyof HTMLElementTagNameMap;
  children?: JSX.Element;
}

/**
 * This component can be used at the root of the render function to set attributes and event
 * listeners on the host element (the root element that content will be rendered inside).
 */
export function Host(props: HostProps) {
  return null; // virtual component, replaced by compiler.
}

// ---------------------------------------------------------------------------------------------
// <Fragment>
// ---------------------------------------------------------------------------------------------

export interface FragmentProps {
  slot?: string;
  children: JSX.Element;
}

/**
 * Group together JSX without a specific root node. You'll generally use this component
 * when you need to provide a `slot` name, otherwise you can use the shorthand `<>...</>`.
 *
 * @example
 * ```jsx
 * <Fragment>
 *   <div>...</div>
 *   <Foo />
 * </Fragment>
 * ```
 */
export function Fragment(props: FragmentProps): JSX.Element {
  return null; // virtual component, replaced by compiler.
}

// ---------------------------------------------------------------------------------------------
// <Portal>
// ---------------------------------------------------------------------------------------------

export type PortalTarget = Node | string | null;

export interface PortalProps {
  to: SignalOrValue<PortalTarget>;
  children: JSX.Element;
}

/**
 * Portals let you render children into a different part of the tree.
 *
 * @example
 * ```jsx
 * <Portal to="body">
 *  <div></div>
 * </Portal>
 * ```
 */
export function Portal(props: PortalProps): JSX.Element {
  return null; // virtual component, replaced by compiler.
}

// ---------------------------------------------------------------------------------------------
// <For>
// ---------------------------------------------------------------------------------------------

export interface ForDefaultSlot<Item> {
  (item: ReadSignal<Item>, index: number): JSX.Element;
}

export interface ForProps<Item> {
  each: Maybe<Item[] | ReadSignal<Item[]>>;
  children: ForDefaultSlot<Item>;
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
 *   {($value, index) => <div>{$value} - {index}</div>}
 * </For>
 * ```
 */
export function For<Item>(props: ForProps<Item>): JSX.Element {
  return null; // virtual component, replaced by compiler.
}

// ---------------------------------------------------------------------------------------------
// <ForKeyed>
// ---------------------------------------------------------------------------------------------

export interface ForKeyedDefaultSlot<Item> {
  (item: Item, index: ReadSignal<number>): JSX.Element;
}

export interface ForKeyedProps<Item> {
  each: Maybe<Item[] | ReadSignal<Item[]>>;
  children: ForKeyedDefaultSlot<Item>;
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
 *   {(item, $index) => <div>{item.id} - {$index}</div>}
 * </ForKeyed>
 * ```
 */
export function ForKeyed<Item>(props: ForKeyedProps<Item>): JSX.Element {
  return null; // virtual component, replaced by compiler.
}
