import type { Maybe, ReadSignal } from '@maverick-js/signals';

import type { JSX } from '../jsx/jsx';
import type { LifecycleEvents } from './lifecycle';

export interface HostProps
  extends JSX.IntrinsicElementAttributes<HTMLElement>,
    JSX.OnAttributes<HTMLElement, LifecycleEvents> {
  as: keyof HTMLElementTagNameMap;
  children?: JSX.Element;
}

/**
 * This component can be used at the root of the render function to set attributes and event
 * listeners on the host element (the root custom element that content will be rendered inside).
 */
export function Host(props: HostProps) {
  return null; // virtual component, replaced by compiler.
}

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

export interface PortalProps {
  to: string | Node | null;
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

export interface ForProps<Item> {
  each: Maybe<Item[] | ReadSignal<Item[]>>;
  key?: (item: Item) => any;
  children: (item: Item, index: number) => Element;
}

/**
 * Render a list of items and optionally provide a key to map items to a specific node.
 *
 * @example
 * ```jsx
 * <For each={[0, 1, 2]}>
 *   {(item, index) => <div>{item}</div>}
 * </For>
 * ```
 * @example
 * ```jsx
 * <For each={[{ title: '' }, { title: '' }]} key={(item) => item.title}>
 *   {(item, index) => <div>{item.title}</div>}
 * </For>
 * ```
 */
export function For<Item>(props: ForProps<Item>): JSX.Element {
  return null;
}
