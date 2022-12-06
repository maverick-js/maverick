import { getScope, onDispose, onError, tick } from '@maverick-js/signals';
import { createContext, provideContext, useContext } from 'maverick.js';

import {
  AnyCustomElement,
  createElementInstance,
  CustomElementDeclaration,
  defineCustomElement,
  HTMLCustomElement,
  HTMLCustomElementConstructor,
  onAfterUpdate,
  onAttach,
  onBeforeUpdate,
  onConnect,
  onDestroy,
  onDisconnect,
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
  expect(element.foo).toBe(10);
});

it('should initialize from attribute', () => {
  const { instance, element } = setupTestElement({
    props: {
      foo: { initial: 1 },
    },
  });

  element.setAttribute('foo', '10');
  element.attachComponent(instance);
  expect(element.foo).toBe(10);
});

it('should reflect props', async () => {
  const { instance, element } = setupTestElement({
    props: {
      foo: { initial: 100, reflect: true },
    },
  });

  element.attachComponent(instance);

  expect(element.getAttribute('foo')).toBe('100');
  instance[PROPS].foo = 200;

  await tick();
  expect(element.getAttribute('foo')).toBe('200');
});

it('should call connect lifecycle hook', () => {
  const destroy = vi.fn();
  const attach = vi.fn().mockReturnValue(destroy);
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

  instance.destroy();
  expect(destroy).toHaveBeenCalledTimes(1);
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

  expect(instance.host.$connected).toBeTruthy();
  expect(connect).toHaveBeenCalledTimes(1);
  expect(disconnect).not.toHaveBeenCalled();

  element.remove();
  expect(instance.host.$connected).toBeFalsy();
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
      return () => null;
    },
  });

  expect(mount).not.toHaveBeenCalled();
  expect(destroy).not.toHaveBeenCalled();

  element.attachComponent(instance);
  expect(instance.host.$mounted).toBeTruthy();
  expect(mount).toHaveBeenCalledTimes(1);
  expect(destroy).not.toHaveBeenCalled();

  instance.destroy();
  expect(instance.host.$mounted).toBeFalsy();
  expect(mount).toHaveBeenCalledTimes(1);
  expect(destroy).toHaveBeenCalledTimes(1);
});

it('should handle errors thrown in lifecycle hooks', async () => {
  const attachError = Error(),
    connectError = Error(),
    mountError = Error(),
    beforeUpdateError = Error(),
    afterUpdateError = Error(),
    destroyError = Error();

  const nextAttach = vi.fn(),
    nextConnect = vi.fn(),
    nextMount = vi.fn(),
    nextBeforeUpdate = vi.fn(),
    nextAfterUpdate = vi.fn(),
    nextDestroy = vi.fn();

  const errorHandler = vi.fn();

  const { instance, element } = setupTestElement({
    setup() {
      onError(errorHandler);

      onAttach(() => {
        throw attachError;
      });
      onAttach(nextAttach);

      onConnect(() => {
        throw connectError;
      });
      onConnect(nextConnect);

      onMount(() => {
        throw mountError;
      });
      onMount(nextMount);

      onBeforeUpdate(() => {
        throw beforeUpdateError;
      });
      onBeforeUpdate(nextBeforeUpdate);

      onAfterUpdate(() => {
        throw afterUpdateError;
      });
      onAfterUpdate(nextAfterUpdate);

      onDestroy(() => {
        throw destroyError;
      });
      onDestroy(nextDestroy);

      return () => null;
    },
  });

  expect(errorHandler).not.toHaveBeenCalled();
  expect(nextAttach).not.toHaveBeenCalled();
  expect(nextConnect).not.toHaveBeenCalled();
  expect(nextMount).not.toHaveBeenCalled();
  expect(nextBeforeUpdate).not.toHaveBeenCalled();
  expect(nextAfterUpdate).not.toHaveBeenCalled();
  expect(nextDestroy).not.toHaveBeenCalled();

  element.attachComponent(instance);
  expect(errorHandler).toHaveBeenCalledTimes(3);
  expect(errorHandler).toHaveBeenCalledWith(attachError);
  expect(errorHandler).toHaveBeenCalledWith(connectError);
  expect(errorHandler).toHaveBeenCalledWith(mountError);
  expect(nextAttach).toHaveBeenCalledTimes(1);
  expect(nextConnect).toHaveBeenCalledTimes(1);
  expect(nextMount).toHaveBeenCalledTimes(1);

  await tick();
  expect(errorHandler).toHaveBeenCalledTimes(5);
  expect(errorHandler).toHaveBeenCalledWith(beforeUpdateError);
  expect(errorHandler).toHaveBeenCalledWith(afterUpdateError);
  expect(nextBeforeUpdate).toHaveBeenCalledTimes(1);
  expect(nextAfterUpdate).toHaveBeenCalledTimes(1);

  instance.destroy();
  expect(errorHandler).toHaveBeenCalledTimes(6);
  expect(errorHandler).toHaveBeenCalledWith(destroyError);
  expect(nextDestroy).toHaveBeenCalledTimes(1);
});

it('should call update hooks', async () => {
  const beforeUpdate = vi.fn();
  const afterUpdate = vi.fn();

  let beforeCalledAt = 0;
  let afterCalledAt = 0;

  const { instance, element } = setupTestElement({
    props: {
      foo: { initial: 10 },
    },
    setup() {
      onBeforeUpdate(() => {
        beforeUpdate();
        beforeCalledAt = performance.now();
      });
      onAfterUpdate(() => {
        afterUpdate();
        afterCalledAt = performance.now();
      });
      return () => null;
    },
  });

  expect(beforeUpdate).not.toHaveBeenCalled();
  expect(afterUpdate).not.toHaveBeenCalled();

  element.attachComponent(instance);
  expect(beforeUpdate).not.toHaveBeenCalled();
  expect(afterUpdate).not.toHaveBeenCalled();

  instance[PROPS].foo = 20;
  await tick();
  expect(beforeUpdate).toHaveBeenCalled();
  expect(afterUpdate).toHaveBeenCalled();

  expect(beforeCalledAt < afterCalledAt).toBeTruthy();
});

it('should call disconnect lifecycle hook', () => {
  const disconnect = vi.fn();
  const Context = createContext<number>();

  const { instance, element } = setupTestElement({
    setup() {
      provideContext(Context, 1);

      onDisconnect(() => {
        expect(useContext(Context)).toBe(1);
        disconnect();
      });

      return () => null;
    },
  });

  expect(disconnect).not.toHaveBeenCalled();

  element.attachComponent(instance);
  expect(disconnect).not.toHaveBeenCalled();

  element.remove();
  expect(disconnect).toHaveBeenCalledTimes(1);
});

it('should call destroy lifecycle hook', () => {
  const destroy = vi.fn();
  const Context = createContext<number>();

  const { instance, element } = setupTestElement({
    setup() {
      provideContext(Context, 1);
      onDestroy(() => {
        expect(useContext(Context)).toBe(1);
        destroy();
      });
      return () => null;
    },
  });

  expect(destroy).not.toHaveBeenCalled();

  element.attachComponent(instance);
  expect(destroy).not.toHaveBeenCalled();

  element.remove();
  expect(destroy).not.toHaveBeenCalled();

  instance.destroy();
  expect(destroy).toHaveBeenCalledTimes(1);
});

it('should throw if lifecycle hook called outside setup', () => {
  expect(() => {
    onMount(() => {});
  }).toThrowError(/called outside of element setup/);
});

it('should detect children during initial render', async () => {
  const { container, element } = setupTestElement(
    {
      setup({ host }) {
        return () => {
          expect(host.$children).toBeTruthy();
          return null;
        };
      },
    },
    { append: false, delegate: false },
  );

  const child = document.createElement('div');
  element.appendChild(child);
  container.append(element);
});

it('should _not_ detect children during initial render', () => {
  setupTestElement(
    {
      setup({ host }) {
        return () => {
          expect(host.$children).toBeFalsy();
          return null;
        };
      },
    },
    { delegate: false },
  );
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

it('should render css vars', () => {
  const Button = defineCustomElement({
    tagName: `mk-button-5`,
    // @ts-expect-error
    cssvars: {
      foo: 10,
      bar: 'none',
    },
  });

  registerCustomElement(Button);

  const instance = createElementInstance(Button);
  const element = document.createElement(Button.tagName) as HTMLCustomElement;
  element.attachComponent(instance);

  expect(element).toMatchInlineSnapshot(`
    <mk-button-5
      style="--foo: 10; --bar: none;"
    />
  `);
});

it('should render css vars builder', async () => {
  const Button = defineCustomElement({
    tagName: `mk-button-6`,
    props: { foo: { initial: 0 } },
    cssvars: (props) => ({
      foo: () => props.foo,
    }),
  } as any);

  registerCustomElement(Button);

  const instance = createElementInstance(Button);
  const element = document.createElement(Button.tagName) as HTMLCustomElement;
  element.attachComponent(instance);

  expect(element).toMatchInlineSnapshot(`
    <mk-button-6
      style="--foo: 0;"
    />
  `);

  instance[PROPS].foo = 100;
  await tick();

  expect(element).toMatchInlineSnapshot(`
    <mk-button-6
      style="--foo: 100;"
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
