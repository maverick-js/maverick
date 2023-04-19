import { tick } from '@maverick-js/signals';

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

it('should keep elements alive', async () => {
  const parentDispose = vi.fn(),
    childADispose = vi.fn(),
    childBDispose = vi.fn(),
    grandchildADispose = vi.fn(),
    grandchildBDispose = vi.fn();

  class Parent extends Component {
    static el = defineElement({ tagName: 'mk-parent' });
    protected override onDestroy() {
      parentDispose();
    }
  }

  class ChildA extends Component {
    static el = defineElement({ tagName: 'mk-child-a' });
    protected override onDestroy() {
      childADispose();
    }
  }

  class ChildB extends Component {
    static el = defineElement({ tagName: 'mk-child-b' });
    protected override onDestroy() {
      childBDispose();
    }
  }

  class GrandchildA extends Component {
    static el = defineElement({ tagName: 'mk-grandchild-a' });
    protected override onDestroy() {
      grandchildADispose();
    }
  }

  class GrandchildB extends Component {
    static el = defineElement({ tagName: 'mk-grandchild-b' });
    protected override onDestroy() {
      grandchildBDispose();
    }
  }

  const parent = document.createElement(Parent.el.tagName) as HTMLCustomElement;
  parent.setAttribute('mk-d', '');
  parent.setAttribute('keep-alive', '');

  const childA = document.createElement(ChildA.el.tagName) as HTMLCustomElement;
  parent.append(childA);

  const grandchildA = document.createElement(GrandchildA.el.tagName) as HTMLCustomElement;
  childA.append(grandchildA);

  const childB = document.createElement(ChildB.el.tagName) as HTMLCustomElement;
  parent.append(childB);

  const grandchildB = document.createElement(GrandchildB.el.tagName) as HTMLCustomElement;
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

  parent.attachComponent(createComponent(Parent));
  await waitAnimationFrame();
  expect(parent.component).toBeTruthy();

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

  expect(parent.component).toBeTruthy();
  expect(childA.component).toBeTruthy();
  expect(childB.component).toBeTruthy();
  expect(grandchildA.component).toBeTruthy();
  expect(grandchildB.component).toBeTruthy();

  parent.component?.destroy();
  tick();

  expect(parentDispose).toHaveBeenCalledTimes(1);
  expect(childADispose).toHaveBeenCalledTimes(1);
  expect(childBDispose).toHaveBeenCalledTimes(1);
  expect(grandchildADispose).toHaveBeenCalledTimes(1);
  expect(grandchildBDispose).toHaveBeenCalledTimes(1);

  expect(parent.component).toBeNull();
  expect(childA.component).toBeNull();
  expect(childB.component).toBeNull();
  expect(grandchildA.component).toBeNull();
  expect(grandchildB.component).toBeNull();
});
