import { isSubject } from '@maverick-js/observables';
import { createContext } from 'maverick.js';

import {
  createElementInstance,
  defineCustomElement,
  defineElement,
  defineProp,
  MaverickElement,
  onAttach,
  PROPS,
} from 'maverick.js/element';

it('should create props', () => {
  const definition = defineElement({
    tagName: 'mk-foo-1',
    props: {
      foo: defineProp(10),
      bar: defineProp(20),
    },
  });

  const instance = createElementInstance(definition);

  expect(instance.props.foo).toBe(10);
  expect(instance.props.bar).toBe(20);

  expect(isSubject(instance[PROPS].foo)).toBeTruthy();
  expect(isSubject(instance[PROPS].bar)).toBeTruthy();
});

it('should forward props', () => {
  const definition = defineElement({
    tagName: 'mk-foo-2',
    props: {
      foo: defineProp(10),
      bar: defineProp(20),
    },
  });

  const instance = createElementInstance(definition, {
    props: {
      foo: 20,
      bar: 40,
    },
  });

  expect(instance.props.foo).toBe(20);
  expect(instance.props.bar).toBe(40);
});

it('should forward context map', () => {
  const foo = createContext(10);
  const bar = createContext(10);

  const definition = defineElement({
    tagName: 'mk-foo-3',
    setup() {
      expect(foo.get()).toBe(20);
      expect(bar.get()).toBe(10);
      return () => null;
    },
  });

  const context = new Map();
  context.set(foo.id, 20);
  createElementInstance(definition, { context });
});

it('should dispatch events on host', () => {
  const definition = defineElement({
    tagName: 'mk-foo-4',
    setup({ dispatch }) {
      onAttach(() => {
        dispatch('foo');
      });
      return () => null;
    },
  });

  defineCustomElement(definition);

  const element = document.createElement(definition.tagName) as MaverickElement;
  const instance = createElementInstance(definition);

  const callback = vi.fn();
  element.addEventListener('foo', callback);

  element.attachComponent(instance);
  expect(callback).toBeCalledTimes(1);
});