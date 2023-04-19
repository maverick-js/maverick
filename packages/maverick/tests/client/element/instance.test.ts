import {
  createContext,
  getScope,
  provideContext,
  root,
  type Scope,
  StoreFactory,
  useContext,
  useStore,
} from 'maverick.js';

import { Component, ComponentInstance, createComponent, defineElement } from 'maverick.js/element';

it('should create props', () => {
  class TestComponent extends Component {
    static el = defineElement({
      tagName: 'mk-foo-1',
      props: { foo: 10, bar: 20 },
    });
  }

  const instance = new ComponentInstance(TestComponent);
  expect(instance._props.foo()).toBe(10);
  expect(instance._props.bar()).toBe(20);
});

it('should forward props', () => {
  class TestComponent extends Component {
    static el = defineElement({
      tagName: 'mk-foo-2',
      props: { foo: 10, bar: 20 },
    });
  }

  const instance = new ComponentInstance(TestComponent, {
    props: { foo: 20, bar: 40 },
  });

  expect(instance._props.foo()).toBe(20);
  expect(instance._props.bar()).toBe(40);
});

it('should forward scope', () => {
  class TestComponent extends Component {
    static el = defineElement({
      tagName: 'mk-foo-3',
    });

    constructor(instance) {
      super(instance);
      expect(useContext(FooContext)).toBe(20);
    }
  }

  const FooContext = createContext(() => 10);

  let scope!: Scope;
  root(() => {
    scope = getScope()!;
    provideContext(FooContext, 20);
  });

  createComponent(TestComponent, { scope });
});

it('should create store', () => {
  const TestStore = new StoreFactory({ foo: 1 });

  interface API {
    store: typeof TestStore;
  }

  class TestComponent extends Component<API> {
    static el = defineElement<API>({
      tagName: 'mk-foo-4',
      store: TestStore,
    });

    constructor(instance) {
      super(instance);
      expect(this.$store.foo()).toBe(1);
      expect(instance._state.foo).toBe(1);
      expect(useStore(TestStore)).toBeDefined();
    }
  }

  createComponent(TestComponent);
});
