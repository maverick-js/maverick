import { createContext, CustomElement, provideContext, tick, useContext } from 'maverick.js';

import { render } from 'maverick.js/dom';
import { Component, defineElement } from 'maverick.js/element';

afterEach(() => {
  document.body.innerHTML = '';
});

let count = 0;

it('should render empty custom element', () => {
  class TestComponent extends Component {
    static el = defineElement({ tagName: `mk-test-${++count}` });
  }
  const root = document.createElement('root');
  render(() => <CustomElement $this={TestComponent} />, { target: root });
  expect(root).toMatchInlineSnapshot(`
    <root>
      <mk-test-1
        mk-d=""
      />
    </root>
  `);
});

it('should render custom element with only internal content', () => {
  class TestComponent extends Component {
    static el = defineElement({ tagName: `mk-test-${++count}` });
    override render() {
      return <button>Test</button>;
    }
  }

  const root = document.createElement('root');
  render(
    () => (
      <CustomElement $this={TestComponent}>
        <div>Foo</div>
      </CustomElement>
    ),
    { target: root },
  );

  expect(root).toMatchInlineSnapshot(`
    <root>
      <mk-test-2
        mk-d=""
      >
        <shadow-root>
          <button>
            Test
          </button>
        </shadow-root>
      </mk-test-2>
    </root>
  `);
});

it('should render custom element with only children', () => {
  class TestComponent extends Component {
    static el = defineElement({ tagName: `mk-test-${++count}` });
  }

  const root = document.createElement('root');
  render(
    () => (
      <CustomElement $this={TestComponent}>
        <div>Children</div>
      </CustomElement>
    ),
    { target: root },
  );

  expect(root).toMatchInlineSnapshot(`
    <root>
      <mk-test-3
        mk-d=""
      >
        <div>
          Children
        </div>
      </mk-test-3>
    </root>
  `);
});

it('should render custom element with inner html', () => {
  class TestComponent extends Component {
    static el = defineElement({ tagName: `mk-test-${++count}` });
    override render() {
      return <div>Foo</div>;
    }
  }

  const root = document.createElement('root');
  render(
    () => (
      <CustomElement $this={TestComponent} $prop:innerHTML="<div>INNER HTML</div>">
        <div>Children</div>
      </CustomElement>
    ),
    { target: root },
  );

  expect(root).toMatchInlineSnapshot(`
    <root>
      <mk-test-4
        mk-d=""
      >
        <div>
          INNER HTML
        </div>
      </mk-test-4>
    </root>
  `);
});

it('should render custom element with shadow dom', () => {
  class TestComponent extends Component {
    static el = defineElement({ tagName: `mk-test-${++count}`, shadowRoot: true });
    override render() {
      return <button>Test</button>;
    }
  }

  const root = document.createElement('root');
  render(() => <CustomElement $this={TestComponent} />, { target: root });

  const shadowRoot = (root.firstChild as HTMLElement).shadowRoot;
  expect(shadowRoot?.innerHTML).toMatchInlineSnapshot('"<button>Test</button>"');
});

it('should forward context to another custom element', () => {
  const Context = createContext(() => 0);
  const ContextB = createContext(() => 0);

  function InnerChild() {
    provideContext(ContextB, 1);
    expect(useContext(Context)).toBe(1);
    expect(useContext(ContextB)).toBe(1);
    return null;
  }

  class ParentComponent extends Component {
    static el = defineElement({ tagName: `mk-test-${++count}` });
    constructor(instance) {
      super(instance);
      provideContext(Context, 1);
    }
    override render() {
      return <InnerChild />;
    }
  }

  class ChildComponent extends Component {
    static el = defineElement({ tagName: `mk-test-${++count}` });
    constructor(instance) {
      super(instance);
      expect(useContext(Context)).toBe(1);
      expect(() => useContext(ContextB)).toThrow();
    }
  }

  const root = document.createElement('root');

  render(
    () => (
      <CustomElement $this={ParentComponent}>
        <CustomElement $this={ChildComponent} />
      </CustomElement>
    ),
    { target: root },
  );

  tick();
});
