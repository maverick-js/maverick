import type {
  AnyElementDefinition,
  AnyMaverickElement,
  InferElementCSSProps,
  InferElementEvents,
  InferElementFromDefinition,
  InferElementProps,
} from '../../element/types';
import type { JSX } from '../jsx';

/**
 * Takes an element definition and renders a custom element. This is a virtual component meaning
 * it's compiled away, so don't try creating elements by calling this function.
 *
 * @example
 * ```tsx
 * const MyButton = defineElement({
 *   tagName: 'my-button',
 *   setup: () => () => <button />
 * });
 *
 * const element = <CustomElement $element={MyButton} />
 * ```
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements}
 */
export function CustomElement<
  Definition extends AnyElementDefinition,
  Element extends AnyMaverickElement = InferElementFromDefinition<Definition>,
>(
  props: {
    /** Custom element defintion. */
    $element: Definition;
    $children?: JSX.Element;
  } & JSX.HTMLElementAttributes<
    Element,
    Partial<InferElementProps<Element>>,
    InferElementEvents<Element>,
    InferElementCSSProps<Element>
  >,
): Element {
  // Virtual component so it doesn't return anything, output is determined by the compiler.
  return null as any;
}
