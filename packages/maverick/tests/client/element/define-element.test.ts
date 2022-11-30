import { defineElement } from 'maverick.js/element';

const isFunction = (value: unknown): value is Function => typeof value === 'function';

it('should create element definition', () => {
  const definition = defineElement({
    tagName: 'mk-foo',
    props: { foo: { initial: 10 } },
  } as any);
  expect(definition.tagName).toBe('mk-foo');
  expect(definition.props?.foo.initial).toBe(10);
  expect(definition.setup).toBeInstanceOf(Function);
});

it('should create default string converter', () => {
  const defs = defineElement({
    tagName: 'mk-foo',
    props: { foo: { initial: 'foo' } },
  } as any);
  const props = defs.props!;
  expect(isFunction(props.foo.converter?.from)).toBeTruthy();
  expect(isFunction(props.foo.converter?.to)).toBeFalsy();
  if (isFunction(props.foo.converter?.from)) {
    expect(props.foo.converter!.from(null)).toEqual('');
    expect(props.foo.converter!.from('foo')).toEqual('foo');
  }
});

it('should create default number converter', () => {
  const defs = defineElement({
    tagName: 'mk-foo',
    props: { foo: { initial: 0 } },
  } as any);
  const props = defs.props!;
  expect(isFunction(props.foo.converter?.from)).toBeTruthy();
  expect(isFunction(props.foo.converter?.to)).toBeFalsy();
  if (isFunction(props.foo.converter?.from)) {
    expect(props.foo.converter!.from(null)).toEqual(0);
    expect(props.foo.converter!.from('10')).toEqual(10);
  }
});

it('should create default boolean converter', () => {
  const defs = defineElement({
    tagName: 'mk-foo',
    props: { foo: { initial: true } },
  } as any);
  const props = defs.props!;
  expect(isFunction(props.foo.converter?.from)).toBeTruthy();
  expect(isFunction(props.foo.converter?.to)).toBeTruthy();
  if (isFunction(props.foo.converter?.from)) {
    expect(props.foo.converter!.from(null)).toEqual(false);
    expect(props.foo.converter!.from('true')).toEqual(true);
    expect(props.foo.converter!.from('false')).toEqual(true);
  }
  if (isFunction(props.foo.converter?.to)) {
    expect(props.foo.converter!.to(true)).toEqual('');
    expect(props.foo.converter!.to(false)).toEqual(null);
  }
});

it('should create default function converter', () => {
  const fn = () => {};
  const defs = defineElement({
    tagName: 'mk-foo',
    props: { foo: { initial: fn } },
  } as any);
  const props = defs.props!;
  expect(isFunction(props.foo.converter?.from)).toBeFalsy();
  expect(isFunction(props.foo.converter?.to)).toBeTruthy();
  if (isFunction(props.foo.converter?.to)) {
    expect(props.foo.converter!.to(() => {})).toEqual(null);
  }
});

it('should create default array converter', () => {
  const value = [1, 2, 3];
  const defs = defineElement({
    tagName: 'mk-foo',
    props: { foo: { initial: value } },
  } as any);
  const props = defs.props!;
  expect(isFunction(props.foo.converter?.from)).toBeTruthy();
  expect(isFunction(props.foo.converter?.to)).toBeTruthy();
  if (isFunction(props.foo.converter?.from)) {
    expect(props.foo.converter!.from(JSON.stringify(value))).toEqual(value);
    expect(props.foo.converter!.from(null)).toEqual([]);
  }
  if (isFunction(props.foo.converter?.to)) {
    expect(props.foo.converter!.to(value)).toEqual(JSON.stringify(value));
  }
});

it('should create default object converter', () => {
  const value = { foo: 1, bar: 2, baz: 'apple' };
  const defs = defineElement({
    tagName: 'mk-foo',
    props: { foo: { initial: value } },
  } as any);
  const props = defs.props!;
  expect(isFunction(props.foo.converter?.from)).toBeTruthy();
  expect(isFunction(props.foo.converter?.to)).toBeTruthy();
  if (isFunction(props.foo.converter?.from)) {
    expect(props.foo.converter!.from(JSON.stringify(value))).toEqual(value);
    expect(props.foo.converter!.from(null)).toEqual({});
  }
  if (isFunction(props.foo.converter?.to)) {
    expect(props.foo.converter!.to(value)).toEqual(JSON.stringify(value));
  }
});

it('should _not_ create converter if attribute is false', () => {
  const definition = defineElement({
    tagName: 'mk-foo',
    props: { foo: { initial: [], attribute: false } },
  } as any);
  expect(definition.props!.foo.converter).toBeUndefined();
});
