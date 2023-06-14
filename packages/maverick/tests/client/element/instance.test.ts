import {
  Component,
  createComponent,
  createScope,
  Instance,
  StoreFactory,
  useStore,
} from 'maverick.js';

it('should create props', () => {
  class TestComponent extends Component<{ foo: number; bar: number }> {
    static props = { foo: 10, bar: 20 };
  }

  const instance = new Instance(TestComponent, createScope());
  expect(instance._props.foo()).toBe(10);
  expect(instance._props.bar()).toBe(20);
});

it('should forward props', () => {
  class TestComponent extends Component<{ foo: number; bar: number }> {
    static props = { foo: 10, bar: 20 };
  }

  const instance = new Instance(TestComponent, createScope(), {
    props: { foo: 20, bar: 40 },
  });

  expect(instance._props.foo()).toBe(20);
  expect(instance._props.bar()).toBe(40);
});

it('should create store', () => {
  const TestStore = new StoreFactory({ foo: 1 });

  class TestComponent extends Component<{}, { foo: number }> {
    static state = TestStore;

    constructor() {
      super();
      expect(this.$state.foo()).toBe(1);
      expect(useStore(TestStore)).toBeDefined();
    }
  }

  createComponent(TestComponent);
});
