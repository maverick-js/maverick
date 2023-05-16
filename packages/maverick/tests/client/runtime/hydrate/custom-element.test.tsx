import { signal } from 'maverick.js';

import { hydrate } from 'maverick.js/dom';
import { Component, defineElement, registerCustomElement } from 'maverick.js/element';

import { startMarker } from '../utils';

it('should hydrate custom element', () => {
  class TestComponent extends Component {
    static el = defineElement({ tagName: 'mk-test-1' });
  }

  registerCustomElement(TestComponent);

  const child = document.createElement('div');
  child.appendChild(document.createTextNode('Foo'));

  const el = document.createElement('mk-test-1');
  el.setAttribute('mk-d', '');
  el.setAttribute('mk-h', '');
  el.appendChild(startMarker());
  el.appendChild(startMarker());
  el.appendChild(child);

  const root = document.createElement('root');
  root.appendChild(startMarker());
  root.appendChild(el);

  document.body.appendChild(root);

  expect(root).toMatchInlineSnapshot(`
    <root>
      <!--$-->
      <mk-test-1
        mk-d=""
        mk-h=""
      >
        <!--$-->
        <!--$-->
        <div>
          Foo
        </div>
      </mk-test-1>
    </root>
  `);

  const click = vi.fn();
  const $children = signal<any>(() => (
    <div $ref={(el) => expect(el === child).toBeTruthy()} $on:click={click}>
      Foo
    </div>
  ));

  hydrate(() => <mk-test-1 $ref={(e) => expect(e === el).toBeTruthy()}>{$children()}</mk-test-1>, {
    target: root,
  });

  expect(root).toMatchInlineSnapshot(`
    <root>
      <!--$-->
      <mk-test-1
        mk-d=""
        mk-h=""
      >
        <!--$-->
        <!--$-->
        <div>
          Foo
        </div>
      </mk-test-1>
    </root>
  `);

  expect(el.component).toBeDefined();

  child.dispatchEvent(new MouseEvent('click'));
  expect(click).toHaveBeenCalledOnce();

  expect(root).toMatchInlineSnapshot(`
    <root>
      <!--$-->
      <mk-test-1
        mk-d=""
        mk-h=""
      >
        <!--$-->
        <!--$-->
        <div>
          Foo
        </div>
      </mk-test-1>
    </root>
  `);
});
