import {
  type AttributeConverter,
  createComponent,
  type HostElementCallback,
  inferAttributeConverter,
  type MaverickComponent,
  type MaverickComponentConstructor,
  type MaverickCustomElement,
  type MaverickCustomElementConstructor,
  ON_DISPATCH_SYMBOL,
  type Scope,
  scoped,
  SETUP_SYMBOL,
} from '@maverick-js/core';
import { render } from '@maverick-js/dom';
import { camelToKebabCase, isArray, isString, MaverickEvent, runAll } from '@maverick-js/std';

import type { MaverickElementConstructor } from './element';
import { ATTRS_SYMBOL, SETUP_CALLBACKS_SYMBOL, SETUP_STATE_SYMBOL } from './symbols';

const enum SetupState {
  Idle = 0,
  Pending = 1,
  Ready = 2,
}

const registry = new Set<string>();

/** @internal */
export function $$_create_custom_element(Component: MaverickComponentConstructor) {
  const name = Component.element?.name;

  if (!name) {
    throw Error('[maverick]: missing el name');
  }

  if (!registry.has(name)) {
    defineMaverickElement(Component);
    registry.add(name);
  }

  return document.createElement(name);
}

export function defineMaverickElement(Component: MaverickComponentConstructor) {
  if (__SERVER__) return;
  window.customElements.define(Component.element!.name, createMaverickElement(Component));
}

export function createMaverickElement<T extends MaverickComponent>(
  Component: MaverickComponentConstructor<T>,
): MaverickElementConstructor<T> {
  class MaverickElement extends HTMLElement implements MaverickCustomElement<T> {
    static readonly tagName = Component.element!.name;

    private static [ATTRS_SYMBOL]: Map<
      string,
      { prop: string; converter: AttributeConverter<any> }
    > | null = null;

    static get observedAttributes(): string[] {
      if (!this[ATTRS_SYMBOL] && Component.props) {
        const map = new Map(),
          attrs = Component.element?.attrs;

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

    readonly $: T;

    [SETUP_STATE_SYMBOL] = SetupState.Idle;
    [SETUP_CALLBACKS_SYMBOL]: HostElementCallback[] | null = null;

    keepAlive = false;
    forwardKeepAlive = true;

    get scope(): Scope {
      return this.$.$$.scope!;
    }

    get attachScope(): Scope | null {
      return this.$.$$.attachScope;
    }

    get connectScope(): Scope | null {
      return this.$.$$.connectScope;
    }

    get $props() {
      return this.$.$$.props as any;
    }

    get $state() {
      return this.$.$$.$state as any;
    }

    get state() {
      return this.$.state as any;
    }

    constructor() {
      super();

      this.$ = scoped(() => createComponent(Component), null)!;

      this.$.$$[ON_DISPATCH_SYMBOL] = this.#dispatch.bind(this);

      // Properties might be assigned before element is registered. We need to assign them
      // to the internal prop signals and delete from proto chain.
      if (Component.props) {
        const props = this.$props,
          descriptors = Object.getOwnPropertyDescriptors(this);
        for (const prop of Object.keys(descriptors)) {
          if (prop in Component.props) {
            props[prop].set(this[prop]);
            delete this[prop];
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
      const instance = this.$?.$$;
      if (!instance || instance.destroyed || this.hasAttribute('data-delegate')) return;

      instance.disconnect();

      // @ts-expect-error
      const callback = super.disconnectedCallback;
      if (callback) callback.call(this);

      if (!this.keepAlive && !this.hasAttribute('keep-alive')) {
        setTimeout(() => {
          requestAnimationFrame(() => {
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

      instance.setup();

      if (this.$.render) {
        scoped(() => {
          render(this.$.render!, { target: this });
        }, instance.scope);
      }

      instance.attach(this);

      this[SETUP_STATE_SYMBOL] = SetupState.Ready;

      this.connectedCallback();
    }

    // @ts-expect-error
    subscribe(callback: (state: any) => void) {
      return this.$.subscribe(callback);
    }

    #dispatch(event: Event) {
      this.dispatchEvent(
        new MaverickEvent<any>(event.type, {
          ...event,
          trigger: event,
        }),
      );
    }

    destroy() {
      this.disconnectedCallback();
      this.$.$$[ON_DISPATCH_SYMBOL] = null;
      this.$.destroy();
    }
  }

  extendProto(MaverickElement, Component);

  // @ts-expect-error
  return MaverickElement;
}

function extendProto(
  Element: MaverickCustomElementConstructor,
  Component: MaverickComponentConstructor,
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
}

function setup(this: MaverickCustomElement) {
  if (this[SETUP_STATE_SYMBOL] !== SetupState.Idle) return;
  this[SETUP_STATE_SYMBOL] = SetupState.Pending;

  const parent = findParent(this),
    isParentRegistered = parent && window.customElements.get(parent.localName),
    isParentSetup = parent && parent[SETUP_STATE_SYMBOL] === SetupState.Ready;

  if (parent && (!isParentRegistered || !isParentSetup)) {
    waitForParent.call(this, parent);
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
