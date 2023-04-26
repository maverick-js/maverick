import type { Dispose, InferStoreRecord, JSX, ReadSignalRecord } from '../runtime';
import {
  DOMEvent,
  type DOMEventInit,
  type InferEventDetail,
  type InferEventInit,
  listenEvent,
} from '../std/event';
import { noop } from '../std/unit';
import type {
  ComponentAPI,
  DefaultComponentAPI,
  InferComponentCSSProps,
  InferComponentEvents,
  InferComponentProps,
  InferComponentStore,
} from './component';
import type { ComponentInstance } from './instance';
import { INSTANCE } from './internal';

export class ComponentController<API extends ComponentAPI = DefaultComponentAPI> {
  /** @internal type only */
  ts__api?: API;

  readonly [INSTANCE]: ComponentInstance<API>;

  /**
   * The custom element this component is attached to. This is safe to use server-side with the
   * limited API listed below.
   *
   * **Important:** Only specific DOM APIs are safe to call server-side. This includes:
   *
   * - Attributes: `getAttribute`, `setAttribute`, `removeAttribute`, and `hasAttribute`
   * - Classes: `classList` API
   * - Styles: `style` API
   * - Events (noop): `addEventListener`, `removeEventListener`, and `dispatchEvent`
   */
  protected get el(): HTMLElement | null {
    return this[INSTANCE]._el;
  }

  /**
   * Reactive component properties.
   */
  protected get $props(): ReadSignalRecord<InferComponentProps<API>> {
    return this[INSTANCE]._props;
  }

  /**
   * Reactive component store.
   */
  protected get $store(): ReadSignalRecord<InferStoreRecord<InferComponentStore<API>>> {
    return this[INSTANCE]._store;
  }

  constructor(instance: ComponentInstance<API>) {
    this[INSTANCE] = instance;
    if (this.onAttach) instance._attachCallbacks.push(this.onAttach.bind(this));
    if (this.onConnect) instance._connectCallbacks.push(this.onConnect.bind(this));
    if (this.onDisconnect) instance._disconnectCallbacks.push(this.onDisconnect.bind(this));
    if (this.onDestroy) instance._destroyCallbacks.push(this.onDestroy.bind(this));
  }

  /**
   * The given callback is invoked when the component instance has attached to a host element.
   *
   * - This hook will only run once when the component is attached.
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
   * The given callback is invoked when the host element has disconnected from the DOM.
   *
   * - This hook can run more than once as the host disconnects and re-connects to the DOM.
   */
  protected onDisconnect?(el: HTMLElement): void;

  /**
   * The given callback is invoked when the component is destroyed.
   *
   * - This hook will only run once when the component is destroyed.
   * - This hook may be called while the host element is not connected to the DOM yet.
   * - This hook is called both client-side and server-side.
   */
  protected onDestroy?(el: HTMLElement): void;

  /**
   * This method can be used to specify attributes that should be set on the host element. Any
   * attributes that are assigned to a function will be considered a signal and updated accordingly.
   */
  protected setAttributes(attributes: ElementAttributesRecord): void {
    if (this[INSTANCE]._attrs) Object.assign(this[INSTANCE]._attrs, attributes);
  }

  /**
   * This method can be used to specify styles that should set be set on the host element. Any
   * styles that are assigned to a function will be considered a signal and updated accordingly.
   */
  protected setStyles(styles: ElementStylesRecord): void {
    if (this[INSTANCE]._styles) Object.assign(this[INSTANCE]._styles!, styles);
  }

  /**
   * Type-safe utility for creating component DOM events.
   */
  protected createEvent<
    Events = InferComponentEvents<API>,
    Type extends keyof Events = keyof Events,
  >(
    type: Type & string,
    ...init: InferEventDetail<Events[Type]> extends void | undefined | never
      ? [init?: Partial<InferEventInit<Events[Type]>>]
      : [init: InferEventInit<Events[Type]>]
  ): Events[Type] {
    return new DOMEvent(type, init[0] as DOMEventInit) as Events[Type];
  }

  /**
   * Creates a `DOMEvent` and dispatches it from the host element. This method is typed to
   * match all component events.
   */
  protected dispatch<Events = InferComponentEvents<API>, Type extends keyof Events = keyof Events>(
    type: Type & string,
    ...init: InferEventDetail<Events[Type]> extends void | undefined | never
      ? [init?: Partial<InferEventInit<Events[Type]>>]
      : [init: InferEventInit<Events[Type]>]
  ): void {
    if (__SERVER__ || !this.el) return;
    const event = new DOMEvent(type, init[0] as DOMEventInit);
    this.el.dispatchEvent(event);
  }

  /**
   * Adds an event listener for the given `type` and returns a function which can be invoked to
   * remove the event listener.
   *
   * - The listener is removed if the current scope is disposed.
   * - This method is safe to use on the server (noop).
   */
  protected listen<
    Events = InferComponentEvents<API> & MaverickOnAttributes,
    Type extends keyof Events = keyof Events,
  >(
    type: Type & string,
    handler: JSX.TargetedEventHandler<
      HTMLElement,
      Events[Type] extends Event ? Events[Type] : Event
    >,
    options?: AddEventListenerOptions | boolean,
  ): Dispose {
    if (__SERVER__ || !this.el) return noop;
    return listenEvent(this.el, type, handler, options);
  }
}

export interface ElementAttributesRecord
  extends JSX.ObservableRecord<JSX.HTMLAttrs>,
    JSX.ObservableRecord<JSX.ARIAAttributes>,
    JSX.ObservableRecord<JSX.AttrsRecord> {}

export interface ElementStylesRecord extends JSX.ObservableRecord<JSX.CSSStyles> {}

export type ElementCSSVarsRecord<CSSVars> = {
  [Var in keyof CSSVars as `--${Var & string}`]: JSX.Observable<CSSVars[Var]>;
};
