import type { Constructor } from 'type-fest';

import type { ContextMap, JSX, Observable, observable, ObservableSubject } from '../runtime';
import type { DOMEventInit } from '../std/event';
import type { CSS } from './css';
import type { HOST, MEMBERS, PROPS, RENDER } from './internal';
import type { ElementLifecycleManager } from './lifecycle';

export type AttributeValue = string | null;

export type ElementAttributeConverter<Value = unknown> = {
  readonly from: ((value: AttributeValue) => Value) | false;
  readonly to?: (value: Value) => AttributeValue;
};

export type ElementPropDefinition<Value = unknown> = Readonly<
  Parameters<typeof observable<Value>>[1] & {
    /**
     * The initial value of this property.
     */
    initial: Value;
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
  }
>;

export type ElementPropDefinitions<Props extends ElementPropRecord = ElementPropRecord> = Readonly<{
  [Prop in keyof Props]: ElementPropDefinition<Props[Prop]>;
}>;

export type ElementPropRecord = {
  [name: string]: any;
};

export type ElementCSSVarRecord = {
  [name: string]: JSX.CSSValue;
};

export type ElementEventRecord = {
  [name: string]: DOMEventInit;
};

export type ElementMembers = {
  [name: string]: unknown;
  $render?: () => JSX.Element;
};

export type ElementCSSVarsBuilder<
  Props extends ElementPropRecord = ElementPropRecord,
  CSSVars extends ElementCSSVarRecord = ElementCSSVarRecord,
> = (props: Readonly<Props>) => Partial<{
  [P in keyof CSSVars]: CSSVars[P] | Observable<CSSVars[P]>;
}>;

export type AnyElementDeclaration = ElementDeclaration<any, any, any, any>;

export type ElementDeclaration<
  Props extends ElementPropRecord = ElementPropRecord,
  Events extends ElementEventRecord = ElementEventRecord,
  CSSVars extends ElementCSSVarRecord = ElementCSSVarRecord,
  Members extends ElementMembers = ElementMembers,
> = Readonly<{
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
  props?: ElementPropDefinitions<Props>;
  /**
   * CSS variables that should be initialized during setup.
   */
  cssvars?: Partial<CSSVars> | ElementCSSVarsBuilder<Props, CSSVars>;
  /**
   * Events types and their respective initializers that are dispatched by this component.
   */
  events?: Partial<Events>;
  /**
   * The setup function is run once the custom element is ready to render. This function must
   * return a render function. Optionally, class members (i.e., props and methods) can be returned
   * which are assigned to the custom element.
   */
  setup?: ElementSetup<Props, Events, Members>;
}>;

export type ElementSetup<
  Props extends ElementPropRecord = ElementPropRecord,
  Events extends ElementEventRecord = ElementEventRecord,
  Members extends ElementMembers = ElementMembers,
> = (instance: ElementInstance<Props, Events>) => void | (() => JSX.Element) | Members;

export type AnyElementDefinition = ElementDefinition<any, any, any, any>;

export type ElementDefinition<
  Props extends ElementPropRecord = ElementPropRecord,
  Events extends ElementEventRecord = ElementEventRecord,
  CSSVars extends ElementCSSVarRecord = ElementCSSVarRecord,
  Members extends ElementMembers = ElementMembers,
> = Omit<ElementDeclaration<Props, Events, CSSVars, Members>, 'setup'> &
  Readonly<{
    /** @internal not a real prop, only holds type. */
    [HOST]?: MaverickElement<Props, Events> & Members;
    /** @internal */
    setup: (instance: ElementInstance<Props, Events>) => Members;
    /** Whether the given `node` was created using this element defintion. */
    is: (node?: Node | null) => node is MaverickElement<Props, Events> & Members;
  }>;

export type InferHostElement<Definition extends AnyElementDefinition> = NonNullable<
  Definition[typeof HOST]
>;

export type MaverickElement<
  Props extends ElementPropRecord = ElementPropRecord,
  Events extends ElementEventRecord = ElementEventRecord,
> = HTMLElement & HostElement<Props, Events>;

export type HostElement<
  Props extends ElementPropRecord = ElementPropRecord,
  Events extends ElementEventRecord = ElementEventRecord,
> = {
  [HOST]: boolean;
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
};

export type MaverickElementConstructor<
  Props extends ElementPropRecord = ElementPropRecord,
  Events extends ElementEventRecord = ElementEventRecord,
  Members extends ElementMembers = ElementMembers,
> = Constructor<MaverickElement<Props, Events> & Members> & {
  readonly observedAttributes: string[];
};

export type ElementInstanceInit<Props extends ElementPropRecord = ElementPropRecord> = {
  props?: Readonly<Partial<Props>>;
  context?: ContextMap;
  children?: Observable<boolean>;
};

export type AnyElementInstance = ElementInstance<any, any>;

export type ElementInstance<
  Props extends ElementPropRecord = ElementPropRecord,
  Events extends ElementEventRecord = ElementEventRecord,
> = ElementLifecycleManager & {
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
} & {
  /** @internal */
  [PROPS]: Props;
  /** @internal */
  [MEMBERS]?: ElementMembers;
  /** @internal */
  [RENDER]?: () => JSX.Element;
};

export type ElementInstanceHost<
  Props extends ElementPropRecord = ElementPropRecord,
  Events extends ElementEventRecord = ElementEventRecord,
> = {
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
  el: MaverickElement<Props, Events> | null;
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
};

export interface ElementInstanceDispatcher<Events extends ElementEventRecord = ElementEventRecord> {
  <Type extends keyof Events>(
    type: Type,
    ...detail: Events[Type]['detail'] extends void | undefined
      ? [detail?: Events[Type]['detail'] | Partial<DOMEventInit<Events[Type]['detail']>>]
      : [detail: Events[Type]['detail'] | DOMEventInit<Events[Type]['detail']>]
  ): boolean;
}
