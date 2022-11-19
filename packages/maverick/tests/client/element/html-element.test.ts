import { tick } from '@maverick-js/observables';
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
  const attach = vi.fn();

  const { instance, element } = setupTestElement({
    setup({ host }) {
      onAttach((__host) => {
        attach();
        expect(__host).toBeDefined();
        expect(host.el).toBeDefined();
        expect(__host).toEqual(host.el);
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

  const { instance, element } = setupTestElement({
    setup() {
      onDisconnect(disconnect);
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

  const { instance, element } = setupTestElement({
    setup() {
      onDestroy(destroy);
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
  >
    <shadow-root />
  </mk-button-5>
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
  >
    <shadow-root />
  </mk-button-6>
`);

  instance[PROPS].foo.set(100);
  await tick();

  expect(element).toMatchInlineSnapshot(`
  <mk-button-6
    style="--foo: 100;"
  >
    <shadow-root />
  </mk-button-6>
`);
});

it('should wait for parent to mount', async () => {
  const context = createContext(0);

  const Parent = defineElement({
    tagName: `mk-parent-1`,
    setup() {
      context.set(1);
      return () => null;
    },
  });

  const Child = defineElement({
    tagName: `mk-child-1`,
    parent: Parent,
    setup() {
      expect(context.get()).toBe(1);
      return () => null;
    },
  });

  const parent = document.createElement(Parent.tagName) as MaverickElement;
  parent.setAttribute('mk-d', '');

  const child = document.createElement(Child.tagName) as MaverickElement;
  parent.append(child);

  document.body.append(parent);

  expect(document.body).toMatchInlineSnapshot(`
  <body>
    <mk-parent-1
      mk-d=""
    >
      <mk-child-1 />
    </mk-parent-1>
  </body>
`);

  defineCustomElement(Child);
  expect(child.instance?.host.$mounted).toBeFalsy();

  await new Promise((res) => window.requestAnimationFrame(res));
  expect(child.instance?.host.$mounted).toBeFalsy();

  parent.attachComponent(createElementInstance(Parent));
  expect(parent.instance?.host.$mounted).toBeTruthy();
  expect(child.instance?.host.$mounted).toBeTruthy();

  parent.removeAttribute('mk-d');
  parent.remove();
  await new Promise((res) => window.requestAnimationFrame(res));

  expect(parent.instance).toBeNull();
  expect(child.instance).toBeNull();
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
