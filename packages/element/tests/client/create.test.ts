import {
  createContext,
  type CustomElementOptions,
  MaverickComponent,
  onAttach,
  onConnect,
  onDispose,
  provideContext,
  useContext,
} from '@maverick-js/core';
import {
  createMaverickElement,
  defineMaverickElement,
  type MaverickElement,
} from '@maverick-js/element';
import { waitAnimationFrame, waitTimeout } from '@maverick-js/std';

const target = document.body;

afterEach(() => {
  target.innerHTML = '';
});

it('should handle basic setup and destroy', () => {
  class TestComponent extends MaverickComponent {
    static element: CustomElementOptions = {
      name: 'mk-test-1',
    };
  }

  defineMaverickElement(TestComponent);
  const el = document.createElement(TestComponent.element.name) as MaverickElement<TestComponent>;

  target.append(el);
  expect(target.innerHTML).toMatchSnapshot();

  el.destroy();
});

it('should observe attributes', () => {
  interface Props {
    foo: number;
    bar: number;
    bazBax: number;
    bazBaxHux: number;
  }

  class TestComponent extends MaverickComponent<Props> {
    static element: CustomElementOptions = {
      name: 'mk-test-2',
    };

    static props: Props = {
      foo: 1,
      bar: 2,
      bazBax: 3,
      bazBaxHux: 4,
    };
  }

  class TestElement extends createMaverickElement(TestComponent) {}

  window.customElements.define(TestElement.tagName, TestElement);

  const el = document.createElement(TestElement.tagName) as TestElement;
  target.append(el);

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

  class TestComponent extends MaverickComponent {
    static element: CustomElementOptions = {
      name: 'mk-test-3',
    };

    constructor() {
      super();
      provideContext(Context, 1);
      onAttach(this.#onAttach.bind(this));
      onConnect(this.#onConnect.bind(this));
    }

    #onAttach(el: HTMLElement) {
      expect(el).toBeDefined();
      expect(useContext(Context)).toBe(1);
      attach();
      onDispose(detach);
    }

    #onConnect(el: HTMLElement) {
      expect(el).toBeDefined();
      expect(useContext(Context)).toBe(1);
      connect();
      onDispose(disconnect);
    }
  }

  defineMaverickElement(TestComponent);

  const el = document.createElement(TestComponent.element.name);
  target.append(el);

  expect(attach).toBeCalledTimes(1);
  expect(connect).toBeCalledTimes(1);
  expect(detach).toBeCalledTimes(0);
  expect(disconnect).toBeCalledTimes(0);

  el.remove();

  await waitTimeout(0);
  await waitAnimationFrame();

  expect(attach).toBeCalledTimes(1);
  expect(detach).toBeCalledTimes(1);
  expect(connect).toBeCalledTimes(1);
  expect(disconnect).toBeCalledTimes(1);
});
