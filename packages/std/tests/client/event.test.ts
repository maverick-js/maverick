import {
  appendTriggerEvent,
  findTriggerEvent,
  isMaverickEvent,
  MaverickEvent,
  walkTriggerEventChain,
} from '@maverick-js/std';

it('should init maverick event', () => {
  const trigger = new MouseEvent('click');

  const event = new MaverickEvent('foo', {
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

it('should identify maverick event', () => {
  expect(isMaverickEvent(null)).toBeFalsy();
  expect(isMaverickEvent(new MouseEvent('foo'))).toBeFalsy();
  expect(isMaverickEvent(new MaverickEvent<void>('foo'))).toBeTruthy();
});

it('should define event detail', () => {
  const event = new MaverickEvent<number>('foo', { detail: 10 });
  expect(event.detail).toBe(10);
});

it('should define trigger event', () => {
  const trigger = new MouseEvent('foo');
  const event = new MaverickEvent<void>('foo', { trigger });
  expect(event.trigger).toBe(trigger);
});

it('should return shallow origin event', () => {
  const trigger = new MouseEvent('click');
  const event = new MaverickEvent<void>('click', { trigger });
  expect(event.originEvent).toBe(trigger);
});

it('should return deep origin event', () => {
  const originEvent = new MouseEvent('click');
  const trigger = new MaverickEvent<void>('click', { trigger: originEvent });
  const event = new MaverickEvent<void>('click', { trigger });
  expect(event.originEvent).toBe(originEvent);
});

it('should walk event chain', () => {
  const eventA = new MaverickEvent<void>('event-a');
  const eventB = new MaverickEvent<void>('event-b', { trigger: eventA });
  const eventC = new MaverickEvent<void>('event-c', { trigger: eventB });
  const callback = vi.fn();
  walkTriggerEventChain(eventC, callback);
  expect(callback).toBeCalledTimes(2);
  expect(callback).toBeCalledWith(eventB);
  expect(callback).toBeCalledWith(eventA);
});

it('should find trigger event', () => {
  const eventA = new MaverickEvent<void>('a');
  const eventB = new MaverickEvent<void>('b', { trigger: eventA });
  const eventC = new MaverickEvent<void>('c', { trigger: eventB });
  expect(findTriggerEvent(eventC, 'b')).toBeTruthy();
  expect(findTriggerEvent(eventC, 'invalid')).toBeFalsy();
});

it('should not throw if appending initial trigger event', () => {
  const event = new MaverickEvent<void>('event');
  expect(() => {
    const trigger = new MaverickEvent<void>('a');
    appendTriggerEvent(event, trigger);
  }).not.toThrow();
});

it('should append trigger event', () => {
  const triggerA = new MaverickEvent<void>('a');
  const event = new MaverickEvent<void>('event', { trigger: triggerA });

  const triggerB = new MaverickEvent<void>('b');
  appendTriggerEvent(event, triggerB);

  const triggerC = new MaverickEvent<void>('c');
  appendTriggerEvent(event, triggerC);

  let result: string[] = [];
  walkTriggerEventChain(event, (event) => {
    result.push(event.type);
  });

  expect(result).toEqual(['a', 'b', 'c']);
});
