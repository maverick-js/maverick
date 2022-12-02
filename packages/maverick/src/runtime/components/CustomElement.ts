import type {
  AnyCustomElement,
  AnyCustomElementDefinition,
  InferCustomElementCSSProps,
  InferCustomElementEvents,
  InferCustomElementFromDefinition,
  InferCustomElementProps,
} from '../../element/types';
import type { JSX } from '../jsx';

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
export function CustomElement<
  Definition extends AnyCustomElementDefinition,
  CustomElement extends AnyCustomElement = InferCustomElementFromDefinition<Definition>,
>(
  props: {
    /** Custom element defintion. */
    $element: Definition;
    $children?: JSX.Element;
  } & JSX.HTMLElementAttributes<
    CustomElement,
    Partial<InferCustomElementProps<CustomElement>>,
    InferCustomElementEvents<CustomElement>,
    InferCustomElementCSSProps<CustomElement>
  >,
): CustomElement {
  // Virtual component so it doesn't return anything, output is determined by the compiler.
  return null as any;
}
