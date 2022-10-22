import {
  appendTriggerEvent,
  findTriggerEvent,
  isMaverickEvent,
  MaverickEvent,
  walkTriggerEventChain,
} from 'maverick.js/element';

it('should identify maverick event', () => {
  expect(isMaverickEvent(undefined)).toBeFalsy();
  expect(isMaverickEvent(new MouseEvent('foo'))).toBeFalsy();
  expect(isMaverickEvent(new MaverickEvent('foo'))).toBeTruthy();
});

it('should define event detail', () => {
  const event = new MaverickEvent('foo', { detail: 10 });
  expect(event.detail).toBe(10);
});

it('should define trigger event', () => {
  const triggerEvent = new MouseEvent('foo');
  const event = new MaverickEvent('foo', { triggerEvent });
  expect(event.triggerEvent).toBe(triggerEvent);
});

it('should return self as origin event', () => {
  const event = new MaverickEvent('foo');
  expect(event.originEvent).toBe(event);
});

it('should return shallow origin event', () => {
  const triggerEvent = new MouseEvent('click');
  const event = new MaverickEvent('click', { triggerEvent });
  expect(event.originEvent).toBe(triggerEvent);
});

it('should return deep origin event', () => {
  const originEvent = new MouseEvent('click');
  const triggerEvent = new MaverickEvent('click', { triggerEvent: originEvent });
  const event = new MaverickEvent('click', { triggerEvent });
  expect(event.originEvent).toBe(originEvent);
});

it('should walk event chain', () => {
  const eventA = new MaverickEvent('event-a');
  const eventB = new MaverickEvent('event-b', { triggerEvent: eventA });
  const eventC = new MaverickEvent('event-c', { triggerEvent: eventB });
  const callback = vi.fn();
  walkTriggerEventChain(eventC, callback);
  expect(callback).toBeCalledTimes(2);
  expect(callback).toBeCalledWith(eventB);
  expect(callback).toBeCalledWith(eventA);
});

it('should find trigger event', () => {
  const eventA = new MaverickEvent('event-a');
  const eventB = new MaverickEvent('event-b', { triggerEvent: eventA });
  const eventC = new MaverickEvent('event-c', { triggerEvent: eventB });
  expect(findTriggerEvent(eventC, 'event-b')).toBeTruthy();
  expect(findTriggerEvent(eventC, 'event-invalid')).toBeFalsy();
});

it('should append trigger event', () => {
  const eventA = new MaverickEvent('event-a');
  const eventB = new MaverickEvent('event-b', { triggerEvent: eventA });
  const eventC = new MaverickEvent('event-c');
  appendTriggerEvent(eventC, eventB);
  expect(eventC.triggerEvent).toBe(eventB);
  expect(eventB.triggerEvent).toBe(eventA);
});
