import type {
  Component,
  ComponentConstructor,
  InferComponentCSSProps,
  InferComponentEvents,
} from '../../element/component';
import type { HTMLCustomElement } from '../../element/host';
import type { PickWritable } from '../../std/types';
import type { JSX } from '../jsx';

export type HostElementProps<T extends Component> = {
  $this?: ComponentConstructor<T>;
  $children?: JSX.Element;
} & HostElementAttributes<T>;

export type HostElementAttributes<T extends Component> = JSX.HTMLElementAttributes<
  HTMLCustomElement<T>,
  {},
  InferComponentEvents<T>,
  Partial<PickWritable<InferComponentCSSProps<T>>>
>;

/**
 * The `HostElement` component can be used at the top of a setup's render function to set
 * attributes, CSS variables, and event listeners on the host custom element.
 *
 * @example
 * ```ts
 * <HostElement bar="..." $this={FooComponent}>
 * ```
 */
export function HostElement<T extends Component>(props: HostElementProps<T>): HTMLCustomElement<T> {
  // Virtual component so it doesn't return anything, output is determined by the compiler.
  return null as any;
}
