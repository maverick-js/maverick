import {
  appendTriggerEvent,
  DOMEvent,
  findTriggerEvent,
  isDOMEvent,
  walkTriggerEventChain,
} from 'maverick.js/std';

it('should init dom event', () => {
  const trigger = new MouseEvent('click');

  const event = new DOMEvent('foo', {
    detail: 0,
    bubbles: true,
    composed: true,
    trigger,
  });

  expect(event.detail).toBe(0);
  expect(event.bubbles).toBe(true);
  expect(event.composed).toBe(true);
  expect(event.trigger).toBe(trigger);
  expect(event.originEvent).toBe(trigger);
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
  const trigger = new MouseEvent('foo');
  const event = new DOMEvent<void>('foo', { trigger });
  expect(event.trigger).toBe(trigger);
});

it('should return shallow origin event', () => {
  const trigger = new MouseEvent('click');
  const event = new DOMEvent<void>('click', { trigger });
  expect(event.originEvent).toBe(trigger);
});

it('should return deep origin event', () => {
  const originEvent = new MouseEvent('click');
  const trigger = new DOMEvent<void>('click', { trigger: originEvent });
  const event = new DOMEvent<void>('click', { trigger });
  expect(event.originEvent).toBe(originEvent);
});

it('should walk event chain', () => {
  const eventA = new DOMEvent<void>('event-a');
  const eventB = new DOMEvent<void>('event-b', { trigger: eventA });
  const eventC = new DOMEvent<void>('event-c', { trigger: eventB });
  const callback = vi.fn();
  walkTriggerEventChain(eventC, callback);
  expect(callback).toBeCalledTimes(2);
  expect(callback).toBeCalledWith(eventB);
  expect(callback).toBeCalledWith(eventA);
});

it('should find trigger event', () => {
  const eventA = new DOMEvent<void>('a');
  const eventB = new DOMEvent<void>('b', { trigger: eventA });
  const eventC = new DOMEvent<void>('c', { trigger: eventB });
  expect(findTriggerEvent(eventC, 'b')).toBeTruthy();
  expect(findTriggerEvent(eventC, 'invalid')).toBeFalsy();
});

it('should not throw if appending initial trigger event', () => {
  const event = new DOMEvent<void>('event');
  expect(() => {
    const trigger = new DOMEvent<void>('a');
    appendTriggerEvent(event, trigger);
  }).not.toThrow();
});

it('should append trigger event', () => {
  const triggerA = new DOMEvent<void>('a');
  const event = new DOMEvent<void>('event', { trigger: triggerA });

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
