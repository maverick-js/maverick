import type { Constructor } from 'type-fest';

const EVENT: Constructor<Event> = __SERVER__ ? (class Event {} as any) : Event,
  DOM_EVENT = Symbol('DOM_EVENT');

export interface DOMEventInit<Detail = unknown> extends EventInit {
  readonly detail: Detail;
  readonly trigger?: Event;
}

export class DOMEvent<Detail = unknown> extends EVENT {
  [DOM_EVENT] = true;

  /**
   * The event detail.
   */
  readonly detail!: Detail;

  /**
   * The event trigger chain.
   */
  readonly triggers = new EventTriggers();

  /**
   * The preceding event that was responsible for this event being fired.
   */
  get trigger(): Event | undefined {
    return this.triggers.source;
  }

  /**
   * The origin event that lead to this event being fired.
   */
  get originEvent() {
    return this.triggers.origin;
  }

  /**
   * Whether the origin event was triggered by the user.
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Event/isTrusted}
   */
  get isOriginTrusted() {
    return this.triggers.origin?.isTrusted ?? false;
  }

  constructor(
    type: string,
    ...init: Detail extends void | undefined | never
      ? [init?: Partial<DOMEventInit<Detail>>]
      : [init: DOMEventInit<Detail>]
  ) {
    super(type, init[0]);
    this.detail = init[0]?.detail!;

    const trigger = init[0]?.trigger;
    if (trigger) this.triggers.add(trigger);
  }
}

export class EventTriggers implements Iterable<Event> {
  readonly chain: Event[] = [];

  get source(): Event | undefined {
    return this.chain[0];
  }

  get origin(): Event | undefined {
    return this.chain[this.chain.length - 1];
  }

  /**
   * Appends the event to the end of the chain.
   */
  add(event: Event): void {
    this.chain.push(event);
    if (isDOMEvent(event)) {
      this.chain.push(...event.triggers);
    }
  }

  /**
   * Removes the event from the chain and returns it (if found).
   */
  remove(event: Event): Event | undefined {
    return this.chain.splice(this.chain.indexOf(event), 1)[0];
  }

  /**
   * Returns whether the chain contains the given `event`.
   */
  has(event: Event): boolean {
    return this.chain.some((e) => e === event);
  }

  /**
   * Returns whether the chain contains the given event type.
   */
  hasType(type: string): boolean {
    return !!this.findType(type);
  }

  /**
   * Returns the first event with the given `type` found in the chain.
   */
  findType(type: string): Event | undefined {
    return this.chain.find((e) => e.type === type);
  }

  /**
   * Walks an event chain on a given `event`, and invokes the given `callback` for each trigger event.
   */
  walk<T>(
    callback: (event: Event) => NonNullable<T> | void,
  ): [event: Event, value: NonNullable<T>] | undefined {
    for (const event of this.chain) {
      const returnValue = callback(event);
      if (returnValue) return [event, returnValue];
    }
  }

  [Symbol.iterator](): Iterator<Event> {
    return this.chain.values();
  }
}

/**
 * Whether the given `event` is a `DOMEvent` class.
 */
export function isDOMEvent(event?: Event | null): event is DOMEvent<unknown> {
  return !!event?.[DOM_EVENT];
}

/**
 * Walks up the event chain (following each `trigger`) and returns the origin event that
 * started the chain.
 * @deprecated - Use `event.originEvent`
 */
export function getOriginEvent(event: DOMEvent): Event | undefined {
  return event.originEvent;
}

/**
 * Walks an event chain on a given `event`, and invokes the given `callback` for each trigger event.
 * @deprecated - Use `event.triggers.walk(callback)`
 */
export function walkTriggerEventChain<T>(
  event: Event,
  callback: (event: Event) => NonNullable<T> | void,
): [event: Event, value: NonNullable<T>] | undefined {
  if (!isDOMEvent(event)) return;
  return event.triggers.walk(callback);
}

/**
 * Attempts to find a trigger event with a given `eventType` on the event chain.
 * @deprecated - Use `event.triggers.findType('')`
 */
export function findTriggerEvent(event: Event, type: string): Event | undefined {
  return isDOMEvent(event) ? event.triggers.findType(type) : undefined;
}

/**
 * Whether a trigger event with the given `eventType` exists can be found in the event chain.
 * @deprecated - Use `event.triggers.hasType('')`
 */
export function hasTriggerEvent(event: Event, type: string): boolean {
  return !!findTriggerEvent(event, type);
}

/**
 * Appends the given `trigger` to the event chain.
 * @deprecated - Use `event.triggers.add(event)`
 */
export function appendTriggerEvent(event: DOMEvent, trigger?: Event) {
  if (trigger) event.triggers.add(trigger);
}

export type InferEventDetail<T> = T extends { detail: infer Detail }
  ? Detail
  : T extends DOMEvent<infer Detail>
    ? Detail
    : T extends DOMEventInit<infer Detail>
      ? Detail
      : unknown;

export type InferEventInit<T> =
  T extends Constructor<DOMEvent>
    ? DOMEventInit<InferEventDetail<InstanceType<T>>>
    : T extends DOMEvent
      ? DOMEventInit<InferEventDetail<T>>
      : T extends DOMEventInit
        ? T
        : DOMEventInit<unknown>;

export type EventCallback<T extends Event> =
  | ((event: T) => void)
  | { handleEvent(event: T): void }
  | null;

export class EventsTarget<Events> extends EventTarget {
  /** @internal type only */
  $ts__events?: Events;
  override addEventListener<Type extends keyof Events>(
    type: Type & string,
    callback: EventCallback<Events[Type] & Event>,
    options?: boolean | AddEventListenerOptions | undefined,
  ) {
    return super.addEventListener(type as string, callback as EventListener, options);
  }
  override removeEventListener<Type extends keyof Events>(
    type: Type & string,
    callback: EventCallback<Events[Type] & Event>,
    options?: boolean | AddEventListenerOptions | undefined,
  ) {
    return super.removeEventListener(type as string, callback as EventListener, options);
  }
}

/**
 * Returns an `AbortSignal` that will abort when any of the given signals are aborted.
 */
export function anySignal(...signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController(),
    options = { signal: controller.signal };

  function onAbort(event: Event) {
    controller.abort((event.target as AbortSignal).reason);
  }

  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort(signal.reason);
      break;
    }

    signal.addEventListener('abort', onAbort, options);
  }

  return controller.signal;
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
