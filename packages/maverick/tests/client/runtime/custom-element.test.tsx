import { createContext, CustomElement, provideContext, tick, useContext } from 'maverick.js';

import { render } from 'maverick.js/dom';
import { defineCustomElement } from 'maverick.js/element';

afterEach(() => {
  document.body.innerHTML = '';
});

it('should render empty custom element', () => {
  const Foo = defineCustomElement({ tagName: `mk-foo` });
  const root = document.createElement('root');
  render(() => <CustomElement $element={Foo} />, { target: root });
  expect(root).toMatchInlineSnapshot(`
    <root>
      <mk-foo
        mk-d=""
      />
    </root>
  `);
});

it('should render custom element with only internal content', () => {
  const Foo = defineCustomElement({
    tagName: `mk-foo-2`,
    setup: () => () => <button>Test</button>,
  });

  const root = document.createElement('root');
  render(
    () => (
      <CustomElement $element={Foo}>
        <div>Foo</div>
      </CustomElement>
    ),
    { target: root },
  );

  expect(root).toMatchInlineSnapshot(`
    <root>
      <mk-foo-2
        mk-d=""
      >
        <shadow-root>
          <button>
            Test
          </button>
        </shadow-root>
      </mk-foo-2>
    </root>
  `);
});

it('should render custom element with only children', () => {
  const Foo = defineCustomElement({ tagName: `mk-foo-3` });

  const root = document.createElement('root');
  render(
    () => (
      <CustomElement $element={Foo}>
        <div>Children</div>
      </CustomElement>
    ),
    { target: root },
  );

  expect(root).toMatchInlineSnapshot(`
    <root>
      <mk-foo-3
        mk-d=""
      >
        <div>
          Children
        </div>
      </mk-foo-3>
    </root>
  `);
});

it('should render custom element with inner html', () => {
  const Foo = defineCustomElement({
    tagName: `mk-foo-4`,
    setup: () => () => <div>Foo</div>,
  });

  const root = document.createElement('root');
  render(
    () => (
      <CustomElement $element={Foo} $prop:innerHTML="<div>INNER HTML</div>">
        <div>Children</div>
      </CustomElement>
    ),
    { target: root },
  );

  expect(root).toMatchInlineSnapshot(`
    <root>
      <mk-foo-4
        mk-d=""
      >
        <div>
          INNER HTML
        </div>
      </mk-foo-4>
    </root>
  `);
});

it('should render custom element with shadow dom', () => {
  const Foo = defineCustomElement({
    tagName: `mk-foo-10`,
    shadowRoot: true,
    setup: () => () => <button>Test</button>,
  });

  const root = document.createElement('root');
  render(() => <CustomElement $element={Foo} />, { target: root });

  const shadowRoot = (root.firstChild as HTMLElement).shadowRoot;
  expect(shadowRoot?.innerHTML).toMatchInlineSnapshot('"<button>Test</button>"');
});

it('should forward context to another custom element', () => {
  const Context = createContext(() => 0);
  const ContextB = createContext(() => 0);

  function Component() {
    provideContext(ContextB, 1);
    expect(useContext(Context)).toBe(1);
    expect(useContext(ContextB)).toBe(1);
    return null;
  }

  const Parent = defineCustomElement({
    tagName: `mk-parent`,
    setup: () => {
      provideContext(Context, 1);
      return () => <Component />;
    },
  });

  const Child = defineCustomElement({
    tagName: `mk-child`,
    setup: () => {
      expect(useContext(Context)).toBe(1);
      expect(() => useContext(ContextB)).toThrow();
    },
  });

  const root = document.createElement('root');

  render(
    () => (
      <CustomElement $element={Parent}>
        <CustomElement $element={Child} />
      </CustomElement>
    ),
    { target: root },
  );

  tick();
});
