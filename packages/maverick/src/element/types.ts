import type { Constructor, Simplify } from 'type-fest';

import type { ContextMap, JSX, Observable, ObservableOptions, ObservableSubject } from '../runtime';
import type { DOMEvent, DOMEventInit } from '../std/event';
import type { CSS } from './css';
import type { HOST, MEMBERS, PROPS, RENDER } from './internal';
import type { ElementLifecycleManager } from './lifecycle';

export type AttributeValue = string | null;

export interface EmptyRecord extends Record<string, never> {}

export interface ElementAttributeConverter<Value = unknown> {
  readonly from: ((value: AttributeValue) => Value) | false;
  readonly to?: (value: Value) => AttributeValue;
}

export type ElementPropDefinition<Value = unknown> = ObservableOptions<Value> &
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
    converter?: ElementAttributeConverter<Value>;
  };

export interface ElementPropRecord extends Record<string, any> {}
export interface ElementEventRecord extends Record<string, DOMEvent<any>> {}
export interface ElementCSSVarRecord extends Record<string, JSX.CSSValue> {}

export type ElementPropDefinitions<Props extends ElementPropRecord> = Readonly<{
  [Prop in keyof Props]: ElementPropDefinition<Props[Prop]>;
}>;

export interface ElementCSSVarsBuilder<
  Props extends ElementPropRecord,
  CSSVars extends ElementCSSVarRecord,
> {
  (props: Readonly<Props>): Partial<{
    [P in keyof CSSVars]: CSSVars[P] | Observable<CSSVars[P]>;
  }>;
}

export type AnyElementDeclaration = ElementDeclaration<AnyMaverickElement>;

export interface ElementDeclaration<Element extends AnyMaverickElement> {
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
  props: ElementPropDefinitions<InferElementProps<Element>>;
  /**
   * CSS variables that should be initialized during setup.
   */
  cssvars:
    | InferElementCSSProps<Element>
    | ElementCSSVarsBuilder<InferElementProps<Element>, InferElementCSSProps<Element>>;
  /**
   * The setup function is run once the custom element is ready to render. This function must
   * return a render function. Optionally, class members (i.e., props and methods) can be returned
   * which are assigned to the custom element.
   */
  setup: ElementSetup<Element>;
}

export type ElementSetup<Element extends AnyMaverickElement> = (
  instance: ElementInstance<InferElementProps<Element>, InferElementEvents<Element>>,
) => InferElementMembers<Element> extends Record<any, never>
  ? void | (() => JSX.Element)
  : InferElementMembers<Element> & { $render?: () => JSX.Element };

export interface AnyElementDefinition extends ElementDefinition<AnyMaverickElement> {}

export interface ElementDefinition<Element extends AnyMaverickElement>
  extends Omit<ElementDeclaration<Element>, 'setup'> {
  /** @internal */
  setup: (instance: NonNullable<Element['instance']>) => InferElementMembers<Element> & {
    $render?: () => JSX.Element;
  };
  /** Whether the given `node` was created using this element defintion. */
  is: (node?: Node | null) => node is Element;
}

export type InferElementFromDefinition<Def> = Def extends ElementDefinition<infer Element>
  ? Element
  : never;

export interface MaverickElement<
  Props extends ElementPropRecord = {},
  Events extends ElementEventRecord = {},
  CSSVars extends ElementCSSVarRecord = {},
> extends HTMLElement,
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

export interface HostElement<
  Props extends ElementPropRecord = {},
  Events extends ElementEventRecord = {},
> {
  [HOST]?: boolean;
  /**
   * Maverick component instance associated with this element.
   */
  readonly instance: ElementInstance<Props, Events> | null;
  /**
   * Associate this element with a Maverick component instance.
   */
  attachComponent(instance: ElementInstance<Props, Events>): void;
  /**
   * The given `handler` is invoked with the type of event (e.g., `my-event`) when this element
   * dispatches it. Each event type is unique and only passed to the given `handler` once.
   */
  onEventDispatch(handler: (eventType: string) => void): void;
}

export interface AnyMaverickElement extends MaverickElement<any, any, any> {}

export type InferElementProps<Element> = Element extends MaverickElement<infer Props, any, any>
  ? Props
  : never;

export type InferElementEvents<Element> = Element extends MaverickElement<any, infer Events, any>
  ? Events
  : never;

export type InferElementCSSProps<Element> = Element extends MaverickElement<any, any, infer CSSVars>
  ? CSSVars
  : never;

export type InferElementCSSVars<Element> = Element extends MaverickElement<any, any, infer CSSVars>
  ? { [Var in keyof CSSVars as `--${Var & string}`]: CSSVars[Var] }
  : never;

export type InferElementMembers<Element> = Element extends AnyMaverickElement
  ? Simplify<Omit<Element, keyof AnyMaverickElement | '$render'>>
  : never;

export interface MaverickElementConstructor<Element extends AnyMaverickElement = AnyMaverickElement>
  extends Constructor<Element> {
  readonly observedAttributes: string[];
}

export interface ElementInstanceInit<Props = {}> {
  props?: Readonly<Partial<Props>>;
  context?: ContextMap;
  children?: Observable<boolean>;
}

export type AnyElementInstance = ElementInstance<any, any>;

export interface ElementInstance<
  Props extends ElementPropRecord = {},
  Events extends ElementEventRecord = {},
> extends ElementLifecycleManager {
  /** @internal */
  [PROPS]: Props;
  /** @internal */
  [MEMBERS]?: Record<string, any>;
  /** @internal */
  [RENDER]?: () => JSX.Element;
  readonly host: ElementInstanceHost<Props, Events> & {
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
   * Facade for dispatching events on the current host element this component is attached to.
   */
  readonly dispatch: ElementInstanceDispatcher<Events>;
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

export interface ElementInstanceHost<
  Props extends ElementPropRecord = {},
  Events extends ElementEventRecord = {},
> {
  /**
   * The custom element this component is attached to. This is safe to call server-side with the
   * limited API listed below.
   *
   * **Important:** Only specific DOM APIs are safe to call server-side. This includes:
   *
   * - Attributes: `getAttribute`, `setAttribute`, `removeAttribute`, and `hasAttribute`
   * - Classes: `classList` API
   * - Styles: `style` API
   * - Events (noops): `addEventListener`, `removeEventListener`, and `dispatchEvent`
   */
  el: MaverickElement<Props, Events, never> | null;
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

export interface ElementInstanceDispatcher<Events extends ElementEventRecord> {
  <Type extends keyof Events>(
    type: Events extends never | EmptyRecord ? never : Type,
    ...detail: Events[Type]['detail'] extends void | undefined
      ? [detail?: Events[Type]['detail'] | Partial<DOMEventInit<Events[Type]['detail']>>]
      : [detail: Events[Type]['detail'] | DOMEventInit<Events[Type]['detail']>]
  ): boolean;
}

// Conditional checks are simply ensuring props, cssvars, and setup are only required when needed.
export type PartialElementDeclaration<Element extends AnyMaverickElement> =
  InferElementMembers<Element> extends EmptyRecord
    ? Omit<
        ElementDeclaration<Element>,
        | (InferElementProps<Element> extends Record<string, never> ? 'props' : '')
        | 'setup'
        | (InferElementCSSProps<Element> extends Record<string, never> ? 'cssvars' : '')
      > & {
        setup?: ElementDeclaration<Element>['setup'];
      }
    : Omit<
        ElementDeclaration<Element>,
        | (InferElementProps<Element> extends Record<string, never> ? 'props' : '')
        | (InferElementCSSProps<Element> extends Record<string, never> ? 'cssvars' : '')
      >;
