import { CustomElement, HostElement, observable, render, tick } from 'maverick.js';

import { defineElement } from 'maverick.js/element';

it('should render attributes', async () => {
  const foo = observable(1);

  const Button = defineElement({
    tagName: `mk-button-1`,
    setup: () => () => <HostElement data-foo={foo} />,
  });

  const root = document.createElement('root');

  render(() => <CustomElement $element={Button} />, { target: root });
  expect(root).toMatchInlineSnapshot(`
    <root>
      <mk-button-1
        data-foo="1"
      >
        <shadow-root />
        <!--$$-->
        <!--/$-->
      </mk-button-1>
    </root>
  `);

  foo.set(2);
  await tick();
  expect(root).toMatchInlineSnapshot(`
    <root>
      <mk-button-1
        data-foo="2"
      >
        <shadow-root />
        <!--$$-->
        <!--/$-->
      </mk-button-1>
    </root>
  `);
});

it('should render children', () => {
  const Button = defineElement({
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
      <mk-button-2>
        <shadow-root>
          <div>
            Foo
          </div>
          <div>
            Bar
          </div>
        </shadow-root>
        <!--$$-->
        <!--/$-->
      </mk-button-2>
    </root>
  `);
});
