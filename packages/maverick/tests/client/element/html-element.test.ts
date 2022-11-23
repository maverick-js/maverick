import { getScope, onDispose, onError, tick } from '@maverick-js/observables';
import { createContext } from 'maverick.js';

import {
  createElementInstance,
  defineCustomElement,
  defineElement,
  defineProp,
  type ElementDeclaration,
  type MaverickElement,
  type MaverickElementConstructor,
  onAfterUpdate,
  onAttach,
  onBeforeUpdate,
  onConnect,
  onDestroy,
  onDisconnect,
  onMount,
  PROPS,
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
      foo: defineProp(1),
      bar: defineProp(2),
      bazBax: defineProp(3),
      bazBaxHux: defineProp(4),
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
      foo: defineProp(1),
    },
  });

  element.setAttribute('foo', '10');
  element.attachComponent(instance);
  expect(element.foo).toBe(10);
});

it('should reflect props', async () => {
  const { instance, element } = setupTestElement({
    props: {
      foo: defineProp(100, { reflect: true }),
    },
  });

  element.attachComponent(instance);

  expect(element.getAttribute('foo')).toBe('100');
  instance[PROPS].foo.set(200);

  await tick();
  expect(element.getAttribute('foo')).toBe('200');
});

it('should call connect lifecycle hook', () => {
  const destroy = vi.fn();
  const attach = vi.fn().mockReturnValue(destroy);
  const context = createContext(0);

  const { instance, element } = setupTestElement({
    setup({ host }) {
      context.set(1);
      onAttach((__host) => {
        expect(__host).toBeDefined();
        expect(host.el).toBeDefined();
        expect(__host).toEqual(host.el);
        expect(context()).toBe(1);
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
  expect(connect).toHaveBeenCalledWith(element);
  expect(disconnect).not.toHaveBeenCalled();

  element.remove();
  expect(instance.host.$connected).toBeFalsy();
  expect(connect).toHaveBeenCalledTimes(1);
  expect(disconnect).toHaveBeenCalledTimes(1);
  expect(disconnect).toHaveBeenCalledWith(element);
});

it('should scope connect/disconnect lifecycle hooks', () => {
  const connect = vi.fn();
  const disconnect = vi.fn();
  const dispose = vi.fn();
  const context = createContext(0);

  const { instance, element } = setupTestElement({
    setup() {
      context.set(1);

      onConnect((host) => {
        const connectScope = getScope();
        expect(connectScope).toBeDefined();
        expect(context()).toBe(1);

        connect(host);
        onDispose(dispose);

        return () => {
          const disconnectScope = getScope();
          expect(disconnectScope).toBeDefined();
          expect(disconnectScope).toBe(connectScope);
          expect(context()).toBe(1);
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
  expect(mount).toHaveBeenCalledWith(element);
  expect(destroy).not.toHaveBeenCalled();

  instance.destroy();
  expect(instance.host.$mounted).toBeFalsy();
  expect(mount).toHaveBeenCalledTimes(1);
  expect(destroy).toHaveBeenCalledTimes(1);
  expect(destroy).toHaveBeenCalledWith(element);
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
      foo: defineProp(10),
    },
    setup() {
      onBeforeUpdate((host) => {
        beforeUpdate(host);
        beforeCalledAt = performance.now();
      });
      onAfterUpdate((host) => {
        afterUpdate(host);
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

  instance[PROPS].foo.set(20);
  await tick();
  expect(beforeUpdate).toHaveBeenCalled();
  expect(afterUpdate).toHaveBeenCalled();
  expect(beforeUpdate).toHaveBeenCalledWith(element);
  expect(afterUpdate).toHaveBeenCalledWith(element);

  expect(beforeCalledAt < afterCalledAt).toBeTruthy();
});

it('should call disconnect lifecycle hook', () => {
  const disconnect = vi.fn();
  const context = createContext(0);

  const { instance, element } = setupTestElement({
    setup() {
      context.set(1);

      onDisconnect((host) => {
        expect(context()).toBe(1);
        disconnect(host);
      });

      return () => null;
    },
  });

  expect(disconnect).not.toHaveBeenCalled();

  element.attachComponent(instance);
  expect(disconnect).not.toHaveBeenCalled();

  element.remove();
  expect(disconnect).toHaveBeenCalledTimes(1);
  expect(disconnect).toHaveBeenCalledWith(element);
});

it('should call destroy lifecycle hook', () => {
  const destroy = vi.fn();
  const context = createContext(0);

  const { instance, element } = setupTestElement({
    setup() {
      context.set(1);
      onDestroy((host) => {
        expect(context()).toBe(1);
        destroy(host);
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
  expect(destroy).toHaveBeenCalledWith(element);
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
  const Button = defineElement({
    tagName: `mk-button-5`,
    cssvars: {
      foo: 10,
      bar: 'none',
    },
  });

  defineCustomElement(Button);

  const instance = createElementInstance(Button);
  const element = document.createElement(Button.tagName) as MaverickElement;
  element.attachComponent(instance);

  expect(element).toMatchInlineSnapshot(`
    <mk-button-5
      style="--foo: 10; --bar: none;"
    />
  `);
});

it('should render css vars builder', async () => {
  const Button = defineElement({
    tagName: `mk-button-6`,
    props: { foo: { initial: 0 } },
    cssvars: (props) => ({
      foo: () => props.foo,
    }),
  });

  defineCustomElement(Button);

  const instance = createElementInstance(Button);
  const element = document.createElement(Button.tagName) as MaverickElement;
  element.attachComponent(instance);

  expect(element).toMatchInlineSnapshot(`
    <mk-button-6
      style="--foo: 0;"
    />
  `);

  instance[PROPS].foo.set(100);
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
  declaration?: Partial<ElementDeclaration>,
  { hydrate = false, delegate = true, append = true } = {},
) {
  const definition = defineElement({
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
  });

  defineCustomElement(definition);

  const container = document.createElement('div'),
    instance = createElementInstance(definition),
    element = document.createElement(`mk-test-${count}`) as MaverickElement & Record<string, any>;

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
    elementCtor: element.constructor as MaverickElementConstructor,
  };
}
