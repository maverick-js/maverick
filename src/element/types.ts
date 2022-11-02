import type { JSX, Observable, observable, SubjectRecord } from '../runtime';
import type { Constructor } from 'type-fest';
import type { DOMEventInit } from './event';
import type { ElementLifecycleManager } from './lifecycle';
import type { CSS } from './css';

export type AttributeValue = string | null;

export type ElementAttributeConverter<Value = unknown> = Readonly<{
  from: ((value: AttributeValue) => Value) | false;
  to?: (value: Value) => AttributeValue;
}>;

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
  readonly $render: () => JSX.Element;
};

export type ElementCSSVarsBuilder<
  Props extends ElementPropRecord = ElementPropRecord,
  CSSVars extends ElementCSSVarRecord = ElementCSSVarRecord,
> = (props: Readonly<Props>) => Partial<{
  [P in keyof CSSVars]: CSSVars[P] | Observable<CSSVars[P]>;
}>;

export type ElementContextMap = Map<string | symbol, unknown>;

export interface ElementDispatcher<Events extends ElementEventRecord = ElementEventRecord> {
  <Type extends keyof Events>(
    type: Type,
    detail?: Events[Type]['detail'] | DOMEventInit<Events[Type]['detail']>,
  ): boolean;
}

export type ElementSetup<
  Props extends ElementPropRecord = ElementPropRecord,
  Events extends ElementEventRecord = ElementEventRecord,
  CSSVars extends ElementCSSVarRecord = ElementCSSVarRecord,
  Members extends ElementMembers = ElementMembers,
> = (context: {
  host: MaverickHost<Props, CSSVars>;
  props: Readonly<Props>;
  dispatch: ElementDispatcher<Events>;
}) => (() => JSX.Element) | Members;

export type ElementSetupContext<
  Props extends ElementPropRecord = ElementPropRecord,
  CSSVars extends ElementCSSVarRecord = ElementCSSVarRecord,
> = {
  props?: Readonly<Props>;
  context?: ElementContextMap;
  children?: Observable<boolean>;
  onEventDispatch?: (eventType: string) => void;
};

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
   * A parent element definition. Custom Elements are islands and have no knowledge about each
   * other. When no host framework is available to ensure components are rendered in the correct
   * order (e.g., loading components out of order over a CDN), this field can be used to ensure
   * this component will only run it's setup function _after_ the parent is defined, connected,
   * and has also run it's respective setup function. In other words, wait for the given parent
   * element to be mounted.
   */
  parent?: ElementDefinition<any, any, any, any>;
  /**
   * The setup function is run once the custom element is ready to render. This function must
   * return a render function. Optionally, class members (i.e., props and methods) can be returned
   * which are assigned to the custom element.
   */
  setup: ElementSetup<Props, Events, CSSVars, Members>;
}>;

export type ElementDefinitionSetup<
  Props extends ElementPropRecord = ElementPropRecord,
  Events extends ElementEventRecord = ElementEventRecord,
  CSSVars extends ElementCSSVarRecord = ElementCSSVarRecord,
  Members extends ElementMembers = ElementMembers,
> = (context: {
  host: MaverickHost<Props, CSSVars>;
  props: Readonly<Props>;
  dispatch: ElementDispatcher<Events>;
  context?: ElementContextMap;
}) => Members;

export type ElementDefinition<
  Props extends ElementPropRecord = ElementPropRecord,
  Events extends ElementEventRecord = ElementEventRecord,
  CSSVars extends ElementCSSVarRecord = ElementCSSVarRecord,
  Members extends ElementMembers = ElementMembers,
> = Omit<ElementDeclaration<Props, Events, CSSVars, Members>, 'setup'> &
  Readonly<{
    /** @internal */
    setup: ElementDefinitionSetup<Props, Events, CSSVars, Members>;
    /**
     * Whether the given `node` was created using this element defintion.
     */
    is: (node?: Node | null) => node is MaverickElement<Props, CSSVars> & Members;
  }>;

export type MaverickElement<
  Props extends ElementPropRecord = ElementPropRecord,
  CSSVars extends ElementCSSVarRecord = ElementCSSVarRecord,
> = HTMLElement & Omit<MaverickHost<Props, CSSVars>, '$el'> & ElementLifecycleManager;

export type InferMaverickElement<Definition> = Definition extends ElementDefinition<
  infer Props,
  any,
  infer CSSVars,
  infer Members
>
  ? MaverickElement<Props, CSSVars> & Members
  : never;

export type MaverickElementConstructor<
  Props extends ElementPropRecord = ElementPropRecord,
  Events extends ElementEventRecord = ElementEventRecord,
  CSSVars extends ElementCSSVarRecord = ElementCSSVarRecord,
  Members extends ElementMembers = ElementMembers,
> = Constructor<MaverickElement<Props, CSSVars> & Members> & {
  readonly observedAttributes: string[];
  readonly $definition: ElementDefinition<Props, Events, CSSVars, Members>;
};

export type MaverickHost<
  Props extends ElementPropRecord = ElementPropRecord,
  CSSVars extends ElementCSSVarRecord = ElementCSSVarRecord,
> = Pick<
  HTMLElement,
  | 'getAttribute'
  | 'setAttribute'
  | 'hasAttribute'
  | 'removeAttribute'
  | 'dispatchEvent'
  | 'addEventListener'
  | 'removeEventListener'
> & {
  readonly classList: Pick<
    HTMLElement['classList'],
    'length' | 'add' | 'contains' | 'remove' | 'replace' | 'toggle' | 'toString'
  >;
  readonly style: Pick<
    HTMLElement['style'],
    'length' | 'getPropertyValue' | 'removeProperty' | 'setProperty'
  > & { toString(): string };
} & {
  /** @internal */
  readonly $$props: SubjectRecord<Props>;

  /**
   * Whether to keep this component alive until it's manually destroyed by calling the `$destroy`
   * method.
   *
   * @defaultValue false
   */
  $keepAlive: boolean;
  /**
   * The defined tag name. This is normalized to lower-case, use the native `tagName` property
   * for the browser defined name.
   */
  readonly $tagName: string;
  /**
   * The DOM element associated with this host. This is `null` server-side and during the setup
   * call client-side. This is a reactive observable call.
   */
  readonly $el: MaverickElement<Props, CSSVars> | null;
  /**
   * Whether the current element has connected to the DOM. This is a reactive observable call.
   */
  readonly $connected: boolean;
  /**
   * Whether the component has connected to the DOM and rendered content in its shadow root at
   * least once. This is a reactive observable call.
   */
  readonly $mounted: boolean;
  /**
   * Whether there is any child nodes in the light DOM, if `false` you can return fallback content.
   * This is a reactive observable call.
   */
  readonly $children: boolean;
  /**
   * Manually call the setup function when appropriate. The `data-delegate` attribute must
   * be present for `setup` to not be immediately called in the constructor.
   */
  $setup(context?: ElementSetupContext<Props, CSSVars>): () => void;
  /**
   * Permanently destroys the component.
   */
  $destroy(): void;
  /**
   * Register a callback to be invoked once this element has mounted the DOM.
   */
  $onMount(callback: () => unknown): void;
  /**
   * Register a callback to be invoked once this element has been destroyed.
   */
  $onDestroy(callback: () => unknown): void;
};
