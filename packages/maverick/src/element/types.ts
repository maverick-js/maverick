import type { Constructor, Simplify } from 'type-fest';

import type {
  JSX,
  ReadSignal,
  Scope,
  SignalOptions,
  Signals,
  WriteSignal,
  WriteSignals,
} from '../runtime';
import type { WritableKeys } from '../std/types';
import type { CSS } from './css';
import type { HOST, MEMBERS, PROPS, RENDER, SCOPE } from './internal';
import type { ElementLifecycleCallback, ElementLifecycleManager } from './lifecycle';

export type AttributeValue = string | null;

export interface EmptyRecord extends Record<string, never> {}

export interface CustomElementAttributeType<Value = unknown> {
  readonly from: ((value: AttributeValue) => Value) | false;
  readonly to?: (value: Value) => AttributeValue;
}

export type CustomElementPropDefinition<Value = unknown> = SignalOptions<Value> &
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
     * Convert between an attribute value and property value. If not specified it will be inferred
     * from the initial value.
     */
    type?: CustomElementAttributeType<Value>;
  };

export type CustomElementPropDefinitions<Props> = Readonly<{
  [Prop in keyof Props]: CustomElementPropDefinition<Props[Prop]>;
}>;

export interface CustomElementDeclaration<T extends AnyCustomElement = AnyCustomElement> {
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
   * Component properties. Note that these props are not exposed on the custom element, only
   * members returned from the `setup` function are.
   */
  props: CustomElementPropDefinitions<InferCustomElementProps<T>>;
  /**
   * The setup function is run once the custom element is ready to render. This function must
   * return a render function. Optionally, class members (i.e., props and methods) can be returned
   * which are assigned to the custom element.
   */
  setup: CustomElementSetup<T>;
}

export type CustomElementSetup<T extends AnyCustomElement> = (
  instance: CustomElementInstance<T>,
) => InferCustomElementMembers<T> extends Record<any, never>
  ? void | (() => JSX.Element)
  : InferCustomElementMembers<T> & { $render?: () => JSX.Element };

export interface CustomElementDefinition<T extends AnyCustomElement = AnyCustomElement>
  extends Omit<CustomElementDeclaration<T>, 'setup'> {
  /** @internal */
  setup: (instance: NonNullable<T['instance']>) => InferCustomElementMembers<T> & {
    $render?: () => JSX.Element;
  };
}

export type InferCustomElement<T> = T extends CustomElementDefinition<infer Element>
  ? Element
  : never;

export interface AnyCustomElement extends HTMLCustomElement<any, any, any> {}

export interface HTMLCustomElementConstructor<T extends AnyCustomElement = AnyCustomElement>
  extends Constructor<T> {
  readonly observedAttributes: string[];
}

export interface HTMLCustomElement<Props = {}, Events = {}, CSSVars = {}>
  extends HTMLElement,
    HostElement {
  /** @internal only holds type - not a real prop. */
  ___props?: Props;
  /** @internal only holds type - not a real prop. */
  ___cssvars?: CSSVars;
  /** @internal only holds type - not a real prop. */
  ___events?: Events;

  addEventListener<K extends keyof Events>(
    type: K,
    listener: (this: Element, ev: Events[K]) => any,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: Element, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void;

  removeEventListener<K extends keyof Events>(
    type: K,
    listener: (this: Element, ev: Events[K]) => any,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: Element, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void;
}

export interface HostElement {
  [HOST]?: boolean;
  /**
   * Whether this component should be kept-alive on DOM disconnection. If `true`, all child
   * host elements will also be kept alive and the instance will need to be manually destroyed.
   *
   * Important to note that if a parent element is kept alive, calling destroy will also destroy
   * all child element instances.
   *
   * ```ts
   * // Destroy this element and all children.
   * element.destroy();
   * ```
   */
  keepAlive: boolean;
  /**
   * Maverick component instance associated with this element.
   *
   * @internal
   */
  readonly instance: CustomElementInstance | null;
  /**
   * Associate this element with a Maverick component instance.
   *
   * @internal
   */
  attachComponent(instance: CustomElementInstance): void;
  /**
   * Invokes the given callback when the custom element instance has been attached to this host
   * element - this is when all instance members will be defined. The callback will be immediately
   * invoked if the instance is already attached.
   */
  onAttach(callback: ElementLifecycleCallback): void;
  /**
   * The given `handler` is invoked with the type of event (e.g., `my-event`) when this element
   * dispatches it. Each event type is unique and only passed to the given `handler` once.
   *
   * @internal
   */
  onEventDispatch(handler: (eventType: string) => void): void;
  /**
   * Destroys the underlying custom element instance.
   */
  destroy(): void;
}

export type InferCustomElementProps<T> = T extends HTMLCustomElement<infer Props, any, any>
  ? Props
  : never;

export type InferCustomElementEvents<T> = T extends HTMLCustomElement<any, infer Events, any>
  ? Events
  : never;

export type InferCustomElementCSSProps<T> = T extends HTMLCustomElement<any, any, infer CSSVars>
  ? CSSVars
  : never;

export type InferCustomElementCSSVars<T> = T extends HTMLCustomElement<any, any, infer CSSVars>
  ? { [Var in WritableKeys<CSSVars> as `--${Var & string}`]: CSSVars[Var] }
  : never;

export type InferCustomElementMembers<T> = T extends AnyCustomElement
  ? Simplify<Omit<T, keyof AnyCustomElement | '$render'>>
  : never;

export interface CustomElementInstanceInit<Props = {}> {
  scope?: Scope | null;
  props?: Readonly<Partial<Props>>;
}

export interface CustomElementInstance<T extends AnyCustomElement = AnyCustomElement>
  extends ElementLifecycleManager {
  /** @internal */
  [SCOPE]: Scope | null;
  /** @internal */
  [PROPS]: WriteSignals<InferCustomElementProps<T>>;
  /** @internal */
  [MEMBERS]?: Record<string, any> | null;
  /** @internal */
  [RENDER]?: (() => JSX.Element) | null;
  /**
   * Contains an API for retrieving and interacting with the host element.
   */
  readonly host: CustomElementHost<T>;
  /**
   * Component properties where each value is a readonly signal.
   */
  readonly props: Signals<InferCustomElementProps<T>>;
  /**
   * Returns get/set accessors for all defined properties on this element instance. This method
   * should only be used for exposing properties as members on the HTML element so consumers can
   * use them.
   *
   * **⚠️ Do not use this internally for setting props. It will generally lead to state being out
   * of sync between the host framework and internally which will cause inconsistent states.**
   */
  readonly accessors: () => InferCustomElementProps<T>;
  /**
   * Permanently destroy component instance.
   */
  destroy(): void;
}

export interface CustomElementHost<T extends AnyCustomElement = AnyCustomElement> {
  /** @internal */
  [PROPS]: {
    $attrs: AttributesRecord | null;
    $styles: StylesRecord | null;
    $connected: WriteSignal<boolean>;
    $mounted: WriteSignal<boolean>;
  };
  /**
   * The custom element this component is attached to. This is safe to use server-side with the
   * limited API isted below.
   *
   * **Important:** Only specific DOM APIs are safe to call server-side. This includes:
   *
   * - Attributes: `getAttribute`, `setAttribute`, `removeAttribute`, and `hasAttribute`
   * - Classes: `classList` API
   * - Styles: `style` API
   * - Events (noops): `addEventListener`, `removeEventListener`, and `dispatchEvent`
   */
  readonly el: T | null;
  /**
   * Returns the custom element this component is attached to. This is a reactive signal call where
   * the element is set on DOM connection, and set back to `null` on disconnection. In other words,
   * `$el` is defined when the host element is connected to the DOM.
   *
   * Refer to the `el` property for non-reactive version and for notes on server-side usage.
   */
  readonly $el: ReadSignal<T | null>;
  /**
   * Whether the custom element associated with this component has connected to the DOM.
   */
  readonly $connected: ReadSignal<boolean>;
  /**
   * Whether the custom element associated with this component has mounted the DOM and rendered
   * content in its host element or shadow root.
   */
  readonly $mounted: ReadSignal<boolean>;
  /**
   * This method can be used to specify attributes that should be set on the host element. Any
   * attributes that are assigned to a function will be considered a signal and updated accordingly.
   */
  setAttributes(attributes: AttributesRecord): void;
  /**
   * This method can be used to specify styles that should set be set on the host element. Any
   * styles that are assigned to a function will be considered a signal and updated accordingly.
   */
  setStyles(styles: StylesRecord): void;
  /**
   * This method is used to satisfy the CSS variables contract specified on the current
   * custom element definition. Other CSS variables can be set via the `setStyles` method.
   */
  setCSSVars(vars: CSSVarsRecord<InferCustomElementCSSProps<T>>): void;
}

export interface AttributesRecord extends JSX.HTMLAttrs, JSX.ARIAAttributes, JSX.AttrsRecord {}

export interface StylesRecord extends JSX.CSSStyles {}

export type CSSVarsRecord<CSSVars> = {
  [Var in keyof CSSVars as `--${Var & string}`]: JSX.Observable<CSSVars[Var]>;
};

// Conditional checks are simply ensuring props and setup are only required when needed.
export type PartialCustomElementDeclaration<T extends AnyCustomElement> =
  InferCustomElementMembers<T> extends EmptyRecord
    ? Omit<
        CustomElementDeclaration<T>,
        (InferCustomElementProps<T> extends Record<string, never> ? 'props' : '') | 'setup'
      > & {
        setup?: CustomElementDeclaration<T>['setup'];
      }
    : InferCustomElementProps<T> extends Record<string, never>
    ? Omit<CustomElementDeclaration<T>, 'props'>
    : CustomElementDeclaration<T>;
