import { defineCustomElement } from 'maverick.js/element';

const isFunction = (value: unknown): value is Function => typeof value === 'function';

it('should create element definition', () => {
  const definition = defineCustomElement({
    tagName: 'mk-foo',
    props: { foo: { initial: 10 } },
  } as any);
  expect(definition.tagName).toBe('mk-foo');
  expect(definition.props?.foo.initial).toBe(10);
  expect(definition.setup).toBeInstanceOf(Function);
});

it('should create default string converter', () => {
  const defs = defineCustomElement({
    tagName: 'mk-foo',
    props: { foo: { initial: 'foo' } },
  } as any);
  const props = defs.props!;
  expect(isFunction(props.foo.type?.from)).toBeTruthy();
  expect(isFunction(props.foo.type?.to)).toBeFalsy();
  if (isFunction(props.foo.type?.from)) {
    expect(props.foo.type!.from(null)).toEqual('');
    expect(props.foo.type!.from('foo')).toEqual('foo');
  }
});

it('should create default number converter', () => {
  const defs = defineCustomElement({
    tagName: 'mk-foo',
    props: { foo: { initial: 0 } },
  } as any);
  const props = defs.props!;
  expect(isFunction(props.foo.type?.from)).toBeTruthy();
  expect(isFunction(props.foo.type?.to)).toBeFalsy();
  if (isFunction(props.foo.type?.from)) {
    expect(props.foo.type!.from(null)).toEqual(0);
    expect(props.foo.type!.from('10')).toEqual(10);
  }
});

it('should create default boolean converter', () => {
  const defs = defineCustomElement({
    tagName: 'mk-foo',
    props: { foo: { initial: true } },
  } as any);
  const props = defs.props!;
  expect(isFunction(props.foo.type?.from)).toBeTruthy();
  expect(isFunction(props.foo.type?.to)).toBeTruthy();
  if (isFunction(props.foo.type?.from)) {
    expect(props.foo.type!.from(null)).toEqual(false);
    expect(props.foo.type!.from('true')).toEqual(true);
    expect(props.foo.type!.from('false')).toEqual(true);
  }
  if (isFunction(props.foo.type?.to)) {
    expect(props.foo.type!.to(true)).toEqual('');
    expect(props.foo.type!.to(false)).toEqual(null);
  }
});

it('should create default function converter', () => {
  const fn = () => {};
  const defs = defineCustomElement({
    tagName: 'mk-foo',
    props: { foo: { initial: fn } },
  } as any);
  const props = defs.props!;
  expect(isFunction(props.foo.type?.from)).toBeFalsy();
  expect(isFunction(props.foo.type?.to)).toBeTruthy();
  if (isFunction(props.foo.type?.to)) {
    expect(props.foo.type!.to(() => {})).toEqual(null);
  }
});

it('should create default array converter', () => {
  const value = [1, 2, 3];
  const defs = defineCustomElement({
    tagName: 'mk-foo',
    props: { foo: { initial: value } },
  } as any);
  const props = defs.props!;
  expect(isFunction(props.foo.type?.from)).toBeTruthy();
  expect(isFunction(props.foo.type?.to)).toBeTruthy();
  if (isFunction(props.foo.type?.from)) {
    expect(props.foo.type!.from(JSON.stringify(value))).toEqual(value);
    expect(props.foo.type!.from(null)).toEqual([]);
  }
  if (isFunction(props.foo.type?.to)) {
    expect(props.foo.type!.to(value)).toEqual(JSON.stringify(value));
  }
});

it('should create default object converter', () => {
  const value = { foo: 1, bar: 2, baz: 'apple' };
  const defs = defineCustomElement({
    tagName: 'mk-foo',
    props: { foo: { initial: value } },
  } as any);
  const props = defs.props!;
  expect(isFunction(props.foo.type?.from)).toBeTruthy();
  expect(isFunction(props.foo.type?.to)).toBeTruthy();
  if (isFunction(props.foo.type?.from)) {
    expect(props.foo.type!.from(JSON.stringify(value))).toEqual(value);
    expect(props.foo.type!.from(null)).toEqual({});
  }
  if (isFunction(props.foo.type?.to)) {
    expect(props.foo.type!.to(value)).toEqual(JSON.stringify(value));
  }
});

it('should _not_ create converter if attribute is false', () => {
  const definition = defineCustomElement({
    tagName: 'mk-foo',
    props: { foo: { initial: [], attribute: false } },
  } as any);
  expect(definition.props!.foo.type).toBeUndefined();
});
