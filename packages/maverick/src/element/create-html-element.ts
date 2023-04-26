import {
  type Dispose,
  effect,
  getScope,
  isFunction,
  root,
  type Scope,
  scoped,
  tick,
  untrack,
} from '@maverick-js/signals';

import { hydration, type Hydrator, type Renderer } from '../runtime/dom';
import { $$_create_element } from '../runtime/dom/internal';
import { isDOMElement, setAttribute, setStyle } from '../std/dom';
import { runAll } from '../std/fn';
import { camelToKebabCase } from '../std/string';
import { isArray, isBoolean, noop } from '../std/unit';
import type { AnyComponent, ComponentConstructor } from './component';
import type { StylesheetAdopter } from './css';
import type { HostElement, HTMLCustomElementConstructor } from './host';
import type { ComponentLifecycleCallback } from './instance';
import { CONNECT, METHODS, PROPS } from './internal';

export interface HTMLCustomElementInit {
  render: Renderer;
  hydrate: Hydrator;
  adoptCSS?: StylesheetAdopter;
}

export function createHTMLElement<Component extends AnyComponent>(
  Component: ComponentConstructor<Component>,
  init?: HTMLCustomElementInit,
): HTMLCustomElementConstructor<Component> {
  if (__SERVER__) {
    throw Error(
      '[maverick] `createHTMLElement` was called outside of browser - use `createServerElement`',
    );
  }

  let attrs: Map<string, string> | undefined;

  if (Component.el.props) {
    attrs = new Map();
    for (const propName of Object.keys(Component.el.props)) {
      const def = Component.el.props[propName];
      const attr = def.attribute;
      if (attr !== false) {
        const attrName = attr ?? camelToKebabCase(propName);
        attrs.set(attrName, propName);
      }
    }
  }

  class MaverickElement extends HTMLCustomElement<Component> {
    static override get _component() {
      return Component;
    }
    static override _init = init;
    static override _attrs = attrs;
  }

  const proto = MaverickElement.prototype,
    componentProto = Component.prototype;

  if (Component.el.props) {
    for (const prop of Object.keys(Component.el.props)) {
      Object.defineProperty(proto, prop, {
        enumerable: true,
        configurable: true,
        get(this: HTMLCustomElement) {
          if (__DEV__ && !this.component) this._throwAttachError([`el.${prop}`]);
          return this.component!.instance._props[prop]();
        },
        set(this: HTMLCustomElement, value) {
          if (__DEV__ && !this.component) this._throwAttachError([`el.${prop} = ${value}`]);
          this.component!.instance._props[prop].set(value);
        },
      });
    }
  }

  if (componentProto[PROPS]) {
    for (const name of componentProto[PROPS]) {
      Object.defineProperty(proto, name, {
        enumerable: true,
        configurable: true,
        get(this: HTMLCustomElement) {
          if (__DEV__ && !this.component) this._throwAttachError([`el.${name}`]);
          return this.component![name];
        },
        set(this: HTMLCustomElement, value) {
          if (__DEV__ && !this.component) this._throwAttachError([`el.${name} = ${value}`]);
          this.component![name] = value;
        },
      });
    }
  }

  if (componentProto[METHODS]) {
    for (const name of componentProto[METHODS]) {
      proto[name] = function (this: HTMLCustomElement, ...args) {
        if (__DEV__ && !this.component) this._throwAttachError([`el.${name}(...)`]);
        return this.component![name](...args);
      };
    }
  }

  return MaverickElement as any;
}

const HTML_ELEMENT = (__SERVER__ ? class HTMLElement {} : HTMLElement) as typeof HTMLElement;

class HTMLCustomElement<Component extends AnyComponent = AnyComponent>
  extends HTML_ELEMENT
  implements HostElement<Component>
{
  static _component: ComponentConstructor;
  static _init?: HTMLCustomElementInit;
  static _attrs?: Map<string, string>;
  static _dispatchedEvents?: Set<string>;

  private _root?: Node | null;
  private _connected = false;
  private _destroyed = false;
  private _component: Component | null = null;
  private _onEventDispatch?: (eventType: string) => void;

  private _connectScope: Scope | null = null;
  private _attachCallbacks: Set<ComponentLifecycleCallback> | null = new Set();
  private _disconnectCallbacks: Dispose[] = [];

  keepAlive = false;

  /** @internal */
  [CONNECT]: boolean | ComponentLifecycleCallback[] = [];

  private get _hydrate() {
    return this.hasAttribute('mk-h');
  }

  private get _delegate() {
    return this.hasAttribute('mk-d');
  }

  get component() {
    return this._component;
  }

  get state() {
    if (__DEV__ && !this._component) {
      this._throwAttachError(['el.state.foo']);
    }

    return this._component!.instance._state;
  }

  static get observedAttributes() {
    return this._attrs ? Array.from(this._attrs.keys()) : [];
  }

  attributeChangedCallback(name, _, newValue) {
    const ctor = this.constructor as typeof HTMLCustomElement;
    if (!this._component || !ctor._attrs) return;
    const propName = ctor._attrs.get(name)!;
    const from = ctor._component.el.props![propName]?.type?.from;
    if (from) this._component.instance._props[propName].set(from(newValue));
  }

  connectedCallback() {
    const instance = this._component?.instance;

    // If no host framework is available which generally occurs loading over a CDN.
    if (!this._delegate && !instance) return this._setup();

    // Could be called once element is no longer connected.
    if (!instance || !this.isConnected || this._connected) return;

    if (this._destroyed) {
      if (__DEV__) {
        throw Error(
          __DEV__
            ? '[maverick] attempting to connect an element that has been destroyed'
            : '[maverick] bad connect',
        );
      }

      return;
    }

    if (this.hasAttribute('keep-alive')) this.keepAlive = true;

    // Connect
    this._connected = true;
    tick();

    if (instance._connectCallbacks.length) {
      scoped(() => {
        // Create new connect root scope so we can dispose of it on disconnect.
        root((dispose) => {
          this._connectScope = getScope()!;

          for (const connectCallback of instance._connectCallbacks) {
            // Running in `scoped` to ensure any errors are only contained to a single hook.
            scoped(() => {
              const disconnectCallback = connectCallback(this);
              if (isFunction(disconnectCallback)) {
                this._disconnectCallbacks.push(disconnectCallback);
              }
            }, this._connectScope);
          }

          this._disconnectCallbacks.push(dispose);
        });
      }, instance._scope);
    }

    if (isArray(this[CONNECT])) {
      runAll(this[CONNECT], this);
      this[CONNECT] = true;
    }

    tick();
    return;
  }

  disconnectedCallback() {
    const instance = this._component?.instance;

    if (!this._connected || this._destroyed) return;

    this._connected = false;
    tick();

    for (const callback of this._disconnectCallbacks) {
      scoped(callback, this._connectScope);
    }

    if (instance?._disconnectCallbacks.length) {
      for (const callback of instance._disconnectCallbacks) {
        scoped(() => callback(this), instance._scope);
      }
    }

    this._connectScope = null;
    tick();

    if (!this._delegate && !this.keepAlive) {
      requestAnimationFrame(() => {
        if (!this.isConnected) {
          instance?._destroy();
          this._destroyed = true;
        }
      });
    }
  }

  attachComponent(component: Component) {
    const instance = component.instance,
      ctor = this.constructor as typeof HTMLCustomElement,
      def = ctor._component.el,
      init = ctor._init;

    if (__DEV__ && this._component) {
      console.warn(`[maverick] element \`${def.tagName}\` already has attached component`);
    }

    if (__DEV__ && this._destroyed) {
      console.warn(`[maverick] attempted attaching to destroyed element \`${def.tagName}\``);
    }

    if (this._component || this._destroyed) return;

    this._root = instance._renderer
      ? def.shadowRoot
        ? this.shadowRoot ??
          this.attachShadow(isBoolean(def.shadowRoot) ? { mode: 'open' } : def.shadowRoot)
        : resolveShadowRootElement(this)
      : null;

    if (__DEV__ && def.css && !init?.adoptCSS) {
      console.warn(
        `[maverick] \`css\` was provided for \`${def.tagName}\` but element registration` +
          " doesn't support adopting stylesheets. Resolve this by registering element with" +
          ' `registerElement` instead of lite or headless.',
      );
    }

    if (!hydration && def.shadowRoot && def.css && init?.adoptCSS) {
      init.adoptCSS(this._root as ShadowRoot, def.css);
    }

    instance._el = this;
    this._component = component;

    for (const callback of [...instance._attachCallbacks, ...this._attachCallbacks!]) {
      scoped(() => callback(this), instance._scope);
    }

    instance._attachCallbacks.length = 0;
    this._attachCallbacks = null;

    const $attrs = instance._attrs,
      $styles = instance._styles;

    if ($attrs) {
      for (const name of Object.keys($attrs)) {
        if (isFunction($attrs[name])) {
          effect(() => setAttribute(this, name, ($attrs[name] as Function)()));
        } else {
          setAttribute(this, name, $attrs[name]);
        }
      }
    }

    if ($styles) {
      for (const name of Object.keys($styles)) {
        if (isFunction($styles[name])) {
          effect(() => setStyle(this, name, ($styles[name] as Function)()));
        } else {
          setStyle(this, name, $styles[name]);
        }
      }
    }

    this.dispatchEvent(new Event('attached'));

    if (this._root && init && instance._renderer) {
      const renderer = this._hydrate ? init.hydrate : init.render;
      renderer(() => instance._render(), {
        target: this._root,
        resume: !def.shadowRoot,
      });
    }

    tick();
    this.connectedCallback();
  }

  subscribe(callback: (state: any) => void) {
    if (__DEV__ && !this._component) {
      this._throwAttachError(['el.subscribe(({ foo, bar }) => {', '  // ...', '});']);
    }

    if (__DEV__ && !this._component?.instance!._state) {
      const ctor = this.constructor as typeof HTMLCustomElement;
      const tagName = ctor._component.el.tagName;
      throw Error(`[maverick] \`${tagName}\` element does not have a store to subscribe to`);
    }

    return scoped(() => {
      return effect(() => callback(this._component!.instance._state));
    }, this._component!.instance._scope);
  }

  onAttach(callback: ComponentLifecycleCallback) {
    if (this._component) {
      callback(this);
      return noop;
    } else {
      this._attachCallbacks!.add(callback);
      return () => this._attachCallbacks?.delete(callback);
    }
  }

  onEventDispatch(callback: (eventType: string) => void) {
    const ctor = this.constructor as typeof HTMLCustomElement;
    if (ctor._dispatchedEvents) for (const eventType of ctor._dispatchedEvents) callback(eventType);
    this._onEventDispatch = callback;
  }

  destroy() {
    this.disconnectedCallback();
    this._component?.destroy();
    this._component = null;
    this._destroyed = true;
  }

  override dispatchEvent(event: Event): boolean {
    if (this._delegate) {
      const ctor = this.constructor as typeof HTMLCustomElement;
      if (!ctor._dispatchedEvents) ctor._dispatchedEvents = new Set();
      if (!ctor._dispatchedEvents.has(event.type)) {
        this._onEventDispatch?.(event.type);
        ctor._dispatchedEvents.add(event.type);
      }
    }

    return untrack(() => super.dispatchEvent(event));
  }

  private _pendingSetup = false;
  private async _setup() {
    if (this._pendingSetup) return;
    this._pendingSetup = true;
    const { setup } = await import('./setup');
    await setup(this as any);
    this._pendingSetup = false;
  }

  protected _throwAttachError(code: string[]) {
    if (__DEV__) {
      const ctor = this.constructor as typeof HTMLCustomElement;
      const tagName = ctor._component.el.tagName;
      throw Error(
        '[maverick] component instance has not attached yet, wait for event like so:\n\n' +
          `const el = document.querySelector('${tagName}');\n` +
          `el.addEventListener('attached', () => {\n` +
          ('  ' + code.join('\n  ')) +
          `\n}, { once: true });\n`,
      );
    }
  }
}

function resolveShadowRootElement(root: Element) {
  if (isDOMElement(root.firstChild) && root.firstChild.localName === 'shadow-root') {
    return root.firstChild;
  } else {
    const shadowRoot = $$_create_element('shadow-root');
    root.prepend(shadowRoot);
    return shadowRoot;
  }
}
