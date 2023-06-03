import { effect, onDispose } from '@maverick-js/signals';
import { createContext, type JSX, provideContext, signal, tick, useContext } from 'maverick.js';

import { render } from 'maverick.js/dom';
import {
  Component,
  defineElement,
  type HTMLCustomElement,
  registerCustomElement,
} from 'maverick.js/element';

import { waitAnimationFrame } from '../../../src/std/timing';

afterEach(() => {
  document.body.innerHTML = '';
});

it('should render empty custom element', () => {
  class TestComponent extends Component {
    static el = defineElement({ tagName: `mk-test-1` });
  }

  registerCustomElement(TestComponent);

  const root = document.createElement('root');
  render(() => <mk-test-1 />, { target: root });
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
    static el = defineElement({ tagName: `mk-test-2` });
    override render() {
      return <button>Test</button>;
    }
  }

  registerCustomElement(TestComponent);

  const root = document.createElement('root');
  render(
    () => (
      <mk-test-2>
        <div>Foo</div>
      </mk-test-2>
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
        <div>
          Foo
        </div>
      </mk-test-2>
    </root>
  `);
});

it('should render custom element with only children', () => {
  class TestComponent extends Component {
    static el = defineElement({ tagName: `mk-test-3` });
  }

  registerCustomElement(TestComponent);

  const root = document.createElement('root');
  render(
    () => (
      <mk-test-3>
        <div>Children</div>
      </mk-test-3>
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
    static el = defineElement({ tagName: `mk-test-4` });
    override render() {
      return <div>Foo</div>;
    }
  }

  registerCustomElement(TestComponent);

  const root = document.createElement('root');
  render(
    () => (
      <mk-test-4 $prop:innerHTML="<div>INNER HTML</div>">
        <div>Children</div>
      </mk-test-4>
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
    static el = defineElement({ tagName: `mk-test-5`, shadowRoot: true });
    override render() {
      return <button>Test</button>;
    }
  }

  registerCustomElement(TestComponent);

  const root = document.createElement('root');
  render(() => <mk-test-5 />, { target: root });

  const shadowRoot = (root.firstChild as HTMLElement).shadowRoot;
  expect(shadowRoot?.innerHTML).toMatchInlineSnapshot('"<button>Test</button>"');
});

it('should forward context to another custom element', () => {
  const Context = createContext(() => 0);
  const ContextB = createContext();

  function InnerChild() {
    provideContext(ContextB, 1);
    expect(useContext(Context)).toBe(1);
    expect(useContext(ContextB)).toBe(1);
    return null;
  }

  class ParentComponent extends Component {
    static el = defineElement({ tagName: `mk-test-6` });
    constructor(instance) {
      super(instance);
      provideContext(Context, 1);
    }
    override render() {
      return <InnerChild />;
    }
  }

  class ChildComponent extends Component {
    static el = defineElement({
      tagName: `mk-test-7`,
      props: { foo: 0 },
    });
    constructor(instance) {
      super(instance);
      expect(useContext(Context)).toBe(1);
      expect(() => useContext(ContextB)).toThrow();
    }
    protected override onAttach() {
      const { foo } = this.$props;
      this.setAttributes({ foo });
    }
  }

  registerCustomElement(ParentComponent);
  registerCustomElement(ChildComponent);

  const root = document.createElement('root');

  render(
    () => (
      <mk-test-6>
        <mk-test-7 foo="5" />
      </mk-test-6>
    ),
    { target: root },
  );

  expect(root).toMatchInlineSnapshot(`
    <root>
      <mk-test-6
        mk-d=""
      >
        <shadow-root />
        <!--$-->
        <mk-test-7
          foo="5"
          mk-d=""
        />
      </mk-test-6>
    </root>
  `);

  tick();
});

it('should forward props', () => {
  class TestComponent extends Component {
    static el = defineElement({
      tagName: `mk-test-8`,
      props: { foo: 0 },
    });
    override render() {
      return <div>{this.$props.foo()}</div>;
    }
  }

  registerCustomElement(TestComponent);

  const root = document.createElement('root');

  const foo = signal(0);
  render(() => <mk-test-8 $prop:foo={foo()} />, { target: root });

  expect(root).toMatchInlineSnapshot(`
    <root>
      <mk-test-8
        mk-d=""
      >
        <shadow-root>
          <div>
            0
            <!--$-->
          </div>
        </shadow-root>
      </mk-test-8>
    </root>
  `);

  foo.set(1);
  tick();

  expect(root).toMatchInlineSnapshot(`
    <root>
      <mk-test-8
        mk-d=""
      >
        <shadow-root>
          <div>
            1
            <!--$-->
          </div>
        </shadow-root>
      </mk-test-8>
    </root>
  `);
});

it('should throw error if element not registered', () => {
  class TestOneComponent extends Component {
    static el = defineElement({ tagName: `mk-test-9` });
    static register = () => [TestTwoComponent];
    override render() {
      return <mk-test-10 />;
    }
  }

  class TestTwoComponent extends Component {
    static el = defineElement({ tagName: `mk-test-10` });
    override render() {
      return <mk-test-11 />;
    }
  }

  registerCustomElement(TestOneComponent);
  registerCustomElement(TestTwoComponent);

  expect(() => {
    const root = document.createElement('root');
    render(() => <mk-test-9 />, { target: root });
  }).toThrowErrorMatchingInlineSnapshot('"[maverick] custom element not registered: mk-test-11"');
});

it('should dispose of children', async () => {
  const disposeCallback = vi.fn();

  class ParentComponent extends Component {
    static el = defineElement({ tagName: `mk-test-11` });
    protected override onDestroy(el) {
      disposeCallback(el);
    }
  }

  class ChildComponent extends Component {
    static el = defineElement({ tagName: `mk-test-12` });
    protected override onAttach(el: HTMLElement) {
      el.setAttribute('keep-alive', '');
      effect(() => {
        onDispose(disposeCallback);
      });
    }

    protected override onDestroy(el) {
      disposeCallback(el);
    }
  }

  registerCustomElement(ParentComponent);
  registerCustomElement(ChildComponent);

  const parent = document.createElement(ParentComponent.el.tagName),
    child = document.createElement(ChildComponent.el.tagName);

  parent.append(child);
  document.body.append(parent);
  await waitAnimationFrame();

  document.body.innerHTML = '';
  await waitAnimationFrame();

  expect((parent as any)._component).toBe(null);
  expect((child as any)._component).toBe(null);
  expect(disposeCallback).toHaveBeenCalledTimes(3);
});

interface TestElement extends HTMLCustomElement {}

declare global {
  interface MaverickElements {
    'mk-test-1': TestElement;
    'mk-test-2': TestElement;
    'mk-test-3': TestElement;
    'mk-test-4': TestElement;
    'mk-test-5': TestElement;
    'mk-test-6': TestElement;
    'mk-test-7': TestElement;
    'mk-test-8': TestElement;
    'mk-test-9': TestElement;
    'mk-test-10': TestElement;
    'mk-test-11': TestElement;
    'mk-test-12': TestElement;
    'mk-test-13': TestElement;
    'mk-test-14': TestElement;
  }
}
