import { CustomElement, observable, render, tick } from 'maverick.js';
import { defineElement } from 'maverick.js/element';

it('should render custom element', async () => {
  const Button = defineElement({
    tagName: `mk-button-1`,
    setup:
      ({ host }) =>
      () =>
        !host.$children && <div>Internal</div>,
  });

  const root = document.createElement('root');

  const children = observable(<div>Foo</div>);
  render(() => <CustomElement $element={Button}>{children()}</CustomElement>, { target: root });
  expect(root).toMatchInlineSnapshot(`
    <root>
      <mk-button-1>
        <!--$$-->
        <!--/$-->
        <!--$$-->
        <div>
          Foo
        </div>
        <!--/$-->
      </mk-button-1>
    </root>
  `);

  children.set(null);
  await tick();
  expect(root).toMatchInlineSnapshot(`
    <root>
      <mk-button-1>
        <!--$$-->
        <!--#internal-->
        <div>
          Internal
        </div>
        <!--/#internal-->
        <!--/$-->
        <!--$$-->
        <!--/$-->
      </mk-button-1>
    </root>
  `);

  children.set(<div>Bar</div>);
  await tick();
  expect(root).toMatchInlineSnapshot(`
    <root>
      <mk-button-1>
        <!--$$-->
        <!--/$-->
        <!--$$-->
        <div>
          Bar
        </div>
        <!--/$-->
      </mk-button-1>
    </root>
  `);
});

it('should render custom element with only internal content', () => {
  const Button = defineElement({
    tagName: `mk-button-2`,
    setup: () => () => <button>Test</button>,
  });

  const root = document.createElement('root');
  render(() => <CustomElement $element={Button} />, { target: root });

  expect(root).toMatchInlineSnapshot(`
  <root>
    <mk-button-2>
      <!--#internal-->
      <button>
        Test
      </button>
      <!--/#internal-->
      <!--$$-->
      <!--/$-->
    </mk-button-2>
  </root>
`);
});

it('should render custom element with only children', () => {
  const Button = defineElement({
    tagName: `mk-button-3`,
    setup: () => () => null,
  });

  const root = document.createElement('root');
  render(
    () => (
      <CustomElement $element={Button}>
        <div>Children</div>
      </CustomElement>
    ),
    { target: root },
  );

  expect(root).toMatchInlineSnapshot(`
  <root>
    <mk-button-3>
      <!--$$-->
      <div>
        Children
      </div>
      <!--/$-->
    </mk-button-3>
  </root>
`);
});

it('should render custom element with inner html', () => {
  const Button = defineElement({
    tagName: `mk-button-4`,
    setup:
      ({ host }) =>
      () =>
        !host.$children && <div>Foo</div>,
  });

  const root = document.createElement('root');
  render(
    () => (
      <CustomElement $element={Button} $prop:innerHTML="<div>INNER HTML</div>">
        <div>Children</div>
      </CustomElement>
    ),
    { target: root },
  );

  expect(root).toMatchInlineSnapshot(`
  <root>
    <mk-button-4>
      <!--$$-->
      <!--/$-->
      <div>
        INNER HTML
      </div>
    </mk-button-4>
  </root>
`);
});
