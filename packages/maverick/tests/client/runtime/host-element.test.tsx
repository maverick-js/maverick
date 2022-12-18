import { CustomElement, HostElement, render, signal, tick } from 'maverick.js';

import { defineCustomElement } from 'maverick.js/element';

it.skip('should render attributes', () => {
  const foo = signal(1);

  const Button = defineCustomElement({
    tagName: `mk-button-100`,
    setup: () => () => <HostElement data-foo={foo} />,
  });

  const root = document.createElement('root');

  render(() => <CustomElement $element={Button} />, { target: root });
  expect(root).toMatchInlineSnapshot(`
    <root>
      <mk-button-1
        data-foo="1"
        mk-d=""
      >
        <shadow-root />
      </mk-button-1>
    </root>
  `);

  foo.set(2);
  tick();
  expect(root).toMatchInlineSnapshot(`
    <root>
      <mk-button-1
        data-foo="2"
        mk-d=""
      >
        <shadow-root />
      </mk-button-1>
    </root>
  `);
});

it('should render children', () => {
  const Button = defineCustomElement({
    tagName: `mk-button-2`,
    setup: () => () =>
      (
        <HostElement>
          <div>Foo</div>
          <div>Bar</div>
        </HostElement>
      ),
  });

  const root = document.createElement('root');

  render(() => <CustomElement $element={Button} />, { target: root });
  expect(root).toMatchInlineSnapshot(`
    <root>
      <mk-button-2
        mk-d=""
      >
        <shadow-root>
          <div>
            Foo
          </div>
          <div>
            Bar
          </div>
        </shadow-root>
      </mk-button-2>
    </root>
  `);
});
