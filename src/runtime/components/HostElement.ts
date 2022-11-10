import type {
  ElementCSSVarRecord,
  ElementDefinition,
  ElementEventRecord,
  ElementMembers,
  ElementPropRecord,
  MaverickElement,
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
  Props extends ElementPropRecord,
  Events extends ElementEventRecord,
  CSSVars extends ElementCSSVarRecord,
  Members extends ElementMembers,
>(
  props: {
    /** Custom element defintion. */
    $element?: ElementDefinition<Props, Events, CSSVars, Members>;
    $children?: JSX.Element;
  } & JSX.HTMLElementAttributes<
    MaverickElement<Props, Events> & Members,
    {},
    Events & JSX.EventRecord,
    CSSVars
  >,
): JSX.Element {
  // Virtual component so it doesn't return anything, output is determined by the compiler.
  return null as any;
}
