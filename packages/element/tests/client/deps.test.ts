import {
  defineMaverickElement,
  type MaverickElement,
  SETUP_STATE_SYMBOL,
} from '@maverick-js/element';
import { getContext, setContext } from '@maverick-js/signals';
import { waitAnimationFrame, waitTimeout } from '@maverick-js/std';
import {
  createContext,
  type CustomElementOptions,
  MaverickComponent,
  onConnect,
  onError,
  onSetup,
  provideContext,
  useContext,
} from 'maverick.js';

const target = document.body;

afterEach(() => {
  target.innerHTML = '';
});

it('should wait for parents to connect', async () => {
  const Context = createContext<number[]>(() => []);

  const error = new Error(),
    errorHandler = vi.fn();

  class ParentA extends MaverickComponent {
    static element: CustomElementOptions = {
      name: 'mk-parent-a',
    };

    constructor() {
      super();
      setContext('foo', 10);
      provideContext(Context, [1]);
      onError(errorHandler);
    }
  }

  class ParentB extends MaverickComponent {
    static element: CustomElementOptions = {
      name: 'mk-parent-b',
    };

    constructor() {
      super();
      onSetup(this.#onSetup.bind(this));
    }

    #onSetup() {
      const value = useContext(Context);
      expect(value).toEqual([1]);
      provideContext(Context, [...value, 2]);
    }
  }

  class Child extends MaverickComponent {
    static element: CustomElementOptions = {
      name: 'mk-child',
    };

    constructor() {
      super();
      onSetup(this.#onSetup.bind(this));
    }

    #onSetup() {
      expect(getContext('foo')).toBe(10);
      const value = useContext(Context);
      expect(value).toEqual([1, 2]);
      provideContext(Context, [...value, 3]);
    }
  }

  class GrandChild extends MaverickComponent {
    static element: CustomElementOptions = {
      name: 'mk-grandchild',
    };

    constructor() {
      super();
      onSetup(this.#onSetup.bind(this));
      onConnect(this.#onConnect.bind(this));
    }

    #onSetup() {
      const value = useContext(Context);
      expect(value).toEqual([1, 2, 3]);
    }

    #onConnect() {
      throw error;
    }
  }

  const parentA = document.createElement(ParentA.element.name);

  const parentB = document.createElement(ParentB.element.name);
  parentA.append(parentB);

  const child = document.createElement(Child.element.name);
  parentB.append(child);

  const grandchild = document.createElement(GrandChild.element.name);
  child.append(grandchild);

  target.append(parentA);

  expect(target).toMatchSnapshot();

  defineMaverickElement(GrandChild);
  expect(grandchild[SETUP_STATE_SYMBOL] === 1).toBeTruthy();

  defineMaverickElement(Child);
  expect(child[SETUP_STATE_SYMBOL] === 1).toBeTruthy();

  window.customElements.whenDefined(GrandChild.element.name);
  window.customElements.whenDefined(Child.element.name);

  expect(child[SETUP_STATE_SYMBOL] === 1).toBeTruthy();
  expect(grandchild[SETUP_STATE_SYMBOL] === 1).toBeTruthy();

  defineMaverickElement(ParentB);
  window.customElements.whenDefined(ParentB.element.name);

  expect(parentB[SETUP_STATE_SYMBOL] === 1).toBeTruthy();

  defineMaverickElement(ParentA);
  window.customElements.whenDefined(ParentA.element.name);

  expect(parentA[SETUP_STATE_SYMBOL] === 2).toBeTruthy();

  await waitAnimationFrame();

  expect(parentB[SETUP_STATE_SYMBOL] === 2).toBeTruthy();
  expect(child[SETUP_STATE_SYMBOL] === 2).toBeTruthy();
  expect(grandchild[SETUP_STATE_SYMBOL] === 2).toBeTruthy();

  parentA.remove();

  await waitTimeout(0);
  await waitAnimationFrame();

  expect((parentA as MaverickElement).$).toBeUndefined();
  expect((parentB as MaverickElement).$).toBeUndefined();
  expect((child as MaverickElement).$).toBeUndefined();
  expect((grandchild as MaverickElement).$).toBeUndefined();

  expect(errorHandler).toBeCalledTimes(1);
  expect(errorHandler).toHaveBeenCalledWith(error);
});
