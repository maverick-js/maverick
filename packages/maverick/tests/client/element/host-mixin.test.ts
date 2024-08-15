import { isFunction } from '@maverick-js/std';
import { Component, createContext, onDispose, provideContext, useContext } from 'maverick.js';

import { defineCustomElement } from 'maverick.js/element';

import { waitAnimationFrame } from '../../../../std/src/timing';
import { Host } from '../../../src/element/host-mixin';

afterEach(() => {
  document.body.innerHTML = '';
});

it('should handle basic setup and destroy', () => {
  class TestElement extends Host(HTMLElement, class extends Component {}) {
    static tagName = 'mk-test-1';
  }

  defineCustomElement(TestElement);
  const el = document.createElement(TestElement.tagName) as TestElement;

  document.body.append(el);
  expect(document.body.innerHTML).toMatchInlineSnapshot('"<mk-test-1></mk-test-1>"');

  el.destroy();
});

it('should observe attributes', () => {
  interface Props {
    foo: number;
    bar: number;
    bazBax: number;
    bazBaxHux: number;
  }

  class TestElement extends Host(
    HTMLElement,
    class extends Component<Props> {
      static props: Props = {
        foo: 1,
        bar: 2,
        bazBax: 3,
        bazBaxHux: 4,
      };
    },
  ) {
    static tagName = 'mk-test-2';
  }

  defineCustomElement(TestElement);
  const el = document.createElement(TestElement.tagName) as TestElement;
  document.body.append(el);

  expect(TestElement.observedAttributes).toEqual(['foo', 'bar', 'baz-bax', 'baz-bax-hux']);

  el.setAttribute('foo', '10');
  expect(el.foo).toBe(10);

  el.setAttribute('baz-bax', '50');
  expect(el.bazBax).toBe(50);

  el.destroy();
});

it('should call lifecycle hooks', async () => {
  const attach = vi.fn(),
    detach = vi.fn(),
    connect = vi.fn(),
    disconnect = vi.fn(),
    Context = createContext<number>();

  class TestElement extends Host(
    HTMLElement,
    class extends Component {
      constructor() {
        super();
        provideContext(Context, 1);
      }

      override onAttach(el) {
        expect(el).toBeDefined();
        expect(useContext(Context)).toBe(1);
        attach();
        onDispose(detach);
      }

      override onConnect(el) {
        expect(el).toBeDefined();
        expect(useContext(Context)).toBe(1);
        connect();
        onDispose(disconnect);
      }
    },
  ) {
    static tagName = 'mk-test-3';
  }

  defineCustomElement(TestElement);
  const el = document.createElement(TestElement.tagName) as TestElement;
  document.body.append(el);

  expect(attach).toBeCalledTimes(1);
  expect(connect).toBeCalledTimes(1);
  expect(detach).toBeCalledTimes(0);
  expect(disconnect).toBeCalledTimes(0);

  el.remove();
  await waitAnimationFrame();

  expect(attach).toBeCalledTimes(1);
  expect(connect).toBeCalledTimes(1);
  expect(detach).toBeCalledTimes(1);
  expect(disconnect).toBeCalledTimes(1);
});

it('should render `setAttributes`', () => {
  class TestElement extends Host(
    HTMLElement,
    class extends Component {
      override onAttach() {
        this.setAttributes({
          foo: () => 10,
          bar: 'none',
          baz: null,
          bux: false,
        });
      }
    },
  ) {
    static tagName = 'mk-test-4';
  }

  defineCustomElement(TestElement);
  const el = document.createElement(TestElement.tagName) as TestElement;
  document.body.append(el);

  expect(el).toMatchInlineSnapshot(`
    <mk-test-4
      bar="none"
      foo="10"
    />
  `);
});

it('should render `setStyles`', () => {
  class TestElement extends Host(
    HTMLElement,
    class extends Component {
      override onAttach() {
        this.setStyles({
          flex: '1',
          'flex-basis': null,
          'align-self': false,
          'z-index': () => 10,
        });
      }
    },
  ) {
    static tagName = 'mk-test-5';
  }

  defineCustomElement(TestElement);
  const el = document.createElement(TestElement.tagName) as TestElement;
  document.body.append(el);

  expect(el).toMatchInlineSnapshot(`
    <mk-test-5
      style="flex: 1; z-index: 10;"
    />
  `);
});
