import {
  appendTriggerEvent,
  DOMEvent,
  findTriggerEvent,
  isDOMEvent,
  walkTriggerEventChain,
} from 'maverick.js/std';

it('should init dom event', () => {
  const triggerEvent = new MouseEvent('click');

  const event = new DOMEvent('foo', {
    detail: 0,
    bubbles: true,
    composed: true,
    triggerEvent,
  });

  expect(event.detail).toBe(0);
  expect(event.bubbles).toBe(true);
  expect(event.composed).toBe(true);
  expect(event.triggerEvent).toBe(triggerEvent);
  expect(event.originEvent).toBe(triggerEvent);
  expect(event.isOriginTrusted).toBe(false);
});

it('should identify dom event', () => {
  expect(isDOMEvent(null)).toBeFalsy();
  expect(isDOMEvent(new MouseEvent('foo'))).toBeFalsy();
  expect(isDOMEvent(new DOMEvent<void>('foo'))).toBeTruthy();
});

it('should define event detail', () => {
  const event = new DOMEvent<number>('foo', { detail: 10 });
  expect(event.detail).toBe(10);
});

it('should define trigger event', () => {
  const triggerEvent = new MouseEvent('foo');
  const event = new DOMEvent<void>('foo', { triggerEvent });
  expect(event.triggerEvent).toBe(triggerEvent);
});

it('should return self as origin event', () => {
  const event = new DOMEvent<void>('foo');
  expect(event.originEvent).toBe(event);
});

it('should return shallow origin event', () => {
  const triggerEvent = new MouseEvent('click');
  const event = new DOMEvent<void>('click', { triggerEvent });
  expect(event.originEvent).toBe(triggerEvent);
});

it('should return deep origin event', () => {
  const originEvent = new MouseEvent('click');
  const triggerEvent = new DOMEvent<void>('click', { triggerEvent: originEvent });
  const event = new DOMEvent<void>('click', { triggerEvent });
  expect(event.originEvent).toBe(originEvent);
});

it('should walk event chain', () => {
  const eventA = new DOMEvent<void>('event-a');
  const eventB = new DOMEvent<void>('event-b', { triggerEvent: eventA });
  const eventC = new DOMEvent<void>('event-c', { triggerEvent: eventB });
  const callback = vi.fn();
  walkTriggerEventChain(eventC, callback);
  expect(callback).toBeCalledTimes(2);
  expect(callback).toBeCalledWith(eventB);
  expect(callback).toBeCalledWith(eventA);
});

it('should find trigger event', () => {
  const eventA = new DOMEvent<void>('a');
  const eventB = new DOMEvent<void>('b', { triggerEvent: eventA });
  const eventC = new DOMEvent<void>('c', { triggerEvent: eventB });
  expect(findTriggerEvent(eventC, 'b')).toBeTruthy();
  expect(findTriggerEvent(eventC, 'invalid')).toBeFalsy();
});

it('should not throw if appending initial trigger event', () => {
  const event = new DOMEvent<void>('event');
  expect(() => {
    const triggerEvent = new DOMEvent<void>('a');
    appendTriggerEvent(event, triggerEvent);
  }).not.toThrow();
});

it('should append trigger event', () => {
  const triggerA = new DOMEvent<void>('a');
  const event = new DOMEvent<void>('event', { triggerEvent: triggerA });

  const triggerB = new DOMEvent<void>('b');
  appendTriggerEvent(event, triggerB);

  const triggerC = new DOMEvent<void>('c');
  appendTriggerEvent(event, triggerC);

  let result: string[] = [];
  walkTriggerEventChain(event, (event) => {
    result.push(event.type);
  });

  expect(result).toEqual(['a', 'b', 'c']);
});

it('should throw if attempting to append event as trigger on itself', () => {
  const event = new DOMEvent<void>('event');
  expect(() => {
    appendTriggerEvent(event, event);
  }).toThrow(/cyclic/);
});

it('should throw if trigger event chain is cyclic', () => {
  const a = new DOMEvent<void>('a');
  const b = new DOMEvent<void>('b', { triggerEvent: a });

  expect(() => {
    appendTriggerEvent(b, a);
  }).toThrow(/cyclic/);

  const c = new DOMEvent<void>('c', { triggerEvent: a });
  const d = new DOMEvent<void>('d', { triggerEvent: c });

  expect(() => {
    appendTriggerEvent(d, a);
  }).toThrow(/cyclic/);
});
