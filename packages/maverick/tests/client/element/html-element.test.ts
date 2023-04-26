import { getScope, onDispose, onError } from '@maverick-js/signals';
import { createContext, provideContext, useContext } from 'maverick.js';

import {
  Component,
  createComponent,
  defineElement,
  defineProp,
  type HTMLCustomElement,
  INSTANCE,
  registerCustomElement,
} from 'maverick.js/element';
import { isFunction } from 'maverick.js/std';

import { waitAnimationFrame } from '../../../src/std/timing';
import { setupTestComponent } from './setup';

it('should handle basic setup and destroy', () => {
  const { container, component, element } = setupTestComponent();
  element.attachComponent(component);
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
  component.destroy();
});

it('should observe attributes', () => {
  const { component, element, elementCtor } = setupTestComponent({
    props: {
      foo: defineProp({ value: 1 }),
      bar: defineProp({ value: 2 }),
      bazBax: defineProp({ value: 3 }),
      bazBaxHux: defineProp({ value: 4 }),
    },
  });

  expect(elementCtor.observedAttributes).toEqual(['foo', 'bar', 'baz-bax', 'baz-bax-hux']);

  element.attachComponent(component);
  element.setAttribute('foo', '10');
  expect(component[INSTANCE]._props.foo()).toBe(10);
});

it('should call attach lifecycle hook', () => {
  const attach = vi.fn();
  const Context = createContext<number>();

  const { component, element } = setupTestComponent({
    setup() {
      provideContext(Context, 1);
    },
    onAttach(el) {
      expect(el).toBeDefined();
      expect(useContext(Context)).toBe(1);
      return attach();
    },
  });

  element.attachComponent(component);
  expect(attach).toBeCalledTimes(1);
});

it('should call connect lifecycle hook', async () => {
  const disconnect = vi.fn();
  const connect = vi.fn().mockReturnValue(disconnect);

  const { component, element } = setupTestComponent({ onConnect: connect });

  expect(connect).not.toHaveBeenCalled();
  expect(disconnect).not.toHaveBeenCalled();

  element.attachComponent(component);

  expect(element.component).toBeTruthy();
  expect(connect).toHaveBeenCalledTimes(1);
  expect(disconnect).not.toHaveBeenCalled();

  element.remove();
  await waitAnimationFrame();

  expect(connect).toHaveBeenCalledTimes(1);
  expect(disconnect).toHaveBeenCalledTimes(1);
});

it('should scope connect/disconnect lifecycle hooks', () => {
  const connect = vi.fn();
  const disconnect = vi.fn();
  const dispose = vi.fn();
  const Context = createContext<number>();

  const { component, element } = setupTestComponent({
    setup() {
      provideContext(Context, 1);
    },
    onConnect() {
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
    },
  });

  element.attachComponent(component);
  element.remove();

  expect(connect).toHaveBeenCalledTimes(1);
  expect(dispose).toHaveBeenCalledTimes(1);
  expect(disconnect).toHaveBeenCalledTimes(1);
});

it('should handle errors thrown in lifecycle hooks', () => {
  const attachError = Error('attach'),
    connectError = Error('connect'),
    disconnectError = Error('disconnect'),
    destroyError = Error('destroy');

  const errorHandler = vi.fn();

  const { component, element } = setupTestComponent({
    setup() {
      onError((e) => {
        errorHandler(e);
      });
    },
    onAttach() {
      throw attachError;
    },
    onConnect() {
      throw connectError;
    },
    onDisconnect() {
      throw disconnectError;
    },
    onDestroy() {
      throw destroyError;
    },
  });

  expect(errorHandler).not.toHaveBeenCalled();

  element.attachComponent(component);
  expect(errorHandler).toHaveBeenCalledTimes(2);
  expect(errorHandler).toHaveBeenCalledWith(attachError);
  expect(errorHandler).toHaveBeenCalledWith(connectError);

  element.remove();
  expect(errorHandler).toHaveBeenCalledTimes(3);

  component.destroy();
  expect(errorHandler).toHaveBeenCalledTimes(4);
  expect(errorHandler).toHaveBeenCalledWith(destroyError);
});

it('should discover events on dispatch', () => {
  const { component, element } = setupTestComponent();

  const callback = vi.fn();

  element.attachComponent(component);
  element.onEventDispatch(callback);
  element.dispatchEvent(new MouseEvent('mk-click'));

  // 2 because attached + mk-click events
  expect(callback).toHaveBeenCalledTimes(2);
  expect(callback).toHaveBeenCalledWith('mk-click');
});

it('should render `setAttributes`', () => {
  class FooComponent extends Component {
    static el = defineElement({
      tagName: 'mk-foo-1',
    });

    constructor(instance) {
      super(instance);
      this.setAttributes({
        foo: () => 10,
        bar: 'none',
        baz: null,
        bux: false,
      });
    }
  }

  registerCustomElement(FooComponent);

  const component = createComponent(FooComponent);
  const element = document.createElement(FooComponent.el.tagName) as HTMLCustomElement;
  element.attachComponent(component);

  expect(element).toMatchInlineSnapshot(`
    <mk-foo-1
      bar="none"
      foo="10"
    />
  `);
});

it('should render `setStyles`', () => {
  class FooComponent extends Component {
    static el = defineElement({
      tagName: 'mk-foo-2',
    });

    constructor(instance) {
      super(instance);
      this.setStyles({
        flex: '1',
        'flex-basis': null,
        'align-self': false,
        'z-index': () => 10,
      });
    }
  }

  registerCustomElement(FooComponent);

  const component = createComponent(FooComponent);
  const element = document.createElement(FooComponent.el.tagName) as HTMLCustomElement;
  element.attachComponent(component);

  expect(element).toMatchInlineSnapshot(`
    <mk-foo-2
      style="flex: 1; z-index: 10;"
    />
  `);
});

it('should invoke onAttach callback', () => {
  const { component, element } = setupTestComponent();

  const callbackA = vi.fn(),
    callbackB = vi.fn(),
    callbackC = vi.fn();

  element.onAttach(callbackA);
  element.onAttach(callbackB);

  expect(callbackA).toHaveBeenCalledTimes(0);
  expect(callbackB).toHaveBeenCalledTimes(0);

  element.attachComponent(component);

  expect(callbackA).toHaveBeenCalledTimes(1);
  expect(callbackB).toHaveBeenCalledTimes(1);

  element.onAttach(callbackC);
  expect(callbackC).toHaveBeenCalledTimes(1);

  component.destroy();
});

it('should define get/set props on element', () => {
  const { element, component } = setupTestComponent({
    props: { foo: defineProp({ value: 1 }), bar: defineProp({ value: 2 }) },
  });

  expect('foo' in element).toBeTruthy();
  expect('bar' in element).toBeTruthy();

  element.attachComponent(component);

  expect(element.foo).toBe(1);
  expect(element.bar).toBe(2);
});

it('should define component proto on element', () => {
  class BaseComponent extends Component {
    static el = defineElement({ tagName: `mk-method-test` });

    _zoo = 10;

    get zoo() {
      return this._zoo;
    }

    set zoo(v) {
      this._zoo = v;
    }

    foo() {
      return 100;
    }

    bar() {}
    _baz() {}
  }

  class TestComponent extends BaseComponent {
    _boo = 20;

    get boo() {
      return this._boo;
    }

    set boo(v) {
      this._boo = v;
    }

    bax() {}
    _hux() {}
  }

  registerCustomElement(TestComponent);

  const element = document.createElement(TestComponent.el.tagName) as HTMLCustomElement;
  element.attachComponent(createComponent(TestComponent));

  expect(element._zoo).toBeUndefined();
  expect(element._boo).toBeUndefined();

  expect(element.zoo).toBe(10);
  expect(element.boo).toBe(20);

  element.zoo = 30;
  element.boo = 40;

  expect(element.zoo).toBe(30);
  expect(element.boo).toBe(40);

  expect(isFunction(element.foo)).toBeTruthy();
  expect(isFunction(element.bar)).toBeTruthy();
  expect(isFunction(element.bax)).toBeTruthy();
  expect(isFunction(element._bar)).toBeFalsy();
  expect(isFunction(element._hux)).toBeFalsy();
});
