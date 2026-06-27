import {
  $$_current_host_component,
  type AttributeConverter,
  Component,
  type ComponentConstructor,
  createComponent,
  type HostElementCallback,
  inferAttributeConverter,
  type MaverickCustomElement,
  type MaverickCustomElementConstructor,
  ON_DISPATCH_SYMBOL,
  RENDER_SYMBOL,
  type Scope,
  scoped,
  SETUP_SYMBOL,
} from '@maverick-js/core';
import { hydrate, hydration, render } from '@maverick-js/dom';
import {
  attachShadow,
  camelToKebabCase,
  cloneEvent,
  isArray,
  isFunction,
  isString,
  runAll,
  walkPrototypeChain,
} from '@maverick-js/std';

import type { MaverickElementConstructor } from './element';
import { ATTRS_SYMBOL, SETUP_CALLBACKS_SYMBOL, SETUP_STATE_SYMBOL } from './symbols';

const enum SetupState {
  Idle = 0,
  Pending = 1,
  Ready = 2,
}

const registry = new Set<string>();

/** @internal */
export function $$_define_custom_element(Component: ComponentConstructor) {
  const name = Component.element?.name;

  if (__DEV__ && !name) {
    throw Error('[maverick]: missing el name');
  }

  if (!registry.has(name!)) {
    defineElement(Component);
    registry.add(name!);
  }
}

export function defineElement(Component: ComponentConstructor) {
  if (__SERVER__) return;
  window.customElements.define(
    Component.element!.name,
    createElementClass(Component) as unknown as CustomElementConstructor,
  );
}

export function createElementClass<T extends Component>(
  Component: ComponentConstructor<T>,
): MaverickElementConstructor<T> {
  class MaverickElement extends HTMLElement {
    static readonly tagName = Component.element!.name;

    private static [ATTRS_SYMBOL]: Map<
      string,
      { prop: string; converter: AttributeConverter<any> }
    > | null = null;

    static get observedAttributes(): string[] {
      if (!this[ATTRS_SYMBOL] && Component.props) {
        const map = new Map(),
          attrs = Component.element?.attributes;

        for (const propName of Object.keys(Component.props)) {
          let attr = attrs?.[propName],
            attrName = isString(attr) ? attr : !attr ? attr : attr?.attr;

          if (attrName === false) continue;
          if (!attrName) attrName = camelToKebabCase(propName);

          map.set(attrName, {
            prop: propName,
            converter:
              (attr && !isString(attr) && attr?.converter) ||
              inferAttributeConverter(Component.props[propName]),
          });
        }

        this[ATTRS_SYMBOL] = map;
      }

      return this[ATTRS_SYMBOL] ? Array.from(this[ATTRS_SYMBOL].keys()) : [];
    }

    readonly $!: T;

    [SETUP_STATE_SYMBOL] = SetupState.Idle;
    [SETUP_CALLBACKS_SYMBOL]: HostElementCallback[] | null = null;

    keepAlive = false;
    forwardKeepAlive = true;

    get scope(): Scope {
      return this.$.$$.scope!;
    }

    get connectScope(): Scope | null {
      return this.$.$$.connectScope;
    }

    get $props() {
      return this.$.$$.props as any;
    }

    get $store() {
      return this.$.$$.store as any;
    }

    get state() {
      return this.$.state as any;
    }

    get isManaged() {
      return this.hasAttribute('data-maverick');
    }

    constructor() {
      super();

      if (this.isManaged || $$_current_host_component) {
        this.$ = $$_current_host_component as T;
      } else {
        this.$ = scoped(() => createComponent(Component), null)!;

        // Properties might be assigned before element is registered. We need to assign them
        // to the internal prop signals and delete from proto chain.
        if (Component.props) {
          const props = this.$props,
            descriptors = Object.getOwnPropertyDescriptors(this);
          for (const prop of Object.keys(descriptors)) {
            if (prop in (Component.props as any)) {
              props[prop].set(this[prop]);
              delete this[prop];
            }
          }
        }
      }
    }

    attributeChangedCallback(name, _, newValue) {
      const Ctor = this.constructor as MaverickElementConstructor;

      if (!Ctor[ATTRS_SYMBOL]) {
        // @ts-expect-error
        super.attributeChangedCallback?.(name, _, newValue);
        return;
      }

      const def = Ctor[ATTRS_SYMBOL].get(name);
      if (def) this[def.prop] = (def.converter as AttributeConverter)(newValue);
    }

    connectedCallback() {
      if (this.isManaged) return;

      const instance = this.$?.$$;
      if (!instance || instance.destroyed) return;

      if (this[SETUP_STATE_SYMBOL] !== SetupState.Ready) {
        setup.call(this);
        return;
      }

      // Could be called once element is no longer connected.
      if (!this.isConnected) return;

      if (this.hasAttribute('keep-alive')) {
        this.keepAlive = true;
      }

      instance.connect();

      if (isArray(this[SETUP_CALLBACKS_SYMBOL])) runAll(this[SETUP_CALLBACKS_SYMBOL], this);
      this[SETUP_CALLBACKS_SYMBOL] = null;

      // @ts-expect-error
      const callback = super.connectedCallback;
      if (callback) scoped(() => callback.call(this), this.connectScope);
    }

    disconnectedCallback() {
      if (this.isManaged) return;

      const instance = this.$?.$$;
      if (!instance || instance.destroyed) return;

      instance.disconnect();

      // @ts-expect-error
      const callback = super.disconnectedCallback;
      if (callback) callback.call(this);

      if (!this.keepAlive && !this.hasAttribute('keep-alive')) {
        setTimeout(() => {
          window.requestAnimationFrame(() => {
            if (!this.isConnected) instance.destroy();
          });
        }, 0);
      }
    }

    [SETUP_SYMBOL]() {
      const instance = this.$.$$,
        Ctor = this.constructor as MaverickElementConstructor;

      if (__DEV__ && instance.destroyed) {
        console.warn(`[maverick]: attempted attaching to destroyed element \`${this.tagName}\``);
      }

      if (instance.destroyed) return;

      const attrs = Ctor[ATTRS_SYMBOL];
      if (attrs) {
        for (const attr of this.attributes) {
          let def = attrs.get(attr.name);
          if (def && def.converter) {
            instance.props[def.prop].set(def.converter(this.getAttribute(attr.name)));
          }
        }
      }

      this.$.$$[ON_DISPATCH_SYMBOL] = this.#dispatch.bind(this);

      instance.setup();

      if (this.$.render) {
        const shadowRoot = Component.element?.shadowRoot,
          target = shadowRoot ? attachShadow(this, shadowRoot) : this;

        scoped(() => {
          const renderer = this.$[RENDER_SYMBOL];
          if (hydration && shadowRoot) {
            hydrate(renderer, { target });
          } else {
            render(renderer, { target });
          }
        }, instance.scope);
      }

      instance.attach(this);

      this[SETUP_STATE_SYMBOL] = SetupState.Ready;

      this.connectedCallback();
    }

    subscribe(callback: (state: any) => void) {
      return this.$.subscribe(callback);
    }

    #dispatch(event: Event) {
      this.dispatchEvent(cloneEvent(event));
    }

    destroy() {
      this.disconnectedCallback();
      this.$.$$[ON_DISPATCH_SYMBOL] = null;
      this.$.destroy();
    }
  }

  extendPrototype(MaverickElement, Component);

  if (Component.element?.extend) {
    // @ts-expect-error
    return Component.element.extend(MaverickElement);
  }

  // @ts-expect-error
  return MaverickElement;
}

function extendPrototype(
  Element: MaverickCustomElementConstructor,
  Component: ComponentConstructor,
) {
  const ElementProto = Element.prototype;

  if (Component.props) {
    for (const prop of Object.keys(Component.props)) {
      Object.defineProperty(ElementProto, prop, {
        enumerable: true,
        configurable: true,
        get(this) {
          return this.$props[prop]();
        },
        set(this, value) {
          this.$props[prop].set(value);
        },
      });
    }
  }

  const componentProtoChain = walkPrototypeChain(Component, stopPrototypeWalk);

  for (const [name, descriptor] of componentProtoChain) {
    if (isFunction(descriptor.value)) {
      ElementProto[name] = function (...args: any[]) {
        return this.$[name](...args);
      };
    } else {
      Object.defineProperty(ElementProto, name, {
        ...descriptor,
        get() {
          return this.$[name];
        },
        set: descriptor.set
          ? function (this: MaverickCustomElement, value) {
              this.$[name] = value;
            }
          : undefined,
      });
    }
  }
}

function stopPrototypeWalk(proto: object) {
  return proto === Component.prototype;
}

function setup(this: MaverickCustomElement) {
  if (this[SETUP_STATE_SYMBOL] !== SetupState.Idle) return;
  this[SETUP_STATE_SYMBOL] = SetupState.Pending;

  const parent = findParent(this),
    isParentRegistered = parent && window.customElements.get(parent.localName),
    isParentSetup = parent && parent[SETUP_STATE_SYMBOL] === SetupState.Ready;

  if (parent && (!isParentRegistered || !isParentSetup)) {
    void waitForParent.call(this, parent);
    return;
  }

  attach.call(this, parent);
}

async function waitForParent(this: MaverickCustomElement, parent: MaverickCustomElement) {
  await window.customElements.whenDefined(parent.localName);

  if (parent[SETUP_STATE_SYMBOL] !== SetupState.Ready) {
    await new Promise((res) => (parent[SETUP_CALLBACKS_SYMBOL] ??= []).push(res));
  }

  attach.call(this, parent);
}

function attach(this: MaverickCustomElement, parent: MaverickCustomElement | null) {
  // Skip setting up if we disconnected while waiting for parent to connect.
  if (!this.isConnected) return;

  if (parent) {
    if (parent.keepAlive && parent.forwardKeepAlive) {
      this.keepAlive = true;
      this.setAttribute('keep-alive', '');
    }

    const scope = this.$.$$.scope;
    if (scope) parent.$.$$.attachScope!.append(scope);
  }

  this[SETUP_SYMBOL]();
}

function findParent(host: HTMLElement) {
  let node: Node | null = host.parentNode,
    prefix = host.localName.split('-', 1)[0] + '-';

  while (node) {
    if (node.nodeType === 1 && (node as Element).localName.startsWith(prefix)) {
      return node as MaverickCustomElement;
    }

    node = node.parentNode;
  }

  return null;
}
