import { waitAnimationFrame } from '@maverick-js/std';
import { Component } from 'maverick.js';

import { defineCustomElement, Host, type MaverickElement } from 'maverick.js/element';

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

  const parent = document.createElement(ParentElement.tagName) as MaverickElement;
  parent.setAttribute('keep-alive', '');

  const childA = document.createElement(ChildAElement.tagName) as MaverickElement;
  parent.append(childA);

  const grandchildA = document.createElement(GrandchildAElement.tagName) as MaverickElement;
  childA.append(grandchildA);

  const childB = document.createElement(ChildBElement.tagName) as MaverickElement;
  parent.append(childB);

  const grandchildB = document.createElement(GrandchildBElement.tagName) as MaverickElement;
  childB.append(grandchildB);

  document.body.append(parent);

  defineCustomElement(ParentElement);
  defineCustomElement(ChildAElement);
  defineCustomElement(ChildBElement);
  defineCustomElement(GrandchildAElement);
  defineCustomElement(GrandchildBElement);

  await waitAnimationFrame();

  expect(parent.outerHTML).toMatchInlineSnapshot(
    `"<mk-parent keep-alive=""><mk-child-a keep-alive=""><mk-grandchild-a keep-alive=""></mk-grandchild-a></mk-child-a><mk-child-b keep-alive=""><mk-grandchild-b keep-alive=""></mk-grandchild-b></mk-child-b></mk-parent>"`,
  );

  parent.remove();
  await waitAnimationFrame();

  expect(parent.$.$$.destroyed).toBeFalsy();
  expect(childA.$.$$.destroyed).toBeFalsy();
  expect(childB.$.$$.destroyed).toBeFalsy();
  expect(grandchildA.$.$$.destroyed).toBeFalsy();
  expect(grandchildB.$.$$.destroyed).toBeFalsy();

  (parent as any).destroy();

  expect(parentDispose).toHaveBeenCalledTimes(1);
  expect(childADispose).toHaveBeenCalledTimes(1);
  expect(childBDispose).toHaveBeenCalledTimes(1);
  expect(grandchildADispose).toHaveBeenCalledTimes(1);
  expect(grandchildBDispose).toHaveBeenCalledTimes(1);

  expect(parent.$).toBeUndefined();
  expect(childA.$).toBeUndefined();
  expect(childB.$).toBeUndefined();
  expect(grandchildA.$).toBeUndefined();
  expect(grandchildB.$).toBeUndefined();
});
