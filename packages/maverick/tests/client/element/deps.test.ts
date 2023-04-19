import { getContext, setContext } from '@maverick-js/signals';
import { createContext, onError, provideContext, useContext } from 'maverick.js';

import {
  Component,
  createComponent,
  defineElement,
  type HTMLCustomElement,
  registerCustomElement,
} from 'maverick.js/element';
import { waitAnimationFrame } from 'maverick.js/std';

afterEach(() => {
  document.body.innerHTML = '';
});

it('should wait for parents to connect', async () => {
  const Context = createContext<number[]>(() => []);

  const error = new Error();
  const errorHandler = vi.fn();

  class ParentA extends Component {
    static el = defineElement({
      tagName: 'mk-parent-a',
    });

    constructor(component) {
      super(component);
      setContext('foo', 10);
      provideContext(Context, [1]);
      onError(errorHandler);
    }
  }

  class ParentB extends Component {
    static el = defineElement({
      tagName: 'mk-parent-b',
    });

    constructor(component) {
      super(component);
      const value = useContext(Context);
      expect(value).toEqual([1]);
      provideContext(Context, [...value, 2]);
    }
  }

  class Child extends Component {
    static el = defineElement({
      tagName: 'mk-child',
    });

    constructor(component) {
      super(component);
      expect(getContext('foo')).toBe(10);
      const value = useContext(Context);
      expect(value).toEqual([1, 2]);
      provideContext(Context, [...value, 3]);
    }
  }

  class GrandChild extends Component {
    static el = defineElement({
      tagName: 'mk-grandchild',
    });

    constructor(component) {
      super(component);
      const value = useContext(Context);
      expect(value).toEqual([1, 2, 3]);
    }

    protected override onConnect() {
      throw error;
    }
  }

  const parentA = document.createElement(ParentA.el.tagName) as HTMLCustomElement;
  parentA.setAttribute('mk-d', '');

  const parentB = document.createElement(ParentB.el.tagName) as HTMLCustomElement;
  parentA.append(parentB);

  const child = document.createElement(Child.el.tagName) as HTMLCustomElement;
  parentB.append(child);

  const grandchild = document.createElement(GrandChild.el.tagName) as HTMLCustomElement;
  child.append(grandchild);

  document.body.append(parentA);

  expect(document.body).toMatchInlineSnapshot(`
    <body>
      <mk-parent-a
        mk-d=""
      >
        <mk-parent-b>
          <mk-child>
            <mk-grandchild />
          </mk-child>
        </mk-parent-b>
      </mk-parent-a>
    </body>
  `);

  registerCustomElement(GrandChild);
  expect(grandchild.component).toBeFalsy();

  registerCustomElement(Child);
  expect(child.component).toBeFalsy();

  await waitAnimationFrame();
  expect(child.component).toBeFalsy();
  expect(grandchild.component).toBeFalsy();

  registerCustomElement(ParentB);
  await waitAnimationFrame();
  expect(parentB.component).toBeFalsy();
  expect(child.component).toBeFalsy();
  expect(grandchild.component).toBeFalsy();

  registerCustomElement(ParentA);
  parentA.attachComponent(createComponent(ParentA));
  expect(parentA.component).toBeTruthy();

  await waitAnimationFrame();

  expect(parentB.component).toBeTruthy();
  expect(child.component).toBeTruthy();
  expect(grandchild.component).toBeTruthy();

  parentA.removeAttribute('mk-d');
  parentA.remove();
  await waitAnimationFrame();

  expect(parentA.component).toBeNull();
  expect(parentB.component).toBeNull();
  expect(child.component).toBeNull();
  expect(grandchild.component).toBeNull();

  expect(errorHandler).toBeCalledTimes(1);
  expect(errorHandler).toHaveBeenCalledWith(error);
});
