import { onDispose, tick } from '@maverick-js/signals';

import {
  createElementInstance,
  defineCustomElement,
  HTMLCustomElement,
  registerCustomElement,
} from 'maverick.js/element';
import { waitAnimationFrame } from 'maverick.js/std';

afterEach(() => {
  document.body.innerHTML = '';
});

it('should keep elements alive', async () => {
  const parentADispose = vi.fn(),
    childADispose = vi.fn(),
    childBDispose = vi.fn(),
    grandchildADispose = vi.fn(),
    grandchildBDispose = vi.fn();

  const Parent = defineCustomElement({
    tagName: `mk-parent`,
    setup() {
      onDispose(parentADispose);
    },
  });

  const ChildA = defineCustomElement({
    tagName: `mk-child-a`,
    setup() {
      onDispose(childADispose);
    },
  });

  const ChildB = defineCustomElement({
    tagName: `mk-child-b`,
    setup() {
      onDispose(childBDispose);
    },
  });

  const GrandchildA = defineCustomElement({
    tagName: `mk-grandchild-a`,
    setup() {
      onDispose(grandchildADispose);
    },
  });

  const GrandchildB = defineCustomElement({
    tagName: `mk-grandchild-b`,
    setup() {
      onDispose(grandchildBDispose);
    },
  });

  const parent = document.createElement(Parent.tagName) as HTMLCustomElement;
  parent.setAttribute('mk-d', '');
  parent.setAttribute('keep-alive', '');

  const childA = document.createElement(ChildA.tagName) as HTMLCustomElement;
  parent.append(childA);

  const grandchildA = document.createElement(GrandchildA.tagName) as HTMLCustomElement;
  childA.append(grandchildA);

  const childB = document.createElement(ChildB.tagName) as HTMLCustomElement;
  parent.append(childB);

  const grandchildB = document.createElement(GrandchildB.tagName) as HTMLCustomElement;
  childB.append(grandchildB);

  document.body.append(parent);

  expect(document.body).toMatchInlineSnapshot(`
    <body>
      <mk-parent
        keep-alive=""
        mk-d=""
      >
        <mk-child-a>
          <mk-grandchild-a />
        </mk-child-a>
        <mk-child-b>
          <mk-grandchild-b />
        </mk-child-b>
      </mk-parent>
    </body>
  `);

  registerCustomElement(Parent);
  registerCustomElement(ChildA);
  registerCustomElement(ChildB);
  registerCustomElement(GrandchildA);
  registerCustomElement(GrandchildB);

  parent.attachComponent(createElementInstance(Parent));
  await waitAnimationFrame();
  expect(parent.instance?.host.$connected()).toBeTruthy();

  expect(parent).toMatchInlineSnapshot(`
    <mk-parent
      keep-alive=""
      mk-d=""
    >
      <mk-child-a>
        <mk-grandchild-a />
      </mk-child-a>
      <mk-child-b>
        <mk-grandchild-b />
      </mk-child-b>
    </mk-parent>
  `);

  parent.removeAttribute('mk-d');
  parent.remove();

  await waitAnimationFrame();

  expect(parent.instance!.host.$connected()).toBeFalsy();
  expect(childA.instance!.host.$connected()).toBeFalsy();
  expect(childB.instance!.host.$connected()).toBeFalsy();
  expect(grandchildA.instance!.host.$connected()).toBeFalsy();
  expect(grandchildB.instance!.host.$connected()).toBeFalsy();

  parent.instance!.destroy();
  tick();

  expect(parentADispose).toHaveBeenCalledTimes(1);
  expect(childADispose).toHaveBeenCalledTimes(1);
  expect(childBDispose).toHaveBeenCalledTimes(1);
  expect(grandchildADispose).toHaveBeenCalledTimes(1);
  expect(grandchildBDispose).toHaveBeenCalledTimes(1);

  expect(parent.instance).toBeNull();
  expect(childA.instance).toBeNull();
  expect(childB.instance).toBeNull();
  expect(grandchildA.instance).toBeNull();
  expect(grandchildB.instance).toBeNull();
});
