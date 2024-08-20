import { DOMEvent, type DOMEventInit } from '@maverick-js/std';

import { currentInstance, Instance } from './instance';
import type { LifecycleHooks } from './lifecycle';
import { type Scope, untrack } from './signals';
import { ON_DISPATCH } from './symbols';
import type { ReadSignalRecord, WriteSignalRecord } from './types';

export class ViewController<Props = {}, State = {}, Events = {}, CSSVars = {}> extends EventTarget {
  /** @internal */
  $$!: Instance<Props, State>;

  /** @internal type holder only */
  $ts__events?: Events;
  /** @internal type holder only */
  $ts__vars?: CSSVars;

  get host(): HTMLElement | null {
    return this.$$.host;
  }

  get $host(): HTMLElement | null {
    return this.$$.$host();
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

  get $props(): ReadSignalRecord<Props> {
    return this.$$.props;
  }

  get $state(): WriteSignalRecord<State> {
    return this.$$.$state;
  }

  get state(): Readonly<State> {
    return this.$$.state;
  }

  constructor() {
    super();
    if (currentInstance) this.#attach(currentInstance);
  }

  #attach(instance: Instance<Props, State>) {
    this.$$ = instance;
    instance.addHooks(this as unknown as LifecycleHooks);
    return this;
  }

  /**
   * The given callback is invoked when the component is ready to be set up.
   *
   * - This hook will run once.
   * - It's safe to use context inside this hook.
   * - The host element has not attached yet - wait for `onAttach`.
   */
  protected onSetup?(): void;

  /**
   * The given callback is invoked when the component instance has attached to a host element.
   *
   * - This hook can run more than once as the component attaches/detaches from a host element.
   * - This hook may be called while the host element is not connected to the DOM yet.
   */
  protected onAttach?(host: HTMLElement): void;

  /**
   * The given callback is invoked when the host element has connected to the DOM.
   *
   * - This hook can run more than once as the host disconnects and re-connects to the DOM.
   */
  protected onConnect?(host: HTMLElement): void;

  /**
   * The given callback is invoked when the component is destroyed.
   *
   * - This hook will only run once when the component is finally destroyed.
   * - This hook may be called before being attached to a host element.
   * - This hook is called both client-side and server-side.
   */
  protected onDestroy?(): void;

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
   * Creates a `DOMEvent` and dispatches it. This method is typed to match all component events.
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
    if (__SERVER__) return false;
    return this.dispatchEvent(
      type instanceof Event ? type : new DOMEvent(type as string, init[0] as DOMEventInit),
    );
  }

  override dispatchEvent(event: Event): boolean {
    return untrack(() => {
      this.$$[ON_DISPATCH]?.(event);
      return super.dispatchEvent(event);
    });
  }
}
