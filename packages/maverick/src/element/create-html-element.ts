import {
  Dispose,
  effect,
  getScope,
  isFunction,
  root,
  Scope,
  scoped,
  tick,
  untrack,
} from '@maverick-js/signals';
import type { Writable } from 'type-fest';

import { hydration, Hydrator, Renderer } from '../runtime/dom';
import { $$_create_element } from '../runtime/dom/internal';
import { isDOMElement, setAttribute, setStyle } from '../std/dom';
import { runAll } from '../std/fn';
import { camelToKebabCase } from '../std/string';
import { isBoolean } from '../std/unit';
import type { StylesheetAdopter } from './css';
import {
  ATTACH,
  CONNECT,
  DESTROY,
  MEMBERS,
  MOUNT,
  MOUNTED,
  PROPS,
  RENDER,
  SCOPE,
} from './internal';
import type { ElementLifecycleCallback } from './lifecycle';
import type {
  AnyCustomElement,
  CustomElementDefinition,
  CustomElementHost,
  CustomElementInstance,
  HostElement,
  HTMLCustomElementConstructor,
} from './types';

export interface CustomHTMLElementInit {
  render: Renderer;
  hydrate: Hydrator;
  adoptCSS?: StylesheetAdopter;
}

export function createHTMLElement<T extends AnyCustomElement>(
  definition: CustomElementDefinition<T>,
  init?: CustomHTMLElementInit,
): HTMLCustomElementConstructor<T> {
  if (__SERVER__) {
    throw Error(
      '[maverick] `createHTMLElement` was called outside of browser - use `createServerElement`',
    );
  }

  let attrToProp: Map<string, string> | undefined;
  let propToAttr: Map<string, string> | undefined;

  if (definition.props) {
    attrToProp = new Map();
    propToAttr = new Map();
    for (const propName of Object.keys(definition.props)) {
      const def = definition.props[propName];
      const attr = def.attribute;
      if (attr !== false) {
        const attrName = attr ?? camelToKebabCase(propName);
        attrToProp.set(attrName, propName);
        propToAttr.set(propName, attrName);
      }
    }
  }

  return class MaverickElement extends HTMLCustomElement<T> {
    static override _definition = definition;
    static override _init = init;
    static override _attrToProp = attrToProp;
    static override _propToAttr = propToAttr;
  } as any;
}

const HTML_ELEMENT = (__SERVER__ ? class HTMLElement {} : HTMLElement) as typeof HTMLElement;

class HTMLCustomElement<T extends AnyCustomElement = AnyCustomElement>
  extends HTML_ELEMENT
  implements HostElement
{
  static _definition: CustomElementDefinition;
  static _init?: CustomHTMLElementInit;
  static _attrToProp?: Map<string, string>;
  static _propToAttr?: Map<string, string>;
  static _dispatchedEvents?: Set<string>;

  private _root?: Node | null;
  private _destroyed = false;
  private _instance: CustomElementInstance | null = null;
  private _onEventDispatch?: (eventType: string) => void;

  private _connectScope: Scope | null = null;
  private _attachCallbacks: ElementLifecycleCallback[] | null = [];
  private _disconnectCallbacks: Dispose[] = [];

  keepAlive = false;

  private get _hydrate() {
    return this.hasAttribute('mk-h');
  }

  private get _delegate() {
    return this.hasAttribute('mk-d');
  }

  get instance() {
    return this._instance;
  }

  static get observedAttributes() {
    return this._attrToProp ? Array.from(this._attrToProp.keys()) : [];
  }

  attributeChangedCallback(name, _, newValue) {
    const ctor = this.constructor as typeof HTMLCustomElement;
    if (!this._instance || !ctor._attrToProp) return;
    const propName = ctor._attrToProp.get(name)!;
    const from = ctor._definition.props![propName]?.type?.from;
    if (from) this._instance[PROPS]['$' + (propName as string)].set(from(newValue));
  }

  connectedCallback() {
    const instance = this._instance;

    // If no host framework is available which generally occurs loading over a CDN.
    if (!this._delegate && !instance) return this._setup();

    // Could be called once element is no longer connected.
    if (!instance || !this.isConnected || instance.host.$connected()) return;

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
    instance.host[PROPS].$connected.set(true);
    tick();

    if (instance[CONNECT].length) {
      scoped(() => {
        // Create new connect root scope so we can dispose of it on disconnect.
        root((dispose) => {
          this._connectScope = getScope()!;

          for (const connectCallback of instance[CONNECT]) {
            // Running in `scoped` to ensure any errors are only contained to a single hook.
            scoped(() => {
              const disconnectCallback = connectCallback();
              if (typeof disconnectCallback === 'function') {
                this._disconnectCallbacks.push(disconnectCallback);
              }
            }, this._connectScope);
          }

          this._disconnectCallbacks.push(dispose);
        });
      }, instance[SCOPE]);
    }

    // Mount
    if (!instance.host.$mounted()) {
      instance.host[PROPS].$mounted.set(true);
      tick();

      for (const mountCallback of instance[MOUNT]) {
        scoped(() => {
          const destroyCallback = mountCallback();
          if (typeof destroyCallback === 'function') {
            instance[DESTROY].push(destroyCallback);
          }
        }, instance[SCOPE]);
      }

      instance[MOUNT].length = 0;

      if (this[MOUNT]) {
        runAll(this[MOUNT]);
        this[MOUNT] = null;
      }

      this[MOUNTED] = true;
    }

    tick();
    return;
  }

  disconnectedCallback() {
    const instance = this._instance;

    if (!instance?.host.$connected() || this._destroyed) return;

    instance.host[PROPS].$connected.set(false);
    tick();

    for (const disconnectCallback of this._disconnectCallbacks) {
      scoped(disconnectCallback, this._connectScope);
    }

    this._connectScope = null;
    tick();

    if (!this._delegate && !this.keepAlive) {
      requestAnimationFrame(() => {
        if (!this.isConnected) {
          instance?.destroy();
          this._destroyed = true;
        }
      });
    }
  }

  attachComponent(instance: CustomElementInstance) {
    const ctor = this.constructor as typeof HTMLCustomElement,
      definition = ctor._definition,
      init = ctor._init;

    if (__DEV__ && this._instance) {
      console.warn(`[maverick] element \`${definition.tagName}\` already has attached component`);
    }

    if (__DEV__ && this._destroyed) {
      console.warn(`[maverick] attempted attaching to destroyed element \`${definition.tagName}\``);
    }

    if (this._instance || this._destroyed) return;

    const $render = instance[RENDER];

    this._root = $render
      ? definition.shadowRoot
        ? this.shadowRoot ??
          this.attachShadow(
            isBoolean(definition.shadowRoot) ? { mode: 'open' } : definition.shadowRoot,
          )
        : resolveShadowRootElement(this)
      : null;

    if (__DEV__ && definition.css && !init?.adoptCSS) {
      console.warn(
        `[maverick] \`css\` was provided for \`${definition.tagName}\` but element registration` +
          " doesn't support adopting stylesheets. Resolve this by registering element with" +
          ' `registerElement` instead of lite or headless.',
      );
    }

    if (!hydration && definition.shadowRoot && definition.css && init?.adoptCSS) {
      init.adoptCSS(this._root as ShadowRoot, definition.css);
    }

    const { $attrs, $styles } = instance.host[PROPS];

    for (const name of Object.keys($attrs!)) {
      if (isFunction($attrs![name])) {
        effect(() => setAttribute(this, name, ($attrs![name] as Function)()));
      } else {
        setAttribute(this, name, $attrs![name]);
      }
    }

    for (const name of Object.keys($styles!)) {
      if (isFunction($styles![name])) {
        effect(() => setStyle(this, name, ($styles![name] as Function)()));
      } else {
        setStyle(this, name, $styles![name]);
      }
    }

    instance.host[PROPS].$attrs = null;
    instance.host[PROPS].$styles = null;

    if (instance[MEMBERS]) {
      Object.defineProperties(this, Object.getOwnPropertyDescriptors(instance[MEMBERS]));
      instance[MEMBERS] = null;
    }

    (instance.host as Writable<CustomElementHost<T>>).el = this as unknown as T;
    this._instance = instance;

    for (const attachCallback of [...instance[ATTACH], ...this._attachCallbacks!]) {
      scoped(attachCallback, instance[SCOPE]);
    }

    this._attachCallbacks = null;

    if (this._root && init && $render) {
      const renderer = this._hydrate ? init.hydrate : init.render;
      renderer($render, {
        target: this._root,
        resume: !definition.shadowRoot,
      });
    }

    instance[DESTROY].push(() => {
      this.disconnectedCallback();
      this._instance = null;
      this._destroyed = true;
    });

    tick();
    this.connectedCallback();
  }

  onAttach(callback: () => void) {
    if (this._instance) callback();
    else this._attachCallbacks!.push(callback);
  }

  onEventDispatch(callback: (eventType: string) => void) {
    const ctor = this.constructor as typeof HTMLCustomElement;
    if (ctor._dispatchedEvents) for (const eventType of ctor._dispatchedEvents) callback(eventType);
    this._onEventDispatch = callback;
  }

  destroy() {
    this._instance?.destroy();
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
    await setup(this);
    this._pendingSetup = false;
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
