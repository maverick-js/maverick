import { CustomElement, signal, tick } from 'maverick.js';

import { hydrate } from 'maverick.js/dom';
import { Component, defineElement } from 'maverick.js/element';

import { startMarker } from '../utils';

it('should hydrate custom element', () => {
  class TestComponent extends Component {
    static el = defineElement({ tagName: 'mk-test' });
  }

  const child = document.createElement('div');
  child.appendChild(document.createTextNode('Foo'));

  const el = document.createElement('mk-test');
  el.setAttribute('mk-d', '');
  el.setAttribute('mk-h', '');
  el.appendChild(startMarker());
  el.appendChild(child);

  const root = document.createElement('root');
  root.appendChild(startMarker());
  root.appendChild(el);

  document.body.appendChild(root);

  expect(root).toMatchInlineSnapshot(`
    <root>
      <!--$-->
      <mk-test
        mk-d=""
        mk-h=""
      >
        <!--$-->
        <div>
          Foo
        </div>
      </mk-test>
    </root>
  `);

  const click = vi.fn();
  const $children = signal<any>(() => <div $on:click={click}>Foo</div>);

  hydrate(() => <CustomElement $this={TestComponent}>{$children}</CustomElement>, {
    target: root,
  });

  expect(root).toMatchInlineSnapshot(`
    <root>
      <!--$-->
      <mk-test
        mk-d=""
        mk-h=""
      >
        <!--$-->
        <div>
          Foo
        </div>
      </mk-test>
    </root>
  `);

  child.dispatchEvent(new MouseEvent('click'));
  expect(click).toHaveBeenCalledOnce();

  $children.set(null);
  tick();

  expect(root).toMatchInlineSnapshot(`
    <root>
      <!--$-->
      <mk-test
        mk-d=""
        mk-h=""
      />
    </root>
  `);
});
