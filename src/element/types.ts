import type { JSX, Observable, observable, SubjectRecord } from '../runtime';
import type { Constructor } from 'type-fest';
import type { DOMEventInit } from './event';
import type { ElementLifecycleManager } from './lifecycle';

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
  [name: string]: any;
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
  tagName: `${string}-${string}`;
  props?: ElementPropDefinitions<Props>;
  events?: Partial<Events>;
  cssvars?: Partial<CSSVars> | ElementCSSVarsBuilder<Props, CSSVars>;
  setup: ElementSetup<Props, Events, CSSVars, Members>;
  shadowRoot?: true | ShadowRootInit;
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
    setup: ElementDefinitionSetup<Props, Events, CSSVars, Members>;
  }>;

export type MaverickElement<
  Props extends ElementPropRecord = ElementPropRecord,
  CSSVars extends ElementCSSVarRecord = ElementCSSVarRecord,
> = HTMLElement & Omit<MaverickHost<Props, CSSVars>, '$el'> & ElementLifecycleManager;

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
   * call client-side.
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
};
