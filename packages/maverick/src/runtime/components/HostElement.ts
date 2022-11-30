import type {
  AnyElementDefinition,
  AnyMaverickElement,
  InferElementCSSProps,
  InferElementEvents,
  InferElementFromDefinition,
} from '../../element/types';
import type { JSX } from '../jsx';

/**
 * The `HostElement` component can be used at the top of a setup's render function to set
 * attributes, CSS variables, and event listeners on the host custom element.
 *
 * @example
 * ```tsx
 * const FooElement = defineElement({
 *   setup() {
 *     return () => (
 *       <HostElement bar="..." $element={FooElement}>
 *         ...
 *       </HostElement>
 *     );
 *   }
 * });
 * ```
 */
export function HostElement<
  Definition extends AnyElementDefinition,
  Element extends AnyMaverickElement = InferElementFromDefinition<Definition>,
>(
  props: {
    /** Custom element defintion. */
    $element?: Definition;
    $children?: JSX.Element;
  } & JSX.HTMLElementAttributes<
    Element,
    {},
    InferElementEvents<Element>,
    InferElementCSSProps<Element>
  >,
): JSX.Element {
  // Virtual component so it doesn't return anything, output is determined by the compiler.
  return null as any;
}
