import { defineElement, defineProp } from 'maverick.js/element';
import { isFunction } from 'maverick.js/std';

it('should create element definition', () => {
  const el = defineElement<{
    props: { foo: number };
  }>({
    tagName: 'mk-foo',
    props: {
      foo: defineProp({
        value: 10,
      }),
    },
  });

  expect(el.tagName).toBe('mk-foo');
  expect(el.props.foo.value).toBe(10);
});

it('should create default string converter', () => {
  const el = defineElement({
    tagName: 'mk-foo',
    props: { foo: 'foo' },
  });

  const props = el.props;

  expect(isFunction(props.foo.type?.from)).toBeTruthy();
  expect(isFunction(props.foo.type?.to)).toBeFalsy();

  if (isFunction(props.foo.type?.from)) {
    expect(props.foo.type!.from(null)).toEqual('');
    expect(props.foo.type!.from('foo')).toEqual('foo');
  }
});

it('should create default number converter', () => {
  const el = defineElement({
    tagName: 'mk-foo',
    props: { foo: 0 },
  });

  const props = el.props;

  expect(isFunction(props.foo.type?.from)).toBeTruthy();
  expect(isFunction(props.foo.type?.to)).toBeFalsy();

  if (isFunction(props.foo.type?.from)) {
    expect(props.foo.type!.from(null)).toEqual(0);
    expect(props.foo.type!.from('10')).toEqual(10);
  }
});

it('should create default boolean converter', () => {
  const el = defineElement({
    tagName: 'mk-foo',
    props: { foo: true },
  });

  const props = el.props;

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
  const el = defineElement({
    tagName: 'mk-foo',
    props: { foo: () => {} },
  });

  const props = el.props;

  expect(isFunction(props.foo.type?.from)).toBeFalsy();
  expect(isFunction(props.foo.type?.to)).toBeTruthy();

  if (isFunction(props.foo.type?.to)) {
    expect(props.foo.type!.to(() => {})).toEqual(null);
  }
});

it('should create default array converter', () => {
  const value = [1, 2, 3];

  const el = defineElement({
    tagName: 'mk-foo',
    props: { foo: value },
  });

  const props = el.props;

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

  const el = defineElement({
    tagName: 'mk-foo',
    props: { foo: value },
  });

  const props = el.props;

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
  const el = defineElement({
    tagName: 'mk-foo',
    props: {
      foo: defineProp({
        value: [],
        attribute: false,
      }),
    },
  });

  expect(el.props.foo.type).toBeUndefined();
});
