import { getContext, setContext } from '@maverick-js/signals';
import { Component, createContext, onError, provideContext, useContext } from 'maverick.js';

import 'maverick.js/element';
import { defineCustomElement, Host } from 'maverick.js/element';
import { waitAnimationFrame } from 'maverick.js/std';

import { COMPONENT, SETUP_STATE } from '../../../src/element/symbols';

afterEach(() => {
  document.body.innerHTML = '';
});

it('should wait for parents to connect', async () => {
  const Context = createContext<number[]>(() => []);

  const error = new Error(),
    errorHandler = vi.fn();

  class ParentA extends Component {
    constructor() {
      super();
      setContext('foo', 10);
      provideContext(Context, [1]);
      onError(errorHandler);
    }
  }

  class ParentAElement extends Host(HTMLElement, ParentA) {
    static tagName = 'mk-parent-a';
  }

  class ParentB extends Component {
    constructor() {
      super();
    }

    protected override onAttach(): void {
      const value = useContext(Context);
      expect(value).toEqual([1]);
      provideContext(Context, [...value, 2]);
    }
  }

  class ParentBElement extends Host(HTMLElement, ParentB) {
    static tagName = 'mk-parent-b';
  }

  class Child extends Component {
    constructor() {
      super();
    }

    protected override onAttach(): void {
      expect(getContext('foo')).toBe(10);
      const value = useContext(Context);
      expect(value).toEqual([1, 2]);
      provideContext(Context, [...value, 3]);
    }
  }

  class ChildElement extends Host(HTMLElement, Child) {
    static tagName = 'mk-child';
  }

  class GrandChild extends Component {
    constructor() {
      super();
    }

    protected override onAttach(): void {
      const value = useContext(Context);
      expect(value).toEqual([1, 2, 3]);
    }

    protected override onConnect() {
      throw error;
    }
  }

  class GrandChildElement extends Host(HTMLElement, GrandChild) {
    static tagName = 'mk-grandchild';
  }

  const parentA = document.createElement(ParentAElement.tagName);

  const parentB = document.createElement(ParentBElement.tagName);
  parentA.append(parentB);

  const child = document.createElement(ChildElement.tagName);
  parentB.append(child);

  const grandchild = document.createElement(GrandChildElement.tagName);
  child.append(grandchild);

  document.body.append(parentA);

  expect(document.body).toMatchInlineSnapshot(`
    <body>
      <mk-parent-a>
        <mk-parent-b>
          <mk-child>
            <mk-grandchild />
          </mk-child>
        </mk-parent-b>
      </mk-parent-a>
    </body>
  `);

  defineCustomElement(GrandChildElement);
  expect(grandchild[SETUP_STATE] === 2).toBeFalsy();

  defineCustomElement(ChildElement);
  expect(child[SETUP_STATE] === 2).toBeFalsy();

  await waitAnimationFrame();

  defineCustomElement(ParentBElement);
  await waitAnimationFrame();

  // not ready
  expect(parentB[SETUP_STATE] === 2).toBeFalsy();
  expect(child[SETUP_STATE] === 2).toBeFalsy();
  expect(grandchild[SETUP_STATE] === 2).toBeFalsy();

  defineCustomElement(ParentAElement);
  expect(parentA[SETUP_STATE] === 2).toBeTruthy();

  await waitAnimationFrame();

  expect(parentB[SETUP_STATE] === 2).toBeTruthy();
  expect(child[SETUP_STATE] === 2).toBeTruthy();
  expect(grandchild[SETUP_STATE] === 2).toBeTruthy();

  parentA.remove();
  await waitAnimationFrame();

  expect(parentA[COMPONENT].$._destroyed).toBeTruthy();
  expect(parentB[COMPONENT].$._destroyed).toBeTruthy();
  expect(child[COMPONENT].$._destroyed).toBeTruthy();
  expect(grandchild[COMPONENT].$._destroyed).toBeTruthy();

  expect(errorHandler).toBeCalledTimes(1);
  expect(errorHandler).toHaveBeenCalledWith(error);
});
