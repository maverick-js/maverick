import { defineProp } from 'maverick.js/element';

const isFunction = (value: unknown): value is Function => typeof value === 'function';

it('should set options', () => {
  const prop = defineProp('foo', { attribute: 'bar', reflect: true });
  expect(prop.initial).toEqual('foo');
  expect(prop.attribute).toBe('bar');
  expect(prop.reflect).toBeTruthy();
});

it('should not set options', () => {
  const prop = defineProp('foo');
  expect(prop.initial).toEqual('foo');
  expect(prop.attribute).toBeUndefined();
  expect(prop.reflect).toBeUndefined();
});

it('should create default string converter', () => {
  const prop = defineProp('foo');
  expect(isFunction(prop.converter?.from)).toBeTruthy();
  expect(isFunction(prop.converter?.to)).toBeFalsy();
  if (isFunction(prop.converter?.from)) {
    expect(prop.converter!.from(null)).toEqual('');
    expect(prop.converter!.from('foo')).toEqual('foo');
  }
});

it('should create default number converter', () => {
  const prop = defineProp(10);
  expect(isFunction(prop.converter?.from)).toBeTruthy();
  expect(isFunction(prop.converter?.to)).toBeFalsy();
  if (isFunction(prop.converter?.from)) {
    expect(prop.converter!.from(null)).toEqual(0);
    expect(prop.converter!.from('10')).toEqual(10);
  }
});

it('should create default boolean converter', () => {
  const prop = defineProp(true);
  expect(isFunction(prop.converter?.from)).toBeTruthy();
  expect(isFunction(prop.converter?.to)).toBeTruthy();
  if (isFunction(prop.converter?.from)) {
    expect(prop.converter!.from(null)).toEqual(false);
    expect(prop.converter!.from('true')).toEqual(true);
    expect(prop.converter!.from('false')).toEqual(true);
  }
  if (isFunction(prop.converter?.to)) {
    expect(prop.converter!.to(true)).toEqual('');
    expect(prop.converter!.to(false)).toEqual(null);
  }
});

it('should create default function converter', () => {
  const fn = () => {};
  const prop = defineProp(fn);
  expect(prop.converter?.from).toBeFalsy();
  expect(isFunction(prop.converter?.to)).toBeTruthy();
  if (isFunction(prop.converter?.to)) {
    expect(prop.converter!.to(() => {})).toEqual(null);
  }
});

it('should create default array converter', () => {
  const value = [1, 2, 3];
  const prop = defineProp(value);
  expect(isFunction(prop.converter?.from)).toBeTruthy();
  expect(isFunction(prop.converter?.to)).toBeTruthy();
  if (isFunction(prop.converter?.from)) {
    expect(prop.converter!.from(JSON.stringify(value))).toEqual(value);
    expect(prop.converter!.from(null)).toEqual([]);
  }
  if (isFunction(prop.converter?.to)) {
    expect(prop.converter!.to(value)).toEqual(JSON.stringify(value));
  }
});

it('should create default object converter', () => {
  const value = { foo: 1, bar: 2, baz: 'apple' };
  const prop = defineProp(value);
  expect(isFunction(prop.converter?.from)).toBeTruthy();
  expect(isFunction(prop.converter?.to)).toBeTruthy();
  if (isFunction(prop.converter?.from)) {
    expect(prop.converter!.from(JSON.stringify(value))).toEqual(value);
    expect(prop.converter!.from(null)).toEqual({});
  }
  if (isFunction(prop.converter?.to)) {
    expect(prop.converter!.to(value)).toEqual(JSON.stringify(value));
  }
});
