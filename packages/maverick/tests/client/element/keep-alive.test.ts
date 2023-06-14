import { Component } from 'maverick.js';

import { defineCustomElement, Host } from 'maverick.js/element';
import { waitAnimationFrame } from 'maverick.js/std';

import { COMPONENT } from '../../../src/element/symbols';

afterEach(() => {
  document.body.innerHTML = '';
});

it('should keep elements alive', async () => {
  const parentDispose = vi.fn(),
    childADispose = vi.fn(),
    childBDispose = vi.fn(),
    grandchildADispose = vi.fn(),
    grandchildBDispose = vi.fn();

  function createElement(name: string, dispose: () => void) {
    return class extends Host(
      HTMLElement,
      class extends Component {
        protected override onDestroy() {
          dispose();
        }
      },
    ) {
      static tagName = name;
    };
  }

  const ParentElement = createElement('mk-parent', parentDispose),
    ChildAElement = createElement('mk-child-a', childADispose),
    ChildBElement = createElement('mk-child-b', childBDispose),
    GrandchildAElement = createElement('mk-grandchild-a', grandchildADispose),
    GrandchildBElement = createElement('mk-grandchild-b', grandchildBDispose);

  const parent = document.createElement(ParentElement.tagName);
  parent.setAttribute('keep-alive', '');

  const childA = document.createElement(ChildAElement.tagName);
  parent.append(childA);

  const grandchildA = document.createElement(GrandchildAElement.tagName);
  childA.append(grandchildA);

  const childB = document.createElement(ChildBElement.tagName);
  parent.append(childB);

  const grandchildB = document.createElement(GrandchildBElement.tagName);
  childB.append(grandchildB);

  document.body.append(parent);

  defineCustomElement(ParentElement);
  defineCustomElement(ChildAElement);
  defineCustomElement(ChildBElement);
  defineCustomElement(GrandchildAElement);
  defineCustomElement(GrandchildBElement);

  await waitAnimationFrame();

  expect(parent).toMatchInlineSnapshot(`
    <mk-parent
      keep-alive=""
    >
      <mk-child-a
        keep-alive=""
      >
        <mk-grandchild-a
          keep-alive=""
        />
      </mk-child-a>
      <mk-child-b
        keep-alive=""
      >
        <mk-grandchild-b
          keep-alive=""
        />
      </mk-child-b>
    </mk-parent>
  `);

  parent.remove();
  await waitAnimationFrame();

  expect(parent[COMPONENT].$._destroyed).toBeFalsy();
  expect(childA[COMPONENT].$._destroyed).toBeFalsy();
  expect(childB[COMPONENT].$._destroyed).toBeFalsy();
  expect(grandchildA[COMPONENT].$._destroyed).toBeFalsy();
  expect(grandchildB[COMPONENT].$._destroyed).toBeFalsy();

  (parent as any).destroy();

  expect(parentDispose).toHaveBeenCalledTimes(1);
  expect(childADispose).toHaveBeenCalledTimes(1);
  expect(childBDispose).toHaveBeenCalledTimes(1);
  expect(grandchildADispose).toHaveBeenCalledTimes(1);
  expect(grandchildBDispose).toHaveBeenCalledTimes(1);

  expect(parent[COMPONENT].$._destroyed).toBeTruthy();
  expect(childA[COMPONENT].$._destroyed).toBeTruthy();
  expect(childB[COMPONENT].$._destroyed).toBeTruthy();
  expect(grandchildA[COMPONENT].$._destroyed).toBeTruthy();
  expect(grandchildB[COMPONENT].$._destroyed).toBeTruthy();
});
