import { tick } from '@maverick-js/observables';
import { createContext } from 'maverick.js';
import {
  defineProp,
  MaverickElement,
  defineElement,
  defineCustomElement,
  onConnect,
  onMount,
  onBeforeUpdate,
  onAfterUpdate,
  onDisconnect,
  onDestroy,
  type ElementDeclaration,
  type MaverickElementConstructor,
} from 'maverick.js/element';

it('should handle basic setup and destroy', () => {
  const { container, element } = setupTestElement();
  element.$setup();
  expect(container).toMatchInlineSnapshot(`
    <div>
      <mk-test-1
        data-delegate=""
      >
        <shadow-root>
          Test
        </shadow-root>
      </mk-test-1>
    </div>
  `);
  element.$destroy();
  expect(container).toMatchInlineSnapshot('<div />');
});

it('should observe attributes', () => {
  const { element, elementCtor } = setupTestElement({
    props: {
      foo: defineProp(1),
      bar: defineProp(2),
      bazBax: defineProp(3),
      bazBaxHux: defineProp(4),
    },
  });

  expect(elementCtor.observedAttributes).toEqual(['foo', 'bar', 'baz-bax', 'baz-bax-hux']);

  element.$setup();
  element.setAttribute('foo', '10');
  expect(element.foo).toBe(10);
});

it('should initialize from attribute', () => {
  const { element } = setupTestElement({
    props: {
      foo: defineProp(1),
    },
  });

  element.setAttribute('foo', '10');
  element.$setup();
  expect(element.foo).toBe(10);
});

it('should reflect props', async () => {
  const { element } = setupTestElement({
    props: {
      foo: defineProp(100, { reflect: true }),
    },
  });

  element.$setup();

  expect(element.getAttribute('foo')).toBe('100');
  element.$$props.foo.set(200);

  await tick();
  expect(element.getAttribute('foo')).toBe('200');
});

it('should call connect lifecycle hook', () => {
  const disconnect = vi.fn();
  const connect = vi.fn().mockReturnValue(disconnect);

  const { element } = setupTestElement({
    setup() {
      onConnect(connect);
      return () => null;
    },
  });

  expect(connect).not.toHaveBeenCalled();
  expect(disconnect).not.toHaveBeenCalled();

  element.$setup();
  expect(element.$connected).toBeTruthy();
  expect(connect).toHaveBeenCalledTimes(1);
  expect(disconnect).not.toHaveBeenCalled();

  element.remove();
  expect(element.$connected).toBeFalsy();
  expect(connect).toHaveBeenCalledTimes(1);
  expect(disconnect).toHaveBeenCalledTimes(1);
});

it('should call mount lifecycle hook', () => {
  const destroy = vi.fn();
  const mount = vi.fn().mockReturnValue(destroy);

  const { element } = setupTestElement({
    setup() {
      onMount(mount);
      return () => null;
    },
  });

  expect(mount).not.toHaveBeenCalled();
  expect(destroy).not.toHaveBeenCalled();

  element.$setup();
  expect(element.$mounted).toBeTruthy();
  expect(mount).toHaveBeenCalledTimes(1);
  expect(destroy).not.toHaveBeenCalled();

  element.$destroy();
  expect(element.$mounted).toBeFalsy();
  expect(mount).toHaveBeenCalledTimes(1);
  expect(destroy).toHaveBeenCalledTimes(1);
});

it('should call update hooks', async () => {
  const beforeUpdate = vi.fn();
  const afterUpdate = vi.fn();

  let beforeCalledAt = 0;
  let afterCalledAt = 0;

  const { element } = setupTestElement({
    props: {
      foo: defineProp(10),
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

  element.$setup();
  expect(beforeUpdate).not.toHaveBeenCalled();
  expect(afterUpdate).not.toHaveBeenCalled();

  element.$$props.foo.set(20);
  await tick();
  expect(beforeUpdate).toHaveBeenCalled();
  expect(afterUpdate).toHaveBeenCalled();

  expect(beforeCalledAt < afterCalledAt).toBeTruthy();
});

it('should call disconnect lifecycle hook', () => {
  const disconnect = vi.fn();

  const { element } = setupTestElement({
    setup() {
      onDisconnect(disconnect);
      return () => null;
    },
  });

  expect(disconnect).not.toHaveBeenCalled();

  element.$setup();
  expect(disconnect).not.toHaveBeenCalled();

  element.remove();
  expect(disconnect).toHaveBeenCalledTimes(1);
});

it('should call destroy lifecycle hook', () => {
  const destroy = vi.fn();

  const { element } = setupTestElement({
    setup() {
      onDestroy(destroy);
      return () => null;
    },
  });

  expect(destroy).not.toHaveBeenCalled();

  element.$setup();
  expect(destroy).not.toHaveBeenCalled();

  element.remove();
  expect(destroy).not.toHaveBeenCalled();

  element.$destroy();
  expect(destroy).toHaveBeenCalledTimes(1);
});

it('should throw if lifecycle hook called outside setup', () => {
  expect(() => {
    onMount(() => {});
  }).toThrowError(/called outside of element setup/);
});

it('should detect children during initial setup', async () => {
  const { element } = setupTestElement();

  const child = document.createElement('div');
  element.appendChild(child);

  element.$setup();
  expect(element.$children).toBe(true);

  child.remove();
  await tick();
  expect(element.$children).toBe(false);
});

it('should _not_ detect children during initial setup', async () => {
  const { element } = setupTestElement();

  element.$setup();
  expect(element.$children).toBe(false);

  const child = document.createElement('div');
  element.appendChild(child);

  await tick();
  expect(element.$children).toBe(true);

  child.remove();
  await tick();
  expect(element.$children).toBe(false);
});

it('should discover events on dispatch', () => {
  const { element } = setupTestElement();

  const callback = vi.fn();
  element.$setup({ onEventDispatch: callback });

  element.dispatchEvent(new MouseEvent('mk-click'));

  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledWith('mk-click');
});

it('should forward context map', () => {
  const foo = createContext(10);
  const bar = createContext(10);

  const { element } = setupTestElement({
    setup() {
      expect(foo.get()).toBe(20);
      expect(bar.get()).toBe(10);
      return () => null;
    },
  });

  const context = new Map();
  context.set(foo.id, 20);
  element.$setup({ context });
});

let count = 0,
  element: MaverickElement;

beforeEach(() => {
  element?.$destroy();
});

function setupTestElement(
  declaration?: Partial<ElementDeclaration>,
  { hydrate = false, delegate = true } = {},
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

  const container = document.createElement('div');
  element = document.createElement(`mk-test-${count}`) as MaverickElement;

  if (hydrate) {
    element.setAttribute('data-hydrate', '');
  }

  if (delegate) {
    element.setAttribute('data-delegate', '');
  }

  container.append(element);
  document.body.append(container);

  return {
    definition,
    container,
    element,
    elementCtor: element.constructor as MaverickElementConstructor,
  };
}
