import type {
  AnyComponent,
  ComponentConstructor,
  InferComponentCSSProps,
  InferComponentEvents,
  InferComponentProps,
} from '../../element/component';
import type { HTMLCustomElement } from '../../element/host';
import type { PickWritable } from '../../std/types';
import type { JSX } from '../jsx';

export type CustomElementProps<Component extends AnyComponent> = {
  $this: ComponentConstructor<Component>;
  $children?: JSX.Element;
} & CustomElementAttributes<HTMLCustomElement<Component>>;

export type CustomElementAttributes<Component extends AnyComponent> = JSX.HTMLElementAttributes<
  Element & HTMLElement,
  Partial<InferComponentProps<Component>>,
  InferComponentEvents<Component>,
  PickWritable<InferComponentCSSProps<Component>>
>;

/**
 * Takes an element component and renders a custom element. This is a virtual component meaning
 * it's compiled away, so don't try creating elements by calling this function.
 *
 * @example
 * ```tsx
 * <CustomElement $this={FooComponent} />
 * ```
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements}
 */
export function CustomElement<Component extends AnyComponent>(
  props: CustomElementProps<Component>,
): HTMLCustomElement<Component> {
  // Virtual component so it doesn't return anything, output is determined by the compiler.
  return null as any;
}
