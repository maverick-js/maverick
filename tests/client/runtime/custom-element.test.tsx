import { CustomElement, If, observable, render, tick } from 'maverick.js';

import { defineElement } from 'maverick.js/element';

afterEach(() => {
  document.body.innerHTML = '';
});

it('should render custom element', async () => {
  const Button = defineElement({
    tagName: `mk-button-1`,
    setup: ({ host }) => {
      return () => (
        <If condition={!host.$children}>
          <div>Internal</div>
        </If>
      );
    },
  });

  const root = document.createElement('root');

  const $children = observable(<div>Foo</div>);
  render(() => <CustomElement $element={Button}>{$children()}</CustomElement>, { target: root });
  expect(root).toMatchInlineSnapshot(`
    <root>
      <mk-button-1>
        <shadow-root>
          <!--$$-->
          <!--/$-->
        </shadow-root>
        <!--$$-->
        <div>
          Foo
        </div>
        <!--/$-->
      </mk-button-1>
    </root>
  `);

  $children.set(null);
  await tick();
  expect(root).toMatchInlineSnapshot(`
    <root>
      <mk-button-1>
        <shadow-root>
          <!--$$-->
          <div>
            Internal
          </div>
          <!--/$-->
        </shadow-root>
        <!--$$-->
        <!--/$-->
      </mk-button-1>
    </root>
  `);

  $children.set(<div>Bar</div>);
  await tick();
  expect(root).toMatchInlineSnapshot(`
    <root>
      <mk-button-1>
        <shadow-root>
          <!--$$-->
          <!--/$-->
        </shadow-root>
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
      <shadow-root>
        <button>
          Test
        </button>
      </shadow-root>
      <!--$$-->
      <!--/$-->
    </mk-button-2>
  </root>
`);
});

it('should render custom element with only children', () => {
  const Button = defineElement({ tagName: `mk-button-3` });

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
      <shadow-root />
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
        <shadow-root />
        <div>
          INNER HTML
        </div>
      </mk-button-4>
    </root>
  `);
});

it('should render custom element with shadow dom', () => {
  const Button = defineElement({
    tagName: `mk-button-10`,
    shadowRoot: true,
    setup: () => () => <button>Test</button>,
  });

  const root = document.createElement('root');
  render(() => <CustomElement $element={Button} />, { target: root });

  const shadowRoot = (root.firstChild as HTMLElement).shadowRoot;
  expect(shadowRoot?.innerHTML).toMatchInlineSnapshot('"<button>Test</button>"');
});
