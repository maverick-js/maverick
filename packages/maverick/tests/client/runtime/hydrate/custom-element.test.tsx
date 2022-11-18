import { CustomElement, hydrate, observable, tick } from 'maverick.js';

import { defineElement } from 'maverick.js/element';

import { startMarker } from '../utils';

it('should hydrate custom element', async () => {
  const Foo = defineElement({ tagName: `mk-foo` });

  const child = document.createElement('div');
  child.appendChild(document.createTextNode('Foo'));

  const el = document.createElement('mk-foo');
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
      <mk-foo
        mk-d=""
        mk-h=""
      >
        <!--$-->
        <div>
          Foo
        </div>
      </mk-foo>
    </root>
  `);

  const click = vi.fn();
  const $children = observable<any>(() => <div $on:click={click}>Foo</div>);

  hydrate(() => <CustomElement $element={Foo}>{$children}</CustomElement>, { target: root });

  expect(root).toMatchInlineSnapshot(`
    <root>
      <!--$-->
      <mk-foo
        mk-d=""
        mk-h=""
      >
        <shadow-root />
        <!--$$-->
        <!--$-->
        <div>
          Foo
        </div>
        <!--/$-->
      </mk-foo>
    </root>
  `);

  child.dispatchEvent(new MouseEvent('click'));
  expect(click).toHaveBeenCalledOnce();

  $children.set(null);
  await tick();

  expect(root).toMatchInlineSnapshot(`
    <root>
      <!--$-->
      <mk-foo
        mk-d=""
        mk-h=""
      >
        <shadow-root />
        <!--$$-->
        <!--/$-->
      </mk-foo>
    </root>
  `);
});
