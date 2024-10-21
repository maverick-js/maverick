import { type CustomElementOptions, MaverickComponent, onDestroy } from '@maverick-js/core';
import { defineMaverickElement, type MaverickElement } from '@maverick-js/element';
import { waitAnimationFrame } from '@maverick-js/std';

const target = document.body;

afterEach(() => {
  target.innerHTML = '';
});

function create(name: string, dispose: () => void) {
  return class extends MaverickComponent {
    static element: CustomElementOptions = {
      name,
    };
    constructor() {
      super();
      onDestroy(dispose);
    }
  };
}

it('should keep elements alive', async () => {
  const parentDispose = vi.fn(),
    childADispose = vi.fn(),
    childBDispose = vi.fn(),
    grandchildADispose = vi.fn(),
    grandchildBDispose = vi.fn();

  const Parent = create('mk-parent', parentDispose),
    ChildA = create('mk-child-a', childADispose),
    ChildB = create('mk-child-b', childBDispose),
    GrandchildA = create('mk-grandchild-a', grandchildADispose),
    GrandchildB = create('mk-grandchild-b', grandchildBDispose);

  const parent = document.createElement(Parent.element.name) as MaverickElement;
  parent.setAttribute('keep-alive', '');

  const childA = document.createElement(ChildA.element.name) as MaverickElement;
  parent.append(childA);

  const grandchildA = document.createElement(GrandchildA.element.name) as MaverickElement;
  childA.append(grandchildA);

  const childB = document.createElement(ChildB.element.name) as MaverickElement;
  parent.append(childB);

  const grandchildB = document.createElement(GrandchildB.element.name) as MaverickElement;
  childB.append(grandchildB);

  target.append(parent);

  defineMaverickElement(Parent);
  defineMaverickElement(ChildA);
  defineMaverickElement(ChildB);
  defineMaverickElement(GrandchildA);
  defineMaverickElement(GrandchildB);

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
