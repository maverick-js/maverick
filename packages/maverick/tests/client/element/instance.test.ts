import { createContext, useContext } from 'maverick.js';

import { createElementInstance, defineCustomElement, PROPS } from 'maverick.js/element';

it('should create props', () => {
  const definition = defineCustomElement({
    tagName: 'mk-foo-1',
    props: {
      foo: { initial: 10 },
      bar: { initial: 20 },
    },
  } as any);

  const instance = createElementInstance(definition);

  expect(instance.props.$foo()).toBe(10);
  expect(instance.props.$bar()).toBe(20);

  expect(instance[PROPS].$foo()).toBe(10);
  expect(instance[PROPS].$bar()).toBe(20);
});

it('should forward props', () => {
  const definition = defineCustomElement({
    tagName: 'mk-foo-2',
    props: {
      foo: { initial: 10 },
      bar: { initial: 20 },
    },
  } as any);

  const instance = createElementInstance(definition, {
    props: {
      foo: 20,
      bar: 40,
    },
  });

  expect(instance.props.$foo()).toBe(20);
  expect(instance.props.$bar()).toBe(40);
});

it('should forward context map', () => {
  const FooContext = createContext(() => 10);

  const definition = defineCustomElement({
    tagName: 'mk-foo-3',
    setup() {
      expect(useContext(FooContext)).toBe(20);
      return () => null;
    },
  });

  const context = new Map();
  context.set(FooContext.id, 20);
  createElementInstance(definition, { context });
});

it('should create accessors', () => {
  const definition = defineCustomElement({
    tagName: 'mk-foo-4',
    props: {
      foo: { initial: 0 },
      bar: { initial: 'bar' },
      baz: { initial: false },
    },
    setup({ accessors }) {
      const descriptors = Object.getOwnPropertyDescriptors(accessors());
      expect(descriptors.foo.get && descriptors.foo.set).toBeDefined();
      expect(descriptors.bar.get && descriptors.bar.set).toBeDefined();
      expect(descriptors.baz.get && descriptors.baz.set).toBeDefined();

      expect(accessors().foo).toBe(0);
      expect(accessors().bar).toBe('bar');
      expect(accessors().baz).toBe(false);
    },
  } as any);

  createElementInstance(definition);
});
