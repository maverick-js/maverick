import { State } from 'maverick.js';

it('should create state', () => {
  const factory = new State({
    a: 1,
    b: 2,
    get c() {
      return this.a + this.b;
    },
  });

  expect(factory.record).toBeDefined();

  const state = factory.create();

  expect(state.a()).toBe(1);
  expect(state.b()).toBe(2);
  expect(state.c()).toBe(3);

  state.a.set(2);
  expect(state.b()).toBe(2);
  expect(state.c()).toBe(4);

  factory.reset(state);

  expect(state.a()).toBe(1);
  expect(state.b()).toBe(2);
  expect(state.c()).toBe(3);

  state.a.set(4);
  state.b.set(4);
  factory.reset(state, (key) => key !== 'b');

  expect(state.a()).toBe(1);
  expect(state.b()).toBe(4);
  expect(state.c()).toBe(5);
});
