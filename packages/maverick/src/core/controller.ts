import type {
  ElementAttributesRecord,
  ElementCSSVarsRecord,
  ElementStylesRecord,
} from '../element/types';
import { DOMEvent, type DOMEventInit, listenEvent } from '../std/event';
import { noop } from '../std/unit';
import type { Component, ComponentConstructor, InferComponentProps } from './component';
import { Instance, type InstanceInit } from './instance';
import { type Dispose, effect, getScope, type Maybe, root, scoped, untrack } from './signals';
import type { Store } from './store';
import { ON_DISPATCH } from './symbols';
import type { ReadSignalRecord, TargetedEventHandler } from './types';

let currentInstance: Instance<any, any, any, any> | null = null;

export function createComponent<T extends Component>(
  Component: ComponentConstructor<T>,
  init?: InstanceInit<InferComponentProps<T>>,
) {
  return root(() => {
    currentInstance = new Instance(Component, getScope()!, init);
    const component = new Component();
    currentInstance = null;
    return component;
  });
}

export class Controller<Props = {}, State = {}, Events = {}, CSSVars = {}> {
  $!: Instance<Props, State, Events, CSSVars>;

  /**
   * The element this component is attached to. This is safe to use server-side with the
   * limited API listed below.
   *
   * **Important:** Only specific DOM APIs are safe to call server-side. This includes:
   *
   * - Attributes: `getAttribute`, `setAttribute`, `removeAttribute`, and `hasAttribute`
   * - Classes: `classList` API
   * - Styles: `style` API
   * - Events (noop): `addEventListener`, `removeEventListener`, and `dispatchEvent`
   */
  get el(): HTMLElement | null {
    return this.$._el;
  }

  /**
   * Reactive reference to attached element.
   *
   * @signal
   */
  get $el(): HTMLElement | null {
    return this.$.$el();
  }

  /**
   * Reactive component properties.
   */
  protected get $props(): ReadSignalRecord<Props> {
    return this.$._props;
  }

  /**
   * Reactive component state.
   */
  protected get $state(): Store<State> {
    return this.$._$state;
  }

  /**
   * A proxy to the internal component state.
   */
  get state(): Readonly<State> {
    return this.$._state;
  }

  constructor() {
    if (currentInstance) this.attach(currentInstance);
  }

  attach(instance: Instance<Props, State, Events, CSSVars>) {
    this.$ = instance;
    if (this.onAttach) instance._attachCallbacks.push(this.onAttach.bind(this));
    if (this.onConnect) instance._connectCallbacks.push(this.onConnect.bind(this));
    if (this.onDestroy) instance._destroyCallbacks.push(this.onDestroy.bind(this));
  }

  /**
   * The given callback is invoked when the component instance has attached to a host element.
   *
   * - This hook can run more than once as the component attaches/detaches from a host element.
   * - This hook may be called while the host element is not connected to the DOM yet.
   * - This hook is called both client-side and server-side.
   */
  protected onAttach?(el: HTMLElement): void;

  /**
   * The given callback is invoked when the host element has connected to the DOM.
   *
   * - This hook can run more than once as the host disconnects and re-connects to the DOM.
   * - If a function is returned it will be invoked when the host disconnects from the DOM.
   */
  protected onConnect?(el: HTMLElement): void;

  /**
   * The given callback is invoked when the component is destroyed.
   *
   * - This hook will only run once when the component is finally destroyed.
   * - This hook may be called before being attached to a host element.
   * - This hook is called both client-side and server-side.
   */
  protected onDestroy?(): void;

  /**
   * This method can be used to specify attributes that should be set on the host element. Any
   * attributes that are assigned to a function will be considered a signal and updated accordingly.
   */
  protected setAttributes(attributes: ElementAttributesRecord): void {
    if (!this.$._attrs) this.$._attrs = {};
    Object.assign(this.$._attrs, attributes);
  }

  /**
   * This method can be used to specify styles that should set be set on the host element. Any
   * styles that are assigned to a function will be considered a signal and updated accordingly.
   */
  protected setStyles(styles: ElementStylesRecord): void {
    if (!this.$._styles) this.$._styles = {};
    Object.assign(this.$._styles, styles);
  }

  /**
   * This method is used to satisfy the CSS variables contract specified on the current
   * component. Other CSS variables can be set via the `setStyles` method.
   */
  protected setCSSVars(vars: ElementCSSVarsRecord<CSSVars>): void {
    this.setStyles(vars as ElementStylesRecord);
  }

  /**
   * Type-safe utility for creating component DOM events.
   */
  protected createEvent<Type extends keyof Events = keyof Events>(
    type: Type & string,
    ...init: Events[Type] extends DOMEvent
      ? Events[Type]['detail'] extends void | undefined | never
        ? [init?: Partial<DOMEventInit<Events[Type]>['detail']>]
        : [init: DOMEventInit<Events[Type]['detail']>]
      : never
  ): Events[Type] {
    return new DOMEvent(type, init[0] as DOMEventInit) as Events[Type];
  }

  /* @internal */
  [ON_DISPATCH]?: ((event: Event) => void) | null = null;

  /**
   * Creates a `DOMEvent` and dispatches it from the host element. This method is typed to
   * match all component events.
   */
  protected dispatch<Type extends Event | keyof Events>(
    type: Type,
    ...init: Type extends keyof Events
      ? Events[Type] extends DOMEvent
        ? Events[Type]['detail'] extends void | undefined | never
          ? [init?: Partial<DOMEventInit<Events[Type]['detail']>>]
          : [init: DOMEventInit<Events[Type]['detail']>]
        : [init?: never]
      : [init?: never]
  ): boolean {
    if (__SERVER__ || !this.el) return false;

    const event =
      type instanceof Event ? type : new DOMEvent(type as string, init[0] as DOMEventInit);

    return untrack(() => {
      this[ON_DISPATCH]?.(event);
      return this.el!.dispatchEvent(event);
    });
  }

  /**
   * Adds an event listener for the given `type` and returns a function which can be invoked to
   * remove the event listener.
   *
   * - The listener is removed if the current scope is disposed.
   * - This method is safe to use on the server (noop).
   */
  protected listen<E = Events & HTMLElementEventMap, Type extends keyof E = keyof E>(
    type: Type & string,
    handler: TargetedEventHandler<HTMLElement, E[Type] & Event>,
    options?: AddEventListenerOptions | boolean,
  ): Dispose {
    if (__SERVER__ || !this.el) return noop;
    return listenEvent(this.el, type as any, handler, options);
  }

  /**
   * Subscribe to live updates of internal component state.
   */
  subscribe(callback: (state: Readonly<State>) => Maybe<Dispose>) {
    if (__DEV__ && !this.state) {
      const name = this.constructor.name;
      throw Error(`[maverick] component \`${name}\` is not subscribable`);
    }

    return scoped(() => effect(() => callback(this.state)), this.$._scope);
  }
}
