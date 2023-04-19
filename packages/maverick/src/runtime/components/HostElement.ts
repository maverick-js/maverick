import type {
  AnyComponent,
  ComponentConstructor,
  InferComponentCSSProps,
  InferComponentEvents,
} from '../../element/component';
import type { HTMLCustomElement } from '../../element/host';
import type { PickWritable } from '../../std/types';
import type { JSX } from '../jsx';

export type HostElementProps<Component extends AnyComponent> = {
  $this?: ComponentConstructor<Component>;
  $children?: JSX.Element;
} & HostElementAttributes<Component>;

export type HostElementAttributes<Component extends AnyComponent> = JSX.HTMLElementAttributes<
  HTMLCustomElement<Component>,
  {},
  InferComponentEvents<Component>,
  Partial<PickWritable<InferComponentCSSProps<Component>>>
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
export function HostElement<Component extends AnyComponent>(
  props: HostElementProps<Component>,
): HTMLCustomElement<Component> {
  // Virtual component so it doesn't return anything, output is determined by the compiler.
  return null as any;
}
