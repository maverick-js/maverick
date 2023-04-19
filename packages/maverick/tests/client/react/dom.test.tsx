import { createContext, provideContext, useContext } from 'maverick.js';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';

import { Component, type ComponentConstructor, defineElement } from 'maverick.js/element';
import {
  createReactContextProvider,
  createReactElement,
  createReactScopeProvider,
  useReactContext,
  useReactScope,
} from 'maverick.js/react';
import { DOMEvent } from 'maverick.js/std';

let count = 0;

it('should render', () => {
  class TestComponent extends Component {
    static el = defineElement({ tagName: `mk-foo-${++count}` });
    override render() {
      return <div>Test</div>;
    }
  }

  const { root, container } = setup(TestComponent);

  expect(container).toMatchInlineSnapshot(`
    <div>
      <mk-foo-1
        mk-d="true"
      >
        <shadow-root>
          <div>
            Test
          </div>
        </shadow-root>
      </mk-foo-1>
    </div>
  `);

  act(() => {
    root.unmount();
  });

  expect(container).toMatchInlineSnapshot('<div />');
});

it('should render with children', () => {
  class TestComponent extends Component {
    static el = defineElement({ tagName: `mk-foo-${++count}` });
    override render() {
      return <div>Test</div>;
    }
  }

  const { container } = setup(TestComponent, (el) =>
    React.createElement(el, null, React.createElement('div', null, 'Content')),
  );

  expect(container).toMatchInlineSnapshot(`
    <div>
      <mk-foo-2
        mk-d="true"
      >
        <shadow-root>
          <div>
            Test
          </div>
        </shadow-root>
        <div>
          Content
        </div>
      </mk-foo-2>
    </div>
  `);
});

it('should render with shadow dom', () => {
  class TestComponent extends Component {
    static el = defineElement({
      tagName: `mk-foo-${++count}`,
      shadowRoot: true,
    });
    override render() {
      return <div>Test</div>;
    }
  }

  const { container } = setup(TestComponent);
  expect(container).toMatchInlineSnapshot(`
    <div>
      <mk-foo-3
        mk-d="true"
      />
    </div>
  `);

  const shadowRoot = (container.firstChild as HTMLElement).shadowRoot;
  expect(shadowRoot?.innerHTML).toMatchInlineSnapshot('"<div>Test</div>"');
});

it('should update', () => {
  function ReactComponent(props) {
    const [state, setState] = React.useState(0);
    return React.createElement(
      'button',
      {
        onClick: () => {
          setState((n) => n + 1);
        },
      },
      React.createElement(props.children, { state }),
    );
  }

  class TestComponent extends Component<{
    props: { state: number };
  }> {
    static el = defineElement({
      tagName: `mk-foo-${++count}`,
      props: { state: 0 },
    });
    override render() {
      const { state } = this.$props;
      return <div>{state()}</div>;
    }
  }

  const { container } = setup(TestComponent, (el) => React.createElement(ReactComponent, {}, el));

  expect(container).toMatchInlineSnapshot(`
    <div>
      <button>
        <mk-foo-4
          mk-d="true"
        >
          <shadow-root>
            <div>
              0
              <!--$-->
            </div>
          </shadow-root>
        </mk-foo-4>
      </button>
    </div>
  `);

  act(() => {
    container.querySelector('button')?.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
      }),
    );
  });

  expect(container).toMatchInlineSnapshot(`
    <div>
      <button>
        <mk-foo-4
          mk-d="true"
        >
          <shadow-root>
            <div>
              1
              <!--$-->
            </div>
          </shadow-root>
        </mk-foo-4>
      </button>
    </div>
  `);
});

it('should set attributes', () => {
  class TestComponent extends Component {
    static el = defineElement({
      tagName: `mk-foo-${++count}`,
      props: { foo: 0 },
    });
  }

  const { container } = setup(TestComponent, (el) =>
    React.createElement(el, { foo: 10, 'aria-label': 'Label' }),
  );

  expect(container).toMatchInlineSnapshot(`
    <div>
      <mk-foo-5
        aria-label="Label"
        mk-d="true"
      >
        <shadow-root />
      </mk-foo-5>
    </div>
  `);
});

it('should forward ref', () => {
  let el!: HTMLElement;

  const callback = (element) => {
    el = element;
  };

  class TestComponent extends Component {
    static el = defineElement({
      tagName: `mk-foo-${++count}`,
    });
  }

  const { definition } = setup(TestComponent, (el) => React.createElement(el, { ref: callback }));
  expect(el).toBeInstanceOf(HTMLElement);
  expect(el.localName).toBe(definition.tagName);
});

it('should forward context', () => {
  const Context = createContext(() => 0);

  let value = 0;
  function C() {
    value = useContext(Context);
    return <div>{value}</div>;
  }

  class ParentComponent extends Component {
    static el = defineElement({ tagName: `mk-foo-${++count}` });
  }

  class ChildComponent extends Component {
    static el = defineElement({ tagName: `mk-child-1` });
    constructor(instance) {
      super(instance);
      provideContext(Context, 10);
    }
    override render() {
      return <C />;
    }
  }

  const Child = createReactElement(ChildComponent);

  const { container } = setup(ParentComponent, (el) =>
    React.createElement(el, null, React.createElement('div', null, React.createElement(Child))),
  );

  expect(value).toBe(10);
  expect(container).toMatchInlineSnapshot(`
    <div>
      <mk-foo-7
        mk-d="true"
      >
        <shadow-root />
        <div>
          <mk-child-1
            mk-d="true"
          >
            <shadow-root>
              <div>
                10
                <!--$-->
              </div>
            </shadow-root>
          </mk-child-1>
        </div>
      </mk-foo-7>
    </div>
  `);
});

it('should update event callbacks', () => {
  function Parent(props) {
    const [state, setState] = React.useState(0);

    const handlerA = () => {
      setState((n) => n + 1);
    };

    const handlerB = () => {
      setState((n) => n + 2);
    };

    return React.createElement(
      'div',
      {},
      state,
      React.createElement(props.el, {
        onFooEvent: state === 0 ? handlerA : state === 1 ? handlerB : null,
        onResetEvent: () => {
          setState(0);
        },
      }),
    );
  }

  class TestComponent extends Component {
    static el = defineElement({ tagName: `mk-foo-${++count}` });
  }

  const { definition, container } = setup(TestComponent, (el) =>
    React.createElement(Parent, { el }),
  );

  const div = container.querySelector('div')!;
  const state = div.firstChild!;
  const element = container.querySelector(definition.tagName)!;

  // it should add listener.
  act(() => {
    element.dispatchEvent(new DOMEvent<void>('foo-event'));
  });

  expect(state.textContent).toBe('1');

  // it should update listener.
  act(() => {
    element.dispatchEvent(new DOMEvent<void>('reset-event'));
    element.dispatchEvent(new DOMEvent<void>('foo-event'));
  });

  expect(state.textContent).toBe('2');

  // it should remove listener.
  act(() => {
    element.dispatchEvent(new DOMEvent<void>('foo-event'));
    element.dispatchEvent(new DOMEvent<void>('foo-event'));
  });

  expect(state.textContent).toBe('2');

  act(() => {
    element.dispatchEvent(new DOMEvent<void>('reset-event'));
  });

  expect(state.textContent).toBe('0');
});

it('should provide scope', () => {
  const Provider = createReactScopeProvider();
  const container = document.body.appendChild(document.createElement('div'));
  const root = createRoot(container);
  act(() => {
    root.render(
      React.createElement(
        Provider,
        React.createElement(() => {
          const scope = useReactScope();
          expect(scope).toBeDefined();
          return null;
        }),
      ),
    );
  });
});

it('should create context provider', () => {
  const Context = createContext(() => 100);
  const Provider = createReactContextProvider(Context);
  const container = document.body.appendChild(document.createElement('div'));
  const root = createRoot(container);
  act(() => {
    root.render(
      React.createElement(
        Provider,
        null,
        React.createElement(() => {
          const value = useReactContext(Context);
          expect(value).toBe(100);
          return null;
        }),
      ),
    );
  });
});

beforeAll(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
});

afterEach(() => {
  document.body.innerHTML = '';
});

function setup(TestComponent: ComponentConstructor, children?: (element: any) => React.ReactNode) {
  const container = document.body.appendChild(document.createElement('div'));
  const root = createRoot(container);
  const element = createReactElement(TestComponent);

  act(() => {
    root.render(children?.(element) ?? React.createElement(element));
  });

  return {
    root,
    container,
    definition: TestComponent.el,
  };
}
