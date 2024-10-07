import { MaverickEvent, type MaverickEventInit } from '@maverick-js/std';

import { $$_current_instance, Instance } from './instance';
import { type Scope, untrack } from './signals';
import { ON_DISPATCH_SYMBOL } from './symbols';
import type { ReadSignalRecord, WriteSignalRecord } from './types';

export class ViewController<Props = {}, State = {}, Events = {}, CSSVars = {}> extends EventTarget {
  /** @internal */
  readonly $$: Instance<Props, State>;

  /** @internal type holder only */
  readonly $ts__events?: Events;
  /** @internal type holder only */
  readonly $ts__vars?: CSSVars;

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
    this.$$ = $$_current_instance!;
  }

  /**
   * Type-safe utility for creating component Maverick Events.
   */
  createEvent<Type extends keyof Events = keyof Events>(
    type: Type & string,
    ...init: Events[Type] extends MaverickEvent
      ? Events[Type]['detail'] extends void | undefined | never
        ? [init?: Partial<MaverickEventInit<Events[Type]>['detail']>]
        : [init: MaverickEventInit<Events[Type]['detail']>]
      : never
  ): Events[Type] {
    return new MaverickEvent(type, init[0] as MaverickEventInit) as Events[Type];
  }

  /**
   * Creates a `MaverickEvent` and dispatches it. This method is typed to match all component events.
   */
  dispatch<Type extends Event | keyof Events>(
    type: Type,
    ...init: Type extends Event
      ? [init?: never]
      : Type extends keyof Events
        ? Events[Type] extends MaverickEvent
          ? Events[Type]['detail'] extends void | undefined | never
            ? [init?: Partial<MaverickEventInit<Events[Type]['detail']>>]
            : [init: MaverickEventInit<Events[Type]['detail']>]
          : [init?: never]
        : [init?: never]
  ): boolean {
    if (__SERVER__) return false;
    return this.dispatchEvent(
      type instanceof Event
        ? type
        : new MaverickEvent(type as string, init[0] as MaverickEventInit),
    );
  }

  override dispatchEvent(event: Event): boolean {
    return untrack(() => {
      this.$$[ON_DISPATCH_SYMBOL]?.(event);
      return super.dispatchEvent(event);
    });
  }
}
