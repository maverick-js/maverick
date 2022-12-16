import type {
  AnyCustomElement,
  AnyCustomElementDefinition,
  InferCustomElement,
  InferCustomElementCSSProps,
  InferCustomElementEvents,
  InferCustomElementProps,
} from '../../element/types';
import type { PickWritable } from '../../std/types';
import type { JSX } from '../jsx';

export type CustomElementProps<Definition extends AnyCustomElementDefinition> = {
  /** Custom element defintion. */
  $element: Definition;
  $children?: JSX.Element;
} & CustomElementAttributes<InferCustomElement<Definition>>;

export type CustomElementAttributes<CustomElement extends AnyCustomElement> =
  JSX.HTMLElementAttributes<
    CustomElement,
    Partial<InferCustomElementProps<CustomElement>>,
    InferCustomElementEvents<CustomElement>,
    PickWritable<InferCustomElementCSSProps<CustomElement>>
  >;

/**
 * Takes an element definition and renders a custom element. This is a virtual component meaning
 * it's compiled away, so don't try creating elements by calling this function.
 *
 * @example
 * ```tsx
 * const FooElementDefinition = defineCustomElement({
 *   tagName: 'mk-foo',
 *   setup: () => () => <div />
 * });
 *
 * const element = <CustomElement $element={FooElementDefinition} />
 * ```
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements}
 */
export function CustomElement<Definition extends AnyCustomElementDefinition>(
  props: CustomElementProps<Definition>,
): InferCustomElement<Definition> {
  // Virtual component so it doesn't return anything, output is determined by the compiler.
  return null as any;
}
