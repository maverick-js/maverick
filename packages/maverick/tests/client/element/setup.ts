import {
  Component,
  type ComponentLifecycleCallback,
  createComponent,
  type CustomElementDefinition,
  defineElement,
  type HTMLCustomElement,
  type HTMLCustomElementConstructor,
  registerCustomElement,
} from 'maverick.js/element';

afterEach(() => {
  document.body.innerHTML = '';
});

let count = 0;
export function setupTestComponent(
  init?: Partial<CustomElementDefinition> & {
    setup?(this: Component): void;
    onAttach?: ComponentLifecycleCallback;
    onConnect?: ComponentLifecycleCallback;
    onDisconnect?: ComponentLifecycleCallback;
    onDestroy?: ComponentLifecycleCallback;
  },
  { hydrate = false, delegate = true, append = true } = {},
) {
  class TestComponent extends Component {
    static el = defineElement({
      tagName: `mk-test-${++count}`,
      ...(init as any),
    });

    constructor(component) {
      super(component);
      init?.setup?.call(this);
    }

    protected override onAttach(el: HTMLElement): void {
      return init?.onAttach?.(el);
    }

    protected override onConnect(el: HTMLElement): void {
      return init?.onConnect?.(el);
    }

    protected override onDisconnect(el: HTMLElement): void {
      return init?.onDisconnect?.(el);
    }

    protected override onDestroy(el: HTMLElement): void {
      return init?.onDestroy?.(el);
    }

    override render() {
      return 'Test';
    }
  }

  registerCustomElement(TestComponent);

  const container = document.createElement('div'),
    component = createComponent(TestComponent),
    element = document.createElement(`mk-test-${count}`) as HTMLCustomElement;

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
    component,
    container,
    element,
    elementCtor: element.constructor as HTMLCustomElementConstructor,
  };
}
