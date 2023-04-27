import type {
  Component,
  ComponentConstructor,
  InferComponentCSSProps,
  InferComponentEvents,
  InferComponentProps,
} from '../../element/component';
import type { HTMLCustomElement } from '../../element/host';
import type { PickWritable } from '../../std/types';
import type { JSX } from '../jsx';

export type CustomElementProps<T extends Component> = {
  $this: ComponentConstructor<T>;
  $children?: JSX.Element;
} & CustomElementAttributes<HTMLCustomElement<T>>;

export type CustomElementAttributes<T extends Component> = JSX.HTMLElementAttributes<
  Element & HTMLElement,
  Partial<InferComponentProps<T>>,
  InferComponentEvents<T>,
  PickWritable<InferComponentCSSProps<T>>
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
export function CustomElement<T extends Component>(
  props: CustomElementProps<T>,
): HTMLCustomElement<T> {
  // Virtual component so it doesn't return anything, output is determined by the compiler.
  return null as any;
}
