import { property } from 'maverick.js/element';
import { isFunction } from 'src/utils/unit';

it('should set options', () => {
  const prop = property('foo', { attribute: 'bar', reflect: true });
  expect(prop.initialValue).toEqual('foo');
  expect(prop.attribute).toBe('bar');
  expect(prop.reflect).toBeTruthy();
});

it('should not set options', () => {
  const prop = property('foo');
  expect(prop.initialValue).toEqual('foo');
  expect(prop.attribute).toBeUndefined();
  expect(prop.reflect).toBeUndefined();
});

it('should create default string transformer', () => {
  const prop = property('foo');
  expect(isFunction(prop.transform?.from)).toBeTruthy();
  expect(isFunction(prop.transform?.to)).toBeFalsy();
  if (isFunction(prop.transform?.from)) {
    expect(prop.transform!.from(null)).toEqual('');
    expect(prop.transform!.from('foo')).toEqual('foo');
  }
});

it('should create default number transformer', () => {
  const prop = property(10);
  expect(isFunction(prop.transform?.from)).toBeTruthy();
  expect(isFunction(prop.transform?.to)).toBeFalsy();
  if (isFunction(prop.transform?.from)) {
    expect(prop.transform!.from(null)).toEqual(0);
    expect(prop.transform!.from('10')).toEqual(10);
  }
});

it('should create default boolean transformer', () => {
  const prop = property(true);
  expect(isFunction(prop.transform?.from)).toBeTruthy();
  expect(isFunction(prop.transform?.to)).toBeTruthy();
  if (isFunction(prop.transform?.from)) {
    expect(prop.transform!.from(null)).toEqual(false);
    expect(prop.transform!.from('true')).toEqual(true);
    expect(prop.transform!.from('false')).toEqual(true);
  }
  if (isFunction(prop.transform?.to)) {
    expect(prop.transform!.to(true)).toEqual('');
    expect(prop.transform!.to(false)).toEqual(null);
  }
});

it('should create default function transformer', () => {
  const fn = () => {};
  const prop = property(fn);
  expect(prop.transform?.from).toBeFalsy();
  expect(isFunction(prop.transform?.to)).toBeTruthy();
  if (isFunction(prop.transform?.to)) {
    expect(prop.transform!.to(() => {})).toEqual(null);
  }
});

it('should create default array transformer', () => {
  const value = [1, 2, 3];
  const prop = property(value);
  expect(isFunction(prop.transform?.from)).toBeTruthy();
  expect(isFunction(prop.transform?.to)).toBeTruthy();
  if (isFunction(prop.transform?.from)) {
    expect(prop.transform!.from(JSON.stringify(value))).toEqual(value);
    expect(prop.transform!.from(null)).toEqual([]);
  }
  if (isFunction(prop.transform?.to)) {
    expect(prop.transform!.to(value)).toEqual(JSON.stringify(value));
  }
});

it('should create default object transformer', () => {
  const value = { foo: 1, bar: 2, baz: 'apple' };
  const prop = property(value);
  expect(isFunction(prop.transform?.from)).toBeTruthy();
  expect(isFunction(prop.transform?.to)).toBeTruthy();
  if (isFunction(prop.transform?.from)) {
    expect(prop.transform!.from(JSON.stringify(value))).toEqual(value);
    expect(prop.transform!.from(null)).toEqual({});
  }
  if (isFunction(prop.transform?.to)) {
    expect(prop.transform!.to(value)).toEqual(JSON.stringify(value));
  }
});
