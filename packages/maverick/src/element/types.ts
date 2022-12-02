import type { Constructor, Simplify } from 'type-fest';

import type { ContextMap, JSX, Observable, ObservableOptions, ObservableSubject } from '../runtime';
import type { CSS } from './css';
import type { HOST, MEMBERS, PROPS, RENDER } from './internal';
import type { ElementLifecycleManager } from './lifecycle';

export type AttributeValue = string | null;

export interface EmptyRecord extends Record<string, never> {}

export interface CustomElementAttributeConverter<Value = unknown> {
  readonly from: ((value: AttributeValue) => Value) | false;
  readonly to?: (value: Value) => AttributeValue;
}

export type CustomElementPropDefinition<Value = unknown> = ObservableOptions<Value> &
  (Value extends undefined
    ? {}
    : {
        /**
         * The initial value of this property.
         */
        initial: Value;
      }) & {
    /**
     * Whether the property is associated with an attribute, or a custom name for the associated
     * attribute. By default this is `true` and the attribute name is inferred by kebab-casing the
     * property name.
     */
    attribute?: string | false;
    /**
     * Whether the property value should be reflected back to the attribute. By default this
     * is `false`.
     */
    reflect?: boolean;
    /**
     * Convert between an attribute value and property value.
     */
    converter?: CustomElementAttributeConverter<Value>;
  };

export type CustomElementPropDefinitions<Props> = Readonly<{
  [Prop in keyof Props]: CustomElementPropDefinition<Props[Prop]>;
}>;

export interface CustomElementCSSVarsBuilder<Props, CSSVars> {
  (props: Readonly<Props>): Partial<{
    [P in keyof CSSVars]: CSSVars[P] | Observable<CSSVars[P]>;
  }>;
}

export type AnyCustomElementDeclaration = CustomElementDeclaration<AnyCustomElement>;

export interface CustomElementDeclaration<Element extends AnyCustomElement> {
  /**
   * The tag name of the custom element. Note that custom element names must contain a hypen (e.g.,
   * `foo-bar`).
   */
  tagName: `${string}-${string}`;
  /**
   * Whether this custom element should contain a shadow root. Optionally, shadow root init options
   * can be provided. If `true`, simply the `mode` is set to `open`.
   */
  shadowRoot?: true | ShadowRootInit;
  /**
   * CSS styles that should be adopted by the shadow root. Note that these styles are only applied
   * if the `shadowRoot` option is truthy.
   */
  css?: CSS[];
  /**
   * Component properties. Note that these are not exposed on the custom element, only members
   * returned from the `setup` function are.
   */
  props: CustomElementPropDefinitions<InferCustomElementProps<Element>>;
  /**
   * CSS variables that should be initialized during setup.
   */
  cssvars:
    | InferCustomElementCSSProps<Element>
    | CustomElementCSSVarsBuilder<
        InferCustomElementProps<Element>,
        InferCustomElementCSSProps<Element>
      >;
  /**
   * The setup function is run once the custom element is ready to render. This function must
   * return a render function. Optionally, class members (i.e., props and methods) can be returned
   * which are assigned to the custom element.
   */
  setup: CustomElementSetup<Element>;
}

export type CustomElementSetup<Element extends AnyCustomElement> = (
  instance: CustomElementInstance<
    InferCustomElementProps<Element>,
    InferCustomElementEvents<Element>
  >,
) => InferCustomElementMembers<Element> extends Record<any, never>
  ? void | (() => JSX.Element)
  : InferCustomElementMembers<Element> & { $render?: () => JSX.Element };

export interface AnyCustomElementDefinition extends CustomElementDefinition<AnyCustomElement> {}

export interface CustomElementDefinition<Element extends AnyCustomElement>
  extends Omit<CustomElementDeclaration<Element>, 'setup'> {
  /** @internal */
  setup: (instance: NonNullable<Element['instance']>) => InferCustomElementMembers<Element> & {
    $render?: () => JSX.Element;
  };
  /** Whether the given `node` was created using this element defintion. */
  is: (node?: Node | null) => node is Element;
}

export type InferCustomElementFromDefinition<Def> = Def extends CustomElementDefinition<
  infer Element
>
  ? Element
  : never;

export interface HTMLCustomElement<Props = {}, Events = {}, CSSVars = {}>
  extends HTMLElement,
    HostElement<Props, Events> {
  /** @internal only holds type - not a real prop. */
  ___cssvars?: CSSVars;

  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: Element, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener<K extends keyof Events>(
    type: K,
    listener: (this: Element, ev: Events[K]) => any,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void;

  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: Element, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener<K extends keyof Events>(
    type: K,
    listener: (this: Element, ev: Events[K]) => any,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void;
}

export interface HostElement<Props = {}, Events = {}> {
  [HOST]?: boolean;
  /**
   * Maverick component instance associated with this element.
   */
  readonly instance: CustomElementInstance<Props, Events> | null;
  /**
   * Associate this element with a Maverick component instance.
   */
  attachComponent(instance: CustomElementInstance<Props, Events>): void;
  /**
   * The given `handler` is invoked with the type of event (e.g., `my-event`) when this element
   * dispatches it. Each event type is unique and only passed to the given `handler` once.
   */
  onEventDispatch(handler: (eventType: string) => void): void;
}

export interface AnyCustomElement extends HTMLCustomElement<any, any, any> {}

export type InferCustomElementProps<Element> = Element extends HTMLCustomElement<
  infer Props,
  any,
  any
>
  ? Props
  : never;

export type InferCustomElementEvents<Element> = Element extends HTMLCustomElement<
  any,
  infer Events,
  any
>
  ? Events
  : never;

export type InferCustomElementCSSProps<Element> = Element extends HTMLCustomElement<
  any,
  any,
  infer CSSVars
>
  ? CSSVars
  : never;

export type InferCustomElementCSSVars<Element> = Element extends HTMLCustomElement<
  any,
  any,
  infer CSSVars
>
  ? { [Var in keyof CSSVars as `--${Var & string}`]: CSSVars[Var] }
  : never;

export type InferCustomElementMembers<Element> = Element extends AnyCustomElement
  ? Simplify<Omit<Element, keyof AnyCustomElement | '$render'>>
  : never;

export interface HTMLCustomElementConstructor<Element extends AnyCustomElement = AnyCustomElement>
  extends Constructor<Element> {
  readonly observedAttributes: string[];
}

export interface CustomElementInstanceInit<Props = {}> {
  props?: Readonly<Partial<Props>>;
  context?: ContextMap;
  children?: Observable<boolean>;
}

export type AnyCustomElementInstance = CustomElementInstance<any, any>;

export interface CustomElementInstance<Props = {}, Events = {}> extends ElementLifecycleManager {
  /** @internal */
  [PROPS]: Props;
  /** @internal */
  [MEMBERS]?: Record<string, any>;
  /** @internal */
  [RENDER]?: () => JSX.Element;
  readonly host: CustomElementInstanceHost<HTMLCustomElement<Props, Events>> & {
    /** @internal */
    [PROPS]: {
      $connected: ObservableSubject<boolean>;
      $mounted: ObservableSubject<boolean>;
      $children: Observable<boolean> | ObservableSubject<boolean>;
    };
  };
  /**
   * Component properties where each value is a readonly observable. Do note destructure this
   * object because it will result in a loss of reactivity.
   */
  readonly props: Readonly<Props>;
  /**
   * Permanently destroy component instance.
   */
  readonly destroy: () => void;
  /**
   * Returns get/set accessors for all defined properties on this element instance. This method
   * should only be used for exposing properties as members on the HTML element so consumers can
   * use them.
   *
   * **⚠️ Do not use this internally for setting props. It will generally lead to state being out
   * of sync between the host framework and internally which will cause inconsistent states.**
   */
  readonly accessors: () => Props;
  /**
   * Runs given function inside instance scope.
   */
  readonly run: <T>(fn: () => T) => T;
}

export interface CustomElementInstanceHost<CustomElement extends AnyCustomElement> {
  /**
   * The custom element this component is attached to. This is safe to call server-side with the
   * limited API isted below.
   *
   * **Important:** Only specific DOM APIs are safe to call server-side. This includes:
   *
   * - Attributes: `getAttribute`, `setAttribute`, `removeAttribute`, and `hasAttribute`
   * - Classes: `classList` API
   * - Styles: `style` API
   * - Events (noops): `addEventListener`, `removeEventListener`, and `dispatchEvent`
   */
  el: CustomElement | null;
  /**
   * Whether the custom element associated with this component has connected to the DOM. This is
   * a reactive observable call.
   */
  $connected: boolean;
  /**
   * Whether the custom element associated with this component has mounted the DOM and rendered
   * content in its shadow root. This is a reactive observable call.
   */
  $mounted: boolean;
  /**
   * Whether there is any child nodes in the associated custom element's light DOM. If `false`
   * you can return fallback content. This is a reactive observable call.
   */
  $children: boolean;
}

// Conditional checks are simply ensuring props, cssvars, and setup are only required when needed.
export type PartialCustomElementDeclaration<Element extends AnyCustomElement> =
  InferCustomElementMembers<Element> extends EmptyRecord
    ? Omit<
        CustomElementDeclaration<Element>,
        | (InferCustomElementProps<Element> extends Record<string, never> ? 'props' : '')
        | 'setup'
        | (InferCustomElementCSSProps<Element> extends Record<string, never> ? 'cssvars' : '')
      > & {
        setup?: CustomElementDeclaration<Element>['setup'];
      }
    : Omit<
        CustomElementDeclaration<Element>,
        | (InferCustomElementProps<Element> extends Record<string, never> ? 'props' : '')
        | (InferCustomElementCSSProps<Element> extends Record<string, never> ? 'cssvars' : '')
      >;
