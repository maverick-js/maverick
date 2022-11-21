import type { DOMEvent, InferEventDetail, InferEventInit } from '../std/event';

export function defineEvent<Event>(
  init?: InferEventInit<Event>,
): Event extends DOMEvent ? Event : DOMEvent<InferEventDetail<Event>> {
  return init as any;
}

export function defineEvents<EventRecord extends Record<string, DOMEvent>>(): EventRecord {
  // type macro which is compiled away.
  return null as any;
}
