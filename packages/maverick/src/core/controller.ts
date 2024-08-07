import type {
  ElementAttributesRecord,
  ElementCSSVarsRecord,
  ElementStylesRecord,
} from '../element/types';
import { DOMEvent, type DOMEventInit, listenEvent } from '../std/event';
import { noop } from '../std/unit';
import type { Component, ComponentConstructor, InferComponentProps } from './component';
import { type AnyInstance, Instance, type InstanceInit, type LifecycleHooks } from './instance';
import { type Dispose, getScope, root, type Scope, untrack } from './signals';
import { ON_DISPATCH } from './symbols';
import type { ReadSignalRecord, TargetedEventHandler, WriteSignalRecord } from './types';

// Match component interface.
let currentInstance: { $$: AnyInstance | null } = { $$: null };

export function createComponent<T extends Component>(
  Component: ComponentConstructor<T>,
  init?: InstanceInit<InferComponentProps<T>>,
) {
  return root(() => {
    currentInstance.$$ = new Instance(Component, getScope()!, init);
    const component = new Component();
    currentInstance.$$.component = component;
    currentInstance.$$ = null;
    return component;
  });
}

export class ViewController<Props = {}, State = {}, Events = {}, CSSVars = {}> extends EventTarget {
  /** @internal */
  $$!: Instance<Props, State, Events, CSSVars>;

  get el(): HTMLElement | null {
    return this.$$.el;
  }

  get $el(): HTMLElement | null {
    return this.$$.$el();
  }

  get scope(): Scope {
    return this.$$.scope!;
  }

  get attachScope(): Scope | null {
    return this.$$.attachScope;
  }

  get connectScope(): Scope | null {
    return this.$$.connectScope;
  }

  /** @internal */
  get $props(): ReadSignalRecord<Props> {
    return this.$$.props;
  }

  /** @internal */
  get $state(): WriteSignalRecord<State> {
    return this.$$.$state;
  }

  get state(): Readonly<State> {
    return this.$$.state;
  }

  constructor() {
    super();
    if (currentInstance.$$) this.attach(currentInstance as { $$: AnyInstance });
  }

  attach({ $$ }: { $$: Instance<Props, State, Events, CSSVars> }) {
    this.$$ = $$;
    $$.addHooks(this as unknown as LifecycleHooks);
    return this;
  }

  override addEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions | undefined,
  ): void {
    if (__DEV__ && !this.el) {
      const name = this.constructor.name;
      console.warn(`[maverick] adding event listener to \`${name}\` before element is attached`);
    }

    this.listen(type as any, callback as any, options);
  }

  override removeEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject | null,
    options?: boolean | EventListenerOptions | undefined,
  ): void {
    this.el?.removeEventListener(type, callback as any, options);
  }

  /**
   * The given callback is invoked when the component is ready to be set up.
   *
   * - This hook will run once.
   * - This hook is called both client-side and server-side.
   * - It's safe to use context inside this hook.
   * - The host element has not attached yet - wait for `onAttach`.
   */
  protected onSetup?(): void;

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
    if (!this.$$.attrs) this.$$.attrs = {};
    Object.assign(this.$$.attrs, attributes);
  }

  /**
   * This method can be used to specify styles that should set be set on the host element. Any
   * styles that are assigned to a function will be considered a signal and updated accordingly.
   */
  protected setStyles(styles: ElementStylesRecord): void {
    if (!this.$$.styles) this.$$.styles = {};
    Object.assign(this.$$.styles, styles);
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
  createEvent<Type extends keyof Events = keyof Events>(
    type: Type & string,
    ...init: Events[Type] extends DOMEvent
      ? Events[Type]['detail'] extends void | undefined | never
        ? [init?: Partial<DOMEventInit<Events[Type]>['detail']>]
        : [init: DOMEventInit<Events[Type]['detail']>]
      : never
  ): Events[Type] {
    return new DOMEvent(type, init[0] as DOMEventInit) as Events[Type];
  }

  /**
   * Creates a `DOMEvent` and dispatches it from the host element. This method is typed to
   * match all component events.
   */
  dispatch<Type extends Event | keyof Events>(
    type: Type,
    ...init: Type extends Event
      ? [init?: never]
      : Type extends keyof Events
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

    Object.defineProperty(event, 'target', {
      get: () => this.$$.component,
    });

    return untrack(() => {
      this.$$[ON_DISPATCH]?.(event);
      return this.el!.dispatchEvent(event);
    });
  }

  override dispatchEvent(event: Event): boolean {
    return this.dispatch(event);
  }

  /**
   * Adds an event listener for the given `type` and returns a function which can be invoked to
   * remove the event listener.
   *
   * - The listener is removed if the current scope is disposed.
   * - This method is safe to use on the server (noop).
   */
  listen<E = Events & HTMLElementEventMap, Type extends keyof E = keyof E>(
    type: Type & string,
    handler: TargetedEventHandler<HTMLElement, E[Type] & Event>,
    options?: AddEventListenerOptions | boolean,
  ): Dispose {
    if (__SERVER__ || !this.el) return noop;
    return listenEvent(this.el, type as any, handler, options);
  }
}
