import {
  Component,
  type ComponentConstructor,
  createContext,
  effect,
  onAttach,
} from '@maverick-js/core';
import {
  createReactComponent,
  type CreateReactComponentOptions,
  createReactContextProvider,
  createReactScopeProvider,
  type ReactBridgeProps,
  useReactContext,
  useReactScope,
} from '@maverick-js/react';
import type { MaverickEvent } from '@maverick-js/std';
import { act } from 'react';
import * as React from 'react';
import { createRoot } from 'react-dom/client';

it('should render', () => {
  interface Props {
    id: string;
  }

  interface Meta {
    props: Props;
  }

  class TestComponent extends Component<Meta> {
    static props: Props = { id: '' };

    constructor() {
      super();

      onAttach((el) => {
        expect(el.localName).toBe('button');
        expect(el).toBeInstanceOf(HTMLButtonElement);
        effect(() => {
          el.id = this.$props.id();
        });
      });
    }
  }

  function children(props) {
    return React.createElement('button', { ...props, 'data-test': '' });
  }

  const { container, update, unmount } = setup(TestComponent, {
    id: '',
    children,
  });

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
    foo: MaverickEvent<number>;
  }

  interface Meta {
    events: Events;
  }

  class TestComponent extends Component<Meta> {
    constructor() {
      super();

      onAttach(() => {
        this.dispatch('foo', { detail: 1 });
      });
    }
  }

  function children(props) {
    return React.createElement('button', props);
  }

  const onFoo = vi.fn(),
    { unmount } = setup(TestComponent, { onFoo, children }, { events: ['onFoo'] });

  expect(onFoo).toHaveBeenCalledTimes(1);
  expect(onFoo).toHaveBeenCalledWith(1, expect.objectContaining({ type: 'foo' }));

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
        null,
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

function setup<T extends Component>(
  TestComponent: ComponentConstructor<T>,
  props: ReactBridgeProps<T>,
  options?: CreateReactComponentOptions<T>,
) {
  const container = document.createElement('root'),
    root = createRoot(container),
    node = createReactComponent(TestComponent, options);

  document.body.appendChild(container);

  act(() => {
    root.render(React.createElement(node, props));
  });

  const update = (props: ReactBridgeProps<T>) => {
      act(() => {
        root.render(React.createElement(node, props));
      });
    },
    unmount = () => {
      act(() => {
        root.unmount();
      });
    };

  return {
    root,
    container,
    update,
    unmount,
  };
}
