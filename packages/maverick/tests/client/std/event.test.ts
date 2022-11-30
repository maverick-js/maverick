import {
  appendTriggerEvent,
  DOMEvent,
  findTriggerEvent,
  isDOMEvent,
  walkTriggerEventChain,
} from 'maverick.js/std';

it('should identify dom event', () => {
  expect(isDOMEvent(null)).toBeFalsy();
  expect(isDOMEvent(new MouseEvent('foo'))).toBeFalsy();
  expect(isDOMEvent(new DOMEvent('foo'))).toBeTruthy();
});

it('should define event detail', () => {
  const event = new DOMEvent('foo', { detail: 10 });
  expect(event.detail).toBe(10);
});

it('should define trigger event', () => {
  const triggerEvent = new MouseEvent('foo');
  const event = new DOMEvent('foo', { detail: null, triggerEvent });
  expect(event.triggerEvent).toBe(triggerEvent);
});

it('should return self as origin event', () => {
  const event = new DOMEvent('foo');
  expect(event.originEvent).toBe(event);
});

it('should return shallow origin event', () => {
  const triggerEvent = new MouseEvent('click');
  const event = new DOMEvent('click', { detail: null, triggerEvent });
  expect(event.originEvent).toBe(triggerEvent);
});

it('should return deep origin event', () => {
  const originEvent = new MouseEvent('click');
  const triggerEvent = new DOMEvent('click', { detail: null, triggerEvent: originEvent });
  const event = new DOMEvent('click', { detail: null, triggerEvent });
  expect(event.originEvent).toBe(originEvent);
});

it('should walk event chain', () => {
  const eventA = new DOMEvent('event-a');
  const eventB = new DOMEvent('event-b', { detail: null, triggerEvent: eventA });
  const eventC = new DOMEvent('event-c', { detail: null, triggerEvent: eventB });
  const callback = vi.fn();
  walkTriggerEventChain(eventC, callback);
  expect(callback).toBeCalledTimes(2);
  expect(callback).toBeCalledWith(eventB);
  expect(callback).toBeCalledWith(eventA);
});

it('should find trigger event', () => {
  const eventA = new DOMEvent('event-a');
  const eventB = new DOMEvent('event-b', { detail: null, triggerEvent: eventA });
  const eventC = new DOMEvent('event-c', { detail: null, triggerEvent: eventB });
  expect(findTriggerEvent(eventC, 'event-b')).toBeTruthy();
  expect(findTriggerEvent(eventC, 'event-invalid')).toBeFalsy();
});

it('should append trigger event', () => {
  const eventA = new DOMEvent('event-a');
  const eventB = new DOMEvent('event-b', { detail: null, triggerEvent: eventA });
  const eventC = new DOMEvent('event-c');
  appendTriggerEvent(eventC, eventB);
  expect(eventC.triggerEvent).toBe(eventB);
  expect(eventB.triggerEvent).toBe(eventA);
});
