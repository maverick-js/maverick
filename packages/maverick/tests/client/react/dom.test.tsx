import { createContext } from 'maverick.js';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';

import { type AnyElementDeclaration, defineElement } from 'maverick.js/element';
import { createReactElement } from 'maverick.js/react';
import { DOMEvent } from 'maverick.js/std';

it('should render', () => {
  const { root, container } = render({ setup: () => () => <div>Test</div> });
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
  const { container } = render({ setup: () => () => <div>Test</div> }, (el) =>
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
  const { container } = render({
    shadowRoot: true,
    setup: () => () => <div>Test</div>,
  });

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
  function Component(props) {
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

  const { container } = render(
    {
      props: { state: { initial: 0 } },
      setup:
        ({ props }) =>
        () =>
          <div>{props.state}</div>,
    },
    (el) => React.createElement(Component, {}, el),
  );

  expect(container).toMatchInlineSnapshot(`
    <div>
      <button>
        <mk-foo-4
          mk-d="true"
        >
          <shadow-root>
            <div>
              <!--$-->
              0
              <!--/$-->
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
              <!--$-->
              1
              <!--/$-->
            </div>
          </shadow-root>
        </mk-foo-4>
      </button>
    </div>
  `);
});

it('should set attributes', () => {
  const { container } = render({ props: { foo: { initial: 0 } } }, (el) =>
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

  const { definition } = render({}, (el) => React.createElement(el, { ref: callback }));
  expect(el).toBeInstanceOf(HTMLElement);
  expect(el.localName).toBe(definition.tagName);
});

it('should forward context', () => {
  const context = createContext(0);

  let value = 0;
  function Component() {
    value = context();
    return <div>{value}</div>;
  }

  const Child = createReactElement(
    defineElement({
      tagName: 'mk-child-1',
      setup: () => () => <Component />,
    }),
  );

  const { container } = render(
    {
      setup: () => {
        context.set(10);
        return () => null;
      },
    },
    (el) =>
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

  const { definition, container } = render({}, (el) => React.createElement(Parent, { el }));

  const div = container.querySelector('div')!;
  const state = div.firstChild!;
  const element = container.querySelector(definition.tagName)!;

  // it should add listener.
  act(() => {
    element.dispatchEvent(new DOMEvent('foo-event'));
  });

  expect(state.textContent).toBe('1');

  // it should update listener.
  act(() => {
    element.dispatchEvent(new DOMEvent('reset-event'));
    element.dispatchEvent(new DOMEvent('foo-event'));
  });

  expect(state.textContent).toBe('2');

  // it should remove listener.
  act(() => {
    element.dispatchEvent(new DOMEvent('foo-event'));
    element.dispatchEvent(new DOMEvent('foo-event'));
  });

  expect(state.textContent).toBe('2');

  act(() => {
    element.dispatchEvent(new DOMEvent('reset-event'));
  });

  expect(state.textContent).toBe('0');
});

beforeAll(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
});

afterEach(() => {
  document.body.innerHTML = '';
});

let count = 0;
function render(
  declaration: Partial<AnyElementDeclaration>,
  children?: (element: any) => React.ReactNode,
) {
  const definition = defineElement({
    tagName: `mk-foo-${++count}`,
    ...declaration,
  });

  const container = document.body.appendChild(document.createElement('div'));
  const root = createRoot(container);
  const element = createReactElement(definition);

  act(() => {
    root.render(children?.(element) ?? React.createElement(element));
  });

  return { root, definition, container };
}
