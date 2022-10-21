import type { JSX, ObservableSubject } from '../runtime';
import type { Constructor } from '../utils/types';
import type { InferEventInit } from './event';
import type { ElementLifecycleManager } from './lifecycle';

export type AttributeValue = string | null;

export type AttributeTransformer<Value = unknown> = Readonly<{
  from: ((value: AttributeValue) => Value) | false;
  to?: (value: Value) => AttributeValue;
}>;

export type ElementPropDefinition<Value = unknown> = Readonly<{
  /** The properties initial value. */
  initialValue: Value;
  /** Whether the property is associated with an attribute, or a custom name for the associated attribute. */
  attribute?: string | false;
  /** Whether the property value should be reflected back to the attribute (default: false). */
  reflect?: boolean;
  /** Transform an attribute value to property value. */
  transform?: AttributeTransformer<Value>;
}>;

export type ElementPropDefinitions<Props extends ElementProps = ElementProps> = Readonly<{
  [Prop in keyof Props]: ElementPropDefinition<Props[Prop]>;
}>;

export type ElementProps = Readonly<{
  [name: string]: any;
}>;

export type ObservableElementProps<Props extends ElementProps> = Readonly<{
  [Prop in keyof Props]: ObservableSubject<Props[Prop]>;
}>;

export type ElementMembers = {
  [name: string]: unknown;
  readonly $render: () => JSX.Element;
};

export type ElementContextMap = Map<string | symbol, unknown>;

export interface ElementDispatcher<Events = JSX.GlobalOnAttributes> {
  (event: Events[keyof Events]): boolean;
  <Type extends keyof Events>(type: Type, init: InferEventInit<Events[Type]>): boolean;
}

export type ElementSetup<
  Props extends ElementProps = ElementProps,
  Events = JSX.GlobalOnAttributes,
  Members extends ElementMembers = ElementMembers,
> = (context: {
  host: MaverickElement;
  props: Readonly<Props>;
  dispatch: ElementDispatcher<Events>;
  ssr: boolean;
}) => (() => JSX.Element) | Members;

export type ElementSetupContext<Props extends ElementProps = ElementProps> = {
  props?: ObservableElementProps<Props>;
  context?: ElementContextMap;
  children?: ObservableSubject<boolean>;
  onEventDispatch?: (eventType: string) => void;
};

export type ElementDeclaration<
  Props extends ElementProps = ElementProps,
  Events = JSX.GlobalOnAttributes,
  Members extends ElementMembers = ElementMembers,
> = Readonly<{
  tagName: `${string}-${string}`;
  props?: ElementPropDefinitions<Props>;
  setup: ElementSetup<Props, Events, Members>;
  shadow?: true | ShadowRootInit;
}>;

export type DefinedElementSetup<
  Props extends ElementProps = ElementProps,
  Events = JSX.GlobalOnAttributes,
  Members extends ElementMembers = ElementMembers,
> = (context: {
  host: MaverickElement;
  props: Readonly<Props>;
  dispatch: ElementDispatcher<Events>;
  context?: ElementContextMap;
  ssr: boolean;
}) => Members;

export type ElementDefinition<
  Props extends ElementProps = ElementProps,
  Events = JSX.GlobalOnAttributes,
  Members extends ElementMembers = ElementMembers,
> = Omit<ElementDeclaration<Props, Events, Members>, 'setup'> &
  Readonly<{
    id: symbol;
    setup: DefinedElementSetup<Props, Events, Members>;
  }>;

export type MaverickElement<
  Props extends ElementProps = ElementProps,
  Members extends ElementMembers = ElementMembers,
> = Members & HTMLElement & MaverickHost<Props> & ElementLifecycleManager;

export type MaverickHost<Props extends ElementProps = ElementProps> = {
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
   * Whether the current element has connected to the DOM. This is a reactive observable call.
   */
  readonly $connected: boolean;
  /**
   * Whether the component has connected to the DOM and rendered content in its shadow root at
   * least once. This is a reactive observable call.
   */
  readonly $mounted: boolean;
  /**
   * Whether there is any children being provided by the user, if `false` you can return fallback
   * content. This is a reactive observable call.
   */
  readonly $children: boolean;
  /**
   * Manually call the setup function when appropriate. The `data-delegate` attribute must
   * be present for `setup` to not be immediately called in the constructor.
   */
  $setup(context: ElementSetupContext<Props>): () => void;
  /**
   * Permanently destroys the component.
   */
  $destroy(): void;
};

export type MaverickElementConstructor<
  Props extends ElementProps = ElementProps,
  Events = JSX.GlobalOnAttributes,
  Members extends ElementMembers = ElementMembers,
> = Constructor<MaverickElement<Props, Members>> & {
  /** @internal */
  readonly $definition: ElementDeclaration<Props, Events, Members>;
};
