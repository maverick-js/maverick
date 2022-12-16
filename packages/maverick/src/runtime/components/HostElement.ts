import type {
  AnyCustomElement,
  AnyCustomElementDefinition,
  InferCustomElement,
  InferCustomElementCSSProps,
  InferCustomElementEvents,
} from '../../element/types';
import type { PickWritable } from '../../std/types';
import type { JSX } from '../jsx';

export type HostElementProps<Definition extends AnyCustomElementDefinition> = {
  /** Custom element defintion. */
  $element?: Definition;
  $children?: JSX.Element;
} & HostElementAttributes<InferCustomElement<Definition>>;

export type HostElementAttributes<CustomElement extends AnyCustomElement> =
  JSX.HTMLElementAttributes<
    CustomElement,
    {},
    InferCustomElementEvents<CustomElement>,
    Partial<PickWritable<InferCustomElementCSSProps<CustomElement>>>
  >;

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
export function HostElement<Definition extends AnyCustomElementDefinition>(
  props: HostElementProps<Definition>,
): JSX.Element {
  // Virtual component so it doesn't return anything, output is determined by the compiler.
  return null as any;
}
