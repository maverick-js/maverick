import type { JSX } from '../runtime';

const MAVERICK_EVENT = Symbol('MAVERICK_EVENT');

export type MaverickEventInit<Detail = unknown> = EventInit & {
  readonly detail?: Detail;
  readonly triggerEvent?: Event;
};

const DOMEvent: Event = __NODE__ ? (class Event {} as any) : Event;

export class MaverickEvent<Detail = unknown> extends DOMEvent {
  /**
   * The event detail.
   */
  readonly detail?: Detail;

  /**
   * The preceding event that was responsible for this event being fired.
   */
  readonly triggerEvent?: Event;

  /**
   * Walks up the event chain (following each `triggerEvent`) and returns the origin event
   * that started the chain.
   */
  readonly originEvent!: Event;

  /**
   * Walks up the event chain (following each `triggerEvent`) and determines whether the initial
   * event was triggered by the end user (ie: check whether `isTrusted` on the `originEvent` `true`).
   */
  readonly isOriginTrusted!: boolean;

  constructor(type: string, eventInit: MaverickEventInit<Detail> = {}) {
    super(type, eventInit);

    this[MAVERICK_EVENT] = true;

    defineEventProperty(this, 'detail', () => eventInit.detail);
    defineEventProperty(this, 'triggerEvent', () => eventInit.triggerEvent);
    defineEventProperty(this, 'originEvent', () => getOriginEvent(this) ?? this);
    defineEventProperty(this, 'isOriginTrusted', () => getOriginEvent(this)?.isTrusted ?? false);
  }
}

export function isMaverickEvent(event: Event | undefined): event is MaverickEvent<unknown> {
  return !!event?.[MAVERICK_EVENT];
}

/**
 * Walks up the event chain (following each `triggerEvent`) and returns the origin event
 * that started the chain.
 */
export function getOriginEvent(event: MaverickEvent): Event | undefined {
  let triggerEvent = event.triggerEvent as MaverickEvent;

  while (triggerEvent && triggerEvent.triggerEvent) {
    triggerEvent = triggerEvent.triggerEvent as MaverickEvent;
  }

  return triggerEvent;
}

/**
 * Walks an event chain on a given `event`, and invokes the given `callback` for each
 * trigger event.
 *
 * @param event - The event on which to follow the chain.
 * @param callback - Invoked for each trigger event in the chain. If a `value` is returned by
 * this callback, the walk will end and `[event, value]` will be returned.
 */
export function walkTriggerEventChain<T>(
  event: Event,
  callback: (event: Event) => NonNullable<T> | void,
): [event: Event, value: NonNullable<T>] | undefined {
  if (!isMaverickEvent(event)) return;

  let triggerEvent = event.triggerEvent as MaverickEvent;

  while (triggerEvent) {
    const returnValue = callback(triggerEvent);
    if (returnValue) return [triggerEvent, returnValue];
    triggerEvent = triggerEvent.triggerEvent as MaverickEvent;
  }

  return;
}

/**
 * Attempts to find a trigger event with a given `eventType` on the event chain.
 *
 * @param event - The event on which to look for a trigger event.
 * @param type - The type of event to find.
 */
export function findTriggerEvent<Type extends string>(
  event: Event,
  type: Type,
): (Type extends keyof JSX.GlobalOnAttributes ? JSX.GlobalOnAttributes[Type] : Event) | undefined {
  return walkTriggerEventChain(event, (e) => e.type === type)?.[0] as any;
}

/**
 * Whether a trigger event with the given `eventType` exists can be found in the event chain.
 *
 * @param event - The event on which to look for a trigger event.
 * @param type - The type of event to find.
 */
export function hasTriggerEvent(event: Event, type: string): boolean {
  return !!findTriggerEvent(event, type);
}

/**
 * Appends the given `triggerEvent` to the event chain. This means the new origin event will be
 * the origin of the given `triggerEvent`, or the `triggerEvent` itself (if no chain exists on the
 * trigger).
 *
 * @param event - The event on which to extend the trigger event chain.
 * @param triggerEvent - The trigger event that will becoming the new origin event.
 */
export function appendTriggerEvent(event: MaverickEvent, triggerEvent?: Event) {
  const origin = (getOriginEvent(event) ?? event) as MaverickEvent;
  defineEventProperty(origin, 'triggerEvent', () => triggerEvent);
}

function defineEventProperty<T extends keyof MaverickEvent>(
  event: MaverickEvent,
  prop: T,
  value: () => MaverickEvent[T],
) {
  Object.defineProperty(event, prop, {
    enumerable: true,
    configurable: true,
    get: value,
  });
}

export type InferEventDetail<Event> = Event extends MaverickEvent<infer Detail>
  ? Detail
  : Event extends CustomEvent<infer Detail>
  ? Detail
  : never;

export type InferEventInit<Event> = MaverickEventInit<InferEventDetail<Event>>;
