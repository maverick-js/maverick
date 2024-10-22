import {
  Component,
  createComponent,
  createScope,
  Instance,
  State,
  useState,
} from '@maverick-js/core';

it('should create props', () => {
  class TestComponent extends Component<{ foo: number; bar: number }> {
    static props = { foo: 10, bar: 20 };
  }

  const instance = new Instance(createScope(), TestComponent.props);

  expect(instance.props.foo()).toBe(10);
  expect(instance.props.bar()).toBe(20);
});

it('should forward props', () => {
  class TestComponent extends Component<{ foo: number; bar: number }> {
    static props = { foo: 10, bar: 20 };
  }

  const instance = new Instance(createScope(), TestComponent.props, undefined, {
    props: { foo: 20, bar: 40 },
  });

  expect(instance.props.foo()).toBe(20);
  expect(instance.props.bar()).toBe(40);
});

it('should create state', () => {
  const TestState = new State({ foo: 1 });

  class TestComponent extends Component<{}, { foo: number }> {
    static state = TestState;

    constructor() {
      super();
      expect(this.$state.foo()).toBe(1);
      expect(useState(TestState)).toBeDefined();
    }
  }

  createComponent(TestComponent);
});
