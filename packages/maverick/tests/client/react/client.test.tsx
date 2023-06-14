import { Component, type ComponentConstructor, createContext } from 'maverick.js';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';

import {
  createReactComponent,
  createReactContextProvider,
  createReactScopeProvider,
  type ReactProps,
  useReactContext,
  useReactScope,
} from 'maverick.js/react';

it('should render', () => {
  interface Props {
    id: string;
  }

  class TestComponent extends Component<Props> {
    static props: Props = { id: '' };
    protected override onAttach(el: HTMLElement) {
      expect(el.localName).toBe('button');
      expect(el).toBeInstanceOf(HTMLButtonElement);
      this.setAttributes({
        id: this.$props.id,
      });
    }
  }

  function children(props) {
    return React.createElement('button', { ...props, 'data-test': '' });
  }

  const { container, update, unmount } = setup(TestComponent, { children });

  expect(container).toMatchInlineSnapshot(`
    <root>
      <button
        data-test=""
        id=""
      />
    </root>
  `);

  update({ id: 'foo', children });
  expect(container).toMatchInlineSnapshot(`
    <root>
      <button
        data-test=""
        id="foo"
      />
    </root>
  `);

  unmount();
  expect(container).toMatchInlineSnapshot('<root />');
});

it('should invoke event callback', () => {
  interface Events {
    foo: MouseEvent;
  }
  const event = new MouseEvent('foo', { detail: 1 });

  class TestComponent extends Component<{}, {}, Events> {
    protected override onAttach() {
      this.dispatch(event);
    }
  }

  function children(props) {
    return React.createElement('button', props);
  }

  const onFoo = vi.fn(),
    { unmount } = setup(TestComponent, { onFoo, children });

  expect(onFoo).toHaveBeenCalledTimes(1);
  expect(onFoo).toHaveBeenCalledWith(1, event);

  unmount();
});

it('should provide scope', () => {
  const Provider = createReactScopeProvider(),
    container = document.body.appendChild(document.createElement('root')),
    root = createRoot(container);

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

  act(() => {
    root.unmount();
  });
});

it('should create context provider', () => {
  const Context = createContext(() => 100),
    Provider = createReactContextProvider(Context),
    container = document.body.appendChild(document.createElement('root')),
    root = createRoot(container);

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

  act(() => {
    root.unmount();
  });
});

beforeAll(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
});

afterEach(() => {
  document.body.innerHTML = '';
});

function setup<T extends Component>(TestComponent: ComponentConstructor<T>, props: ReactProps<T>) {
  const container = document.createElement('root'),
    root = createRoot(container),
    node = createReactComponent(TestComponent);

  document.body.appendChild(container);

  act(() => {
    root.render(React.createElement(node, props));
  });

  return {
    root,
    container,
    update(props: ReactProps<T>) {
      act(() => {
        root.render(React.createElement(node, props));
      });
    },
    unmount() {
      act(() => {
        root.unmount();
      });
    },
  };
}
