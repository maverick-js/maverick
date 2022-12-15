import { createStore } from 'maverick.js';

it('should create store', () => {
  const store = createStore({
    a: 1,
    b: 2,
    get c() {
      return this.a + this.b;
    },
  });

  expect(store.initial).toBeDefined();

  const foo = store.create();

  expect(foo.a).toBe(1);
  expect(foo.b).toBe(2);
  expect(foo.c).toBe(3);

  foo.a = 2;
  expect(foo.b).toBe(2);
  expect(foo.c).toBe(4);

  store.reset(foo);

  expect(foo.a).toBe(1);
  expect(foo.b).toBe(2);
  expect(foo.c).toBe(3);

  foo.a = 4;
  foo.b = 4;
  store.reset(foo, (key) => key !== 'b');

  expect(foo.a).toBe(1);
  expect(foo.b).toBe(4);
  expect(foo.c).toBe(5);
});
