import { omit, pick } from '@maverick-js/std';

it('should pick properties', () => {
  let baz = 0;

  const source = {
    foo: 1,
    get bar() {
      return 1;
    },
    get baz() {
      return baz;
    },
    set baz(v) {
      baz = v;
    },
    bax() {
      return 10;
    },
  };

  const target = pick(source, ['foo', 'baz', 'bax']);

  expect((target as typeof source).bar).toBeUndefined();
  expect(target.foo).toBe(1);
  expect(target.baz).toBe(baz);
  target.baz = 10;
  expect(target.baz).toBe(10);
  expect(target.bax()).toBe(10);
});

it('should omit properties', () => {
  let baz = 0;

  const source = {
    foo: 1,
    get bar() {
      return 1;
    },
    get baz() {
      return baz;
    },
    set baz(v) {
      baz = v;
    },
    bax() {
      return 10;
    },
  };

  const target = omit(source, ['bar']);

  expect((target as typeof source).bar).toBeUndefined();
  expect(target.foo).toBe(1);
  expect(target.baz).toBe(baz);
  target.baz = 10;
  expect(target.baz).toBe(10);
  expect(target.bax()).toBe(10);
});
