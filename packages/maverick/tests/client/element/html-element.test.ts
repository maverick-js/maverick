import { getScope, onDispose, onError, tick } from '@maverick-js/signals';
import { createContext, provideContext, useContext } from 'maverick.js';

import {
  AnyCustomElement,
  createElementInstance,
  CustomElementDeclaration,
  defineCustomElement,
  HTMLCustomElement,
  HTMLCustomElementConstructor,
  onAttach,
  onConnect,
  onMount,
  PROPS,
  registerCustomElement,
} from 'maverick.js/element';

it('should handle basic setup and destroy', () => {
  const { container, instance, element } = setupTestElement();
  element.attachComponent(instance);
  expect(container).toMatchInlineSnapshot(`
    <div>
      <mk-test-1
        mk-d=""
      >
        <shadow-root>
          Test
        </shadow-root>
      </mk-test-1>
    </div>
  `);
  instance.destroy();
});

it('should observe attributes', () => {
  const { instance, element, elementCtor } = setupTestElement({
    props: {
      foo: { initial: 1 },
      bar: { initial: 2 },
      bazBax: { initial: 3 },
      bazBaxHux: { initial: 4 },
    },
  });

  expect(elementCtor.observedAttributes).toEqual(['foo', 'bar', 'baz-bax', 'baz-bax-hux']);

  element.attachComponent(instance);
  element.setAttribute('foo', '10');
  expect(element.$foo()).toBe(10);
});

it('should reflect props', () => {
  const { instance, element } = setupTestElement({
    props: {
      foo: { initial: 100, reflect: true },
    },
  });

  element.attachComponent(instance);

  expect(element.getAttribute('foo')).toBe('100');
  instance[PROPS].$foo.set(200);

  tick();
  expect(element.getAttribute('foo')).toBe('200');

  instance[PROPS].$foo.set(null);
  tick();
  expect(element.hasAttribute('foo')).toBe(false);
});

it('should call connect lifecycle hook', () => {
  const attach = vi.fn();
  const Context = createContext<number>();

  const { instance, element } = setupTestElement({
    setup({ host }) {
      provideContext(Context, 1);
      onAttach(() => {
        expect(host.el).toBeDefined();
        expect(useContext(Context)).toBe(1);
        return attach();
      });
      return () => null;
    },
  });

  element.attachComponent(instance);
  expect(attach).toBeCalledTimes(1);
});

it('should call connect lifecycle hook', () => {
  const disconnect = vi.fn();
  const connect = vi.fn().mockReturnValue(disconnect);

  const { instance, element } = setupTestElement({
    setup() {
      onConnect(connect);
      return () => null;
    },
  });

  expect(connect).not.toHaveBeenCalled();
  expect(disconnect).not.toHaveBeenCalled();

  element.attachComponent(instance);

  expect(instance.host.$connected()).toBeTruthy();
  expect(connect).toHaveBeenCalledTimes(1);
  expect(disconnect).not.toHaveBeenCalled();

  element.remove();
  expect(instance.host.$connected()).toBeFalsy();
  expect(connect).toHaveBeenCalledTimes(1);
  expect(disconnect).toHaveBeenCalledTimes(1);
});

it('should scope connect/disconnect lifecycle hooks', () => {
  const connect = vi.fn();
  const disconnect = vi.fn();
  const dispose = vi.fn();
  const Context = createContext<number>();

  const { instance, element } = setupTestElement({
    setup() {
      provideContext(Context, 1);

      onConnect(() => {
        const connectScope = getScope();
        expect(connectScope).toBeDefined();
        expect(useContext(Context)).toBe(1);

        connect();
        onDispose(dispose);

        return () => {
          const disconnectScope = getScope();
          expect(disconnectScope).toBeDefined();
          expect(disconnectScope).toBe(connectScope);
          expect(useContext(Context)).toBe(1);
          disconnect();
        };
      });

      return () => null;
    },
  });

  element.attachComponent(instance);
  element.remove();

  expect(connect).toHaveBeenCalledTimes(1);
  expect(dispose).toHaveBeenCalledTimes(1);
  expect(disconnect).toHaveBeenCalledTimes(1);
});

it('should call mount lifecycle hook', () => {
  const destroy = vi.fn();
  const mount = vi.fn().mockReturnValue(destroy);

  const { instance, element } = setupTestElement({
    setup() {
      onMount(mount);
    },
  });

  expect(mount).not.toHaveBeenCalled();
  expect(destroy).not.toHaveBeenCalled();

  element.attachComponent(instance);
  expect(instance.host.$mounted()).toBeTruthy();
  expect(mount).toHaveBeenCalledTimes(1);
  expect(destroy).not.toHaveBeenCalled();

  instance.destroy();
  expect(instance.host.$mounted()).toBeFalsy();
  expect(mount).toHaveBeenCalledTimes(1);
  expect(destroy).toHaveBeenCalledTimes(1);
});

it('should handle errors thrown in lifecycle hooks', () => {
  const attachError = Error('attach'),
    connectError = Error('connect'),
    disconnectError = Error('disconnect'),
    mountError = Error('mount'),
    destroyError = Error('destroy');

  const nextAttach = vi.fn(),
    nextConnect = vi.fn(),
    nextDisconnect = vi.fn(),
    nextMount = vi.fn(),
    nextDestroy = vi.fn();

  const errorHandler = vi.fn();

  const { instance, element } = setupTestElement({
    setup() {
      onError((e) => {
        errorHandler(e);
      });

      onAttach(() => {
        throw attachError;
      });

      onAttach(nextAttach);

      onConnect(() => {
        throw connectError;
      });

      onConnect(() => {
        nextConnect();
        return () => {
          throw disconnectError;
        };
      });

      onConnect(() => () => nextDisconnect());

      onMount(() => {
        throw mountError;
      });

      onMount(() => {
        nextMount();
        return () => {
          throw destroyError;
        };
      });

      onMount(() => () => nextDestroy());
    },
  });

  expect(errorHandler).not.toHaveBeenCalled();
  expect(nextAttach).not.toHaveBeenCalled();
  expect(nextConnect).not.toHaveBeenCalled();
  expect(nextDisconnect).not.toHaveBeenCalled();
  expect(nextMount).not.toHaveBeenCalled();
  expect(nextDestroy).not.toHaveBeenCalled();

  element.attachComponent(instance);
  expect(errorHandler).toHaveBeenCalledTimes(3);
  expect(errorHandler).toHaveBeenCalledWith(attachError);
  expect(errorHandler).toHaveBeenCalledWith(connectError);
  expect(errorHandler).toHaveBeenCalledWith(mountError);
  expect(nextAttach).toHaveBeenCalledTimes(1);
  expect(nextConnect).toHaveBeenCalledTimes(1);
  expect(nextMount).toHaveBeenCalledTimes(1);

  element.remove();
  expect(errorHandler).toHaveBeenCalledTimes(4);
  expect(nextDisconnect).toHaveBeenCalledTimes(1);

  instance.destroy();
  expect(errorHandler).toHaveBeenCalledTimes(5);
  expect(errorHandler).toHaveBeenCalledWith(destroyError);
  expect(nextDestroy).toHaveBeenCalledTimes(1);
});

it('should throw if lifecycle hook called outside setup', () => {
  expect(() => {
    onMount(() => {});
  }).toThrowError(/called outside of element setup/);
});

it('should discover events on dispatch', () => {
  const { instance, element } = setupTestElement();

  const callback = vi.fn();

  element.attachComponent(instance);
  element.onEventDispatch(callback);
  element.dispatchEvent(new MouseEvent('mk-click'));

  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledWith('mk-click');
});

it('should render `setAttributes`', () => {
  const Foo = defineCustomElement({
    tagName: `mk-foo-1`,
    setup({ host }) {
      host.setAttributes({
        foo: () => 10,
        bar: 'none',
        baz: null,
        bux: false,
      });
    },
  });

  registerCustomElement(Foo);

  const instance = createElementInstance(Foo);
  const element = document.createElement(Foo.tagName) as HTMLCustomElement;
  element.attachComponent(instance);

  expect(element).toMatchInlineSnapshot(`
    <mk-foo-1
      bar="none"
      foo="10"
    />
  `);
});

it('should render `setStyles`', () => {
  const Foo = defineCustomElement({
    tagName: `mk-foo-2`,
    setup({ host }) {
      host.setStyles({
        flex: '1',
        'flex-basis': null,
        'align-self': false,
        'z-index': () => 10,
      });
    },
  });

  registerCustomElement(Foo);

  const instance = createElementInstance(Foo);
  const element = document.createElement(Foo.tagName) as HTMLCustomElement;
  element.attachComponent(instance);

  expect(element).toMatchInlineSnapshot(`
    <mk-foo-2
      style="flex: 1; z-index: 10;"
    />
  `);
});

it('should render `setCSSVars`', () => {
  interface FooCSSVars {
    foo: number;
    bar: string;
    baz?: number | null;
    bux?: boolean;
  }

  interface FooElement extends HTMLCustomElement<{}, {}, FooCSSVars> {}

  const Foo = defineCustomElement<FooElement>({
    tagName: `mk-foo-3`,
    setup({ host }) {
      host.setCSSVars({
        '--foo': () => 10,
        '--bar': 'none',
        '--baz': null,
      });
    },
  });

  registerCustomElement(Foo);

  const instance = createElementInstance(Foo);
  const element = document.createElement(Foo.tagName) as HTMLCustomElement;
  element.attachComponent(instance);

  expect(element).toMatchInlineSnapshot(`
    <mk-foo-3
      style="--foo: 10; --bar: none;"
    />
  `);
});

afterEach(() => {
  document.body.innerHTML = '';
});

let count = 0;

function setupTestElement(
  declaration?: Partial<CustomElementDeclaration<AnyCustomElement>>,
  { hydrate = false, delegate = true, append = true } = {},
) {
  const definition = defineCustomElement({
    tagName: `mk-test-${++count}`,
    setup: ({ props }) => {
      const members = { $render: () => 'Test' };

      for (const prop of Object.keys(props)) {
        Object.defineProperty(members, prop, {
          enumerable: true,
          get() {
            return props[prop];
          },
        });
      }

      return members;
    },
    ...declaration,
  } as any);

  registerCustomElement(definition);

  const container = document.createElement('div'),
    instance = createElementInstance(definition),
    element = document.createElement(`mk-test-${count}`) as HTMLCustomElement & Record<string, any>;

  if (hydrate) {
    element.setAttribute('mk-h', '');
  }

  if (delegate) {
    element.setAttribute('mk-d', '');
  }

  if (append) {
    container.append(element);
    document.body.append(container);
  }

  return {
    definition,
    instance,
    container,
    element,
    elementCtor: element.constructor as HTMLCustomElementConstructor,
  };
}
