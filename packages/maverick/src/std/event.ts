import type { Constructor } from 'type-fest';

import type { HTMLCustomElement } from '../element/types';
import { type Dispose, type JSX, onDispose } from '../runtime';
import { noop } from './unit';

const DOM_EVENT = Symbol('DOM_EVENT'),
  DOMEventBase: Constructor<Event> = __SERVER__ ? (class Event {} as any) : Event;

export interface DOMEventInit<Detail = unknown> extends EventInit {
  readonly detail: Detail;
  readonly trigger?: Event;
}

export class DOMEvent<Detail = unknown> extends DOMEventBase {
  [DOM_EVENT] = true;

  /**
   * The event detail.
   */
  readonly detail!: Detail;

  /**
   * The preceding event that was responsible for this event being fired.
   */
  readonly trigger?: Event;

  /**
   * Walks up the event chain (following each `trigger`) and returns the origin event
   * that started the chain.
   */
  get originEvent() {
    return getOriginEvent(this) ?? this;
  }

  /**
   * Walks up the event chain (following each `trigger`) and determines whether the initial
   * event was triggered by the end user (ie: check whether `isTrusted` on the `originEvent` `true`).
   */
  get isOriginTrusted() {
    return getOriginEvent(this)?.isTrusted ?? false;
  }

  constructor(
    type: string,
    ...init: Detail extends void | undefined | never
      ? [init?: Partial<DOMEventInit<Detail>>]
      : [init: DOMEventInit<Detail>]
  ) {
    super(type, init[0]);
    this.detail = init[0]?.detail!;
    this.trigger = init[0]?.trigger;
  }
}

/**
 * Creates a `DOMEvent` and dispatches it from the given `target`. This function is typed to
 * match all events declared on the given `target` (must be a `HTMLCustomElement`).
 */
export function dispatchEvent<
  Target extends EventTarget,
  Events = Target extends HTMLCustomElement<any, infer ElementEvents>
    ? ElementEvents
    : Record<string, DOMEventInit>,
  EventType extends keyof Events = keyof Events,
>(
  target: Target | null,
  event: EventType,
  ...init: InferEventDetail<Events[EventType]> extends void | undefined | never
    ? [init?: Partial<InferEventInit<Events[EventType]>>]
    : [init: InferEventInit<Events[EventType]>]
): boolean {
  if (__SERVER__) return false;
  return target
    ? target.dispatchEvent(new DOMEvent(event as string, init[0] as DOMEventInit))
    : false;
}

/**
 * Whether the given `event` is a Maverick DOM Event class.
 */
export function isDOMEvent(event?: Event | null): event is DOMEvent<unknown> {
  return !!event?.[DOM_EVENT];
}

/**
 * Walks up the event chain (following each `trigger`) and returns the origin event that
 * started the chain.
 */
export function getOriginEvent(event: DOMEvent): Event | undefined {
  let trigger = event.trigger as DOMEvent;

  while (trigger && trigger.trigger) {
    trigger = trigger.trigger as DOMEvent;
  }

  return trigger;
}

/**
 * Walks an event chain on a given `event`, and invokes the given `callback` for each trigger event.
 *
 * @param event - The event on which to follow the chain.
 * @param callback - Invoked for each trigger event in the chain. If a `value` is returned by
 * this callback, the walk will end and `[event, value]` will be returned.
 */
export function walkTriggerEventChain<T>(
  event: Event,
  callback: (event: Event) => NonNullable<T> | void,
): [event: Event, value: NonNullable<T>] | undefined {
  if (!isDOMEvent(event)) return;

  let trigger = event.trigger as DOMEvent;

  while (trigger) {
    const returnValue = callback(trigger);
    if (returnValue) return [trigger, returnValue];
    trigger = trigger.trigger as DOMEvent;
  }

  return;
}

/**
 * Attempts to find a trigger event with a given `eventType` on the event chain.
 *
 * @param event - The event on which to look for a trigger event.
 * @param type - The type of event to find.
 */
export function findTriggerEvent(event: Event, type: string): Event | undefined {
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
 * Appends the given `trigger` to the event chain. This means the new origin event will be
 * the origin of the given `trigger`, or the `trigger` itself (if no chain exists on the
 * trigger).
 *
 * @param event - The event on which to extend the trigger event chain.
 * @param trigger - The trigger event that will becoming the new origin event.
 */
export function appendTriggerEvent(event: DOMEvent, trigger?: Event) {
  const origin = (getOriginEvent(event) as DOMEvent) ?? event;

  if (origin === trigger) {
    throw Error(
      __DEV__ ? '[maverick] attemping to append event as a trigger on itself (cyclic)' : '',
    );
  }

  if (__DEV__ && typeof origin.trigger !== 'undefined') {
    console.warn(
      `[maverick] overwriting existing trigger event: \`${origin.trigger.type}\` -> \`${trigger?.type}\`\n\n`,
      'Event:\n',
      event,
      'Origin Event:\n',
      origin,
      'Trigger Event:\n',
      trigger,
    );
  }

  Object.defineProperty(origin, 'trigger', {
    enumerable: true,
    configurable: true,
    get: () => trigger,
  });
}

export type InferEventDetail<T> = T extends DOMEventInit<infer Detail>
  ? Detail
  : T extends DOMEvent<infer Detail>
  ? Detail
  : unknown;

export type InferEventInit<T> = T extends Constructor<DOMEvent>
  ? DOMEventInit<InferEventDetail<InstanceType<T>>>
  : T extends DOMEvent
  ? DOMEventInit<InferEventDetail<T>>
  : T extends DOMEventInit
  ? T
  : DOMEventInit<unknown>;

/**
 * Adds an event listener for the given `type` and returns a function which can be invoked to
 * remove the event listener.
 *
 * - The listener is removed if the current scope is disposed.
 * - This function is safe to use on the server (noop).
 */
export function listenEvent<
  Target extends EventTarget,
  Events = Target extends HTMLCustomElement<any, infer Events>
    ? Events & MaverickOnAttributes
    : MaverickOnAttributes,
  EventType extends keyof Events = keyof Events,
>(
  target: Target,
  type: EventType,
  handler: JSX.TargetedEventHandler<
    Target,
    Events[EventType] extends Event ? Events[EventType] : Event
  >,
  options?: AddEventListenerOptions | boolean,
): Dispose {
  if (__SERVER__) return noop;
  target.addEventListener(type as string, handler as any, options);
  return onDispose(() => target.removeEventListener(type as string, handler as any, options));
}

export function isPointerEvent(event: Event | undefined): event is PointerEvent {
  return !!event?.type.startsWith('pointer');
}

export function isTouchEvent(event: Event | undefined): event is TouchEvent {
  return !!event?.type.startsWith('touch');
}

export function isMouseEvent(event: Event | undefined): event is MouseEvent {
  return /^(click|mouse)/.test(event?.type ?? '');
}

export function isKeyboardEvent(event: Event | undefined): event is KeyboardEvent {
  return !!event?.type.startsWith('key');
}

export function wasEnterKeyPressed(event: Event | undefined) {
  return isKeyboardEvent(event) && event.key === 'Enter';
}

export function wasEscapeKeyPressed(event: Event | undefined) {
  return isKeyboardEvent(event) && event.key === 'Escape';
}

export function isKeyboardClick(event: Event | undefined) {
  return isKeyboardEvent(event) && (event.key === 'Enter' || event.key === ' ');
}
