import type {
  AnyCustomElement,
  AnyCustomElementDefinition,
  InferCustomElementCSSProps,
  InferCustomElementEvents,
  InferCustomElementFromDefinition,
} from '../../element/types';
import type { JSX } from '../jsx';

/**
 * The `HostElement` component can be used at the top of a setup's render function to set
 * attributes, CSS variables, and event listeners on the host custom element.
 *
 * @example
 * ```tsx
 * const FooElementDefinition = defineCustomElement({
 *   setup() {
 *     return () => (
 *       <HostElement bar="..." $element={FooElementDefinition}>
 *         ...
 *       </HostElement>
 *     );
 *   }
 * });
 * ```
 */
export function HostElement<
  Definition extends AnyCustomElementDefinition,
  CustomElement extends AnyCustomElement = InferCustomElementFromDefinition<Definition>,
>(
  props: {
    /** Custom element defintion. */
    $element?: Definition;
    $children?: JSX.Element;
  } & JSX.HTMLElementAttributes<
    CustomElement,
    {},
    InferCustomElementEvents<CustomElement>,
    InferCustomElementCSSProps<CustomElement>
  >,
): JSX.Element {
  // Virtual component so it doesn't return anything, output is determined by the compiler.
  return null as any;
}
