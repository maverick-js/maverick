import { StoreFactory } from 'maverick.js';

it('should create store', () => {
  const factory = new StoreFactory({
    a: 1,
    b: 2,
    get c() {
      return this.a + this.b;
    },
  });

  expect(factory.record).toBeDefined();

  const store = factory.create();

  expect(store.a()).toBe(1);
  expect(store.b()).toBe(2);
  expect(store.c()).toBe(3);

  store.a.set(2);
  expect(store.b()).toBe(2);
  expect(store.c()).toBe(4);

  factory.reset(store);

  expect(store.a()).toBe(1);
  expect(store.b()).toBe(2);
  expect(store.c()).toBe(3);

  store.a.set(4);
  store.b.set(4);
  factory.reset(store, (key) => key !== 'b');

  expect(store.a()).toBe(1);
  expect(store.b()).toBe(4);
  expect(store.c()).toBe(5);
});
