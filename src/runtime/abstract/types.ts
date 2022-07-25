import type { HTMLTaggedTemplate } from './template';
import type { AbstractContext } from './context';

export type ComponentProps = { [propName: string]: any };
export type ComponentEvents = { [eventType: string]: any };
export type ComponentSlots = { [slotName: string]: any };
export type ComponentMembers = { [propName: string]: any; $render?: () => HTMLTaggedTemplate };
export type ComponentPublicMembers<T extends ComponentMembers> = Omit<T, '$render'>;
export type ComponentLifecycleHook = () => unknown;

export type AbstractRef<T extends Element = Element> = (element: T | null) => void;

export type AbstractComponent<
  Props extends ComponentProps = ComponentProps,
  Events extends ComponentEvents = ComponentEvents,
  Slots extends ComponentSlots = ComponentSlots,
  Members extends ComponentMembers = ComponentMembers,
  InitialProps extends ComponentProps = ComponentProps,
> = {
  name: string;
  initialProps?: InitialProps;
  createInstance: (
    bridge: AbstractComponentBridge<Props, Events, Slots>,
  ) => AbstractComponentInstance<Members>;
};

export type AbstractComponentInstance<Members extends ComponentMembers = ComponentMembers> = {
  members?: Members;
  /** connected */
  $c(): void;
  /** before update */
  $bu(): void;
  /** mounted */
  $m(): void;
  /** after update */
  $au(): void;
  /** disconnect */
  $d(): void;
  /** destroy */
  $dy(): void;
  /** render */
  $r(): HTMLTaggedTemplate;
};

export type AbstractComponentSetup<
  Props extends ComponentProps = ComponentProps,
  Events extends ComponentEvents = ComponentEvents,
  Slots extends ComponentSlots = ComponentSlots,
  Members extends ComponentMembers = ComponentMembers,
> = (bridge: AbstractComponentBridge<Props, Events, Slots>) => (() => HTMLTaggedTemplate) | Members;

export type AbstractComponentBridge<
  Props extends ComponentProps = ComponentProps,
  Events extends ComponentEvents = ComponentEvents,
  Slots extends ComponentSlots = ComponentSlots,
> = {
  props: Props;

  slots: keyof Slots extends never
    ? Record<string, () => any>
    : { [Name in keyof Slots]: () => any };

  context: {
    provide<T>(context: AbstractContext<T>, value: T): void;
    consume<T>(context: AbstractContext<T>): T;
  };

  dispatch<P extends keyof Events>(type: P, detail?: Events[P]);
};
