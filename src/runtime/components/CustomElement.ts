import type { JSX } from '../jsx';
import type {
  ElementDefinition,
  ElementProps,
  ElementCSSVars,
  ElementMembers,
  MaverickElement,
} from '../../element/types';

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
 * const element = <CustomElement element={MyButton} />
 * ```
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements}
 */
export function CustomElement<
  Props extends ElementProps = ElementProps,
  Events = JSX.GlobalOnAttributes,
  CSSVars extends ElementCSSVars = ElementCSSVars,
  Members extends ElementMembers = ElementMembers,
>(
  props: {
    element: ElementDefinition<Props, Events, CSSVars, Members>;
    children?: JSX.Element;
  } & JSX.HTMLElementAttributes<
    MaverickElement<Props, Members>,
    Partial<Props>,
    Events & JSX.GlobalOnAttributes & JSX.EventRecord,
    CSSVars
  >,
): MaverickElement<Props, Members> {
  // Virtual component so it doesn't return anything, output is determined by the compiler.
  return null as any;
}
