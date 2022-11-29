import {
  createContext,
  getContext,
  onError,
  provideContext,
  setContext,
  useContext,
} from 'maverick.js';

import {
  createElementInstance,
  defineCustomElement,
  defineElement,
  MaverickElement,
  onConnect,
} from 'maverick.js/element';
import { waitAnimationFrame } from 'maverick.js/std';

afterEach(() => {
  document.body.innerHTML = '';
});

it('should wait for parents to mount', async () => {
  const Context = createContext<number[]>(() => []);

  const error = new Error();
  const errorHandler = vi.fn();

  const ParentA = defineElement({
    tagName: `mk-parent-a`,
    setup() {
      setContext('foo', 10);
      provideContext(Context, [1]);
      onError(errorHandler);
      return () => null;
    },
  });

  const ParentB = defineElement({
    tagName: `mk-parent-b`,
    setup() {
      const value = useContext(Context);
      expect(value).toEqual([1]);
      provideContext(Context, [...value, 2]);
      return () => null;
    },
  });

  const Child = defineElement({
    tagName: `mk-child`,
    setup() {
      expect(getContext('foo')).toBe(10);

      const value = useContext(Context);
      expect(value).toEqual([1, 2]);
      provideContext(Context, [...value, 3]);

      return () => null;
    },
  });

  const GrandChild = defineElement({
    tagName: `mk-grandchild`,
    setup() {
      const value = useContext(Context);
      expect(value).toEqual([1, 2, 3]);

      onConnect(() => {
        throw error;
      });

      return () => null;
    },
  });

  const parentA = document.createElement(ParentA.tagName) as MaverickElement;
  parentA.setAttribute('mk-d', '');

  const parentB = document.createElement(ParentB.tagName) as MaverickElement;
  parentA.append(parentB);

  const child = document.createElement(Child.tagName) as MaverickElement;
  parentB.append(child);

  const grandchild = document.createElement(GrandChild.tagName) as MaverickElement;
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

  defineCustomElement(GrandChild);
  expect(grandchild.instance?.host.$mounted).toBeFalsy();

  defineCustomElement(Child);
  expect(child.instance?.host.$mounted).toBeFalsy();

  await waitAnimationFrame();
  expect(child.instance?.host.$mounted).toBeFalsy();
  expect(grandchild.instance?.host.$mounted).toBeFalsy();

  defineCustomElement(ParentB);
  await waitAnimationFrame();
  expect(parentB.instance?.host.$mounted).toBeFalsy();
  expect(child.instance?.host.$mounted).toBeFalsy();
  expect(grandchild.instance?.host.$mounted).toBeFalsy();

  defineCustomElement(ParentA);
  parentA.attachComponent(createElementInstance(ParentA));
  expect(parentA.instance?.host.$mounted).toBeTruthy();

  await waitAnimationFrame();

  expect(parentB.instance?.host.$mounted).toBeTruthy();
  expect(child.instance?.host.$mounted).toBeTruthy();
  expect(grandchild.instance?.host.$mounted).toBeTruthy();

  parentA.removeAttribute('mk-d');
  parentA.remove();
  await waitAnimationFrame();

  expect(parentA.instance).toBeNull();
  expect(parentB.instance).toBeNull();
  expect(child.instance).toBeNull();
  expect(grandchild.instance).toBeNull();

  expect(errorHandler).toBeCalledTimes(1);
  expect(errorHandler).toHaveBeenCalledWith(error);
});
