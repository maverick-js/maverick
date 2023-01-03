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

import { hydration, Hydrator, Renderer } from '../runtime';
import { $$_create_element } from '../runtime/dom/internal';
import { isDOMElement, setAttribute, setStyle } from '../std/dom';
import { runAll } from '../std/fn';
import { camelToKebabCase } from '../std/string';
import { isBoolean } from '../std/unit';
import type { StylesheetAdopter } from './css';
import { createElementInstance } from './instance';
import { ATTACH, CONNECT, DESTROY, MEMBERS, MOUNT, PROPS, RENDER, SCOPE } from './internal';
import type {
  AnyCustomElement,
  CustomElementDefinition,
  CustomElementHost,
  CustomElementInstance,
  HostElement,
  HTMLCustomElementConstructor,
  InferCustomElementProps,
} from './types';

const MOUNTED = Symbol(__DEV__ ? 'MOUNTED' : 0);

export interface CreateHTMLElementOptions {
  hydrate: Hydrator;
  render: Renderer;
  adoptCSS?: StylesheetAdopter;
}

export function createHTMLElement<T extends AnyCustomElement>(
  definition: CustomElementDefinition<T>,
  options?: CreateHTMLElementOptions,
): HTMLCustomElementConstructor<T> {
  if (__SERVER__) {
    throw Error(
      '[maverick] `createHTMLElement` was called outside of browser - use `createServerElement`',
    );
  }

  type Props = InferCustomElementProps<T>;

  let attrToProp: Map<string, string> | null = null,
    propToAttr: Map<string, string> | null = null,
    dispatchedEvents: Set<string> | null = null,
    reflectedProps: Set<string> | null = null;

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
        if (def.reflect) {
          if (!reflectedProps) reflectedProps = new Set();
          reflectedProps.add(propName);
        }
      }
    }
  }

  class HTMLCustomElement extends HTMLElement implements HostElement {
    private _root?: Node | null;
    private _destroyed = false;
    private _instance: CustomElementInstance | null = null;
    private _onEventDispatch?: (eventType: string) => void;

    private _connectScope: Scope | null = null;
    private _disconnectCallbacks: Dispose[] = [];

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
      return attrToProp ? Array.from(attrToProp.keys()) : [];
    }

    attributeChangedCallback(name, _, newValue) {
      if (!this._instance || !attrToProp) return;
      const propName = attrToProp.get(name)! as keyof Props;
      const from = definition.props![propName]?.type?.from;
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

      if (!this._delegate) {
        requestAnimationFrame(() => {
          if (!this.isConnected) {
            instance?.destroy();
            this._destroyed = true;
          }
        });
      }
    }

    attachComponent(instance: CustomElementInstance) {
      if (__DEV__ && this._instance) {
        console.warn(`[maverick] element \`${definition.tagName}\` already has attached component`);
      }

      if (__DEV__ && this._destroyed) {
        console.warn(
          `[maverick] attempted attaching to destroyed element \`${definition.tagName}\``,
        );
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

      if (__DEV__ && definition.css && !options?.adoptCSS) {
        console.warn(
          `[maverick] \`css\` was provided for \`${definition.tagName}\` but element registration` +
            " doesn't support adopting stylesheets. Resolve this by registering element with" +
            ' `registerElement` instead of lite or headless.',
        );
      }

      if (!hydration && definition.shadowRoot && definition.css && options?.adoptCSS) {
        options.adoptCSS(this._root as ShadowRoot, definition.css);
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

      Object.defineProperties(this, Object.getOwnPropertyDescriptors(instance[MEMBERS]));
      instance[MEMBERS] = null;

      (instance.host as Writable<CustomElementHost<T>>).el = this as unknown as T;
      this._instance = instance;

      for (const attachCallback of instance[ATTACH]) {
        scoped(attachCallback, instance[SCOPE]);
      }

      if (reflectedProps) {
        scoped(() => {
          // Reflected props.
          for (const propName of reflectedProps!) {
            const attrName = propToAttr!.get(propName)!;
            const convert = definition.props![propName]!.type?.to;
            effect(() => {
              const propValue = instance![PROPS]['$' + propName]();
              setAttribute(this, attrName, convert ? convert(propValue) : propValue);
            });
          }
        }, instance[SCOPE]);
      }

      if (this._root && options && $render) {
        const renderer = this._hydrate ? options.hydrate : options.render;
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

    onEventDispatch(callback: (eventType: string) => void) {
      if (dispatchedEvents) for (const eventType of dispatchedEvents) callback(eventType);
      this._onEventDispatch = callback;
    }

    override dispatchEvent(event: Event): boolean {
      if (!dispatchedEvents) dispatchedEvents = new Set();

      if (!dispatchedEvents.has(event.type)) {
        this._onEventDispatch?.(event.type);
        dispatchedEvents.add(event.type);
      }

      return untrack(() => super.dispatchEvent(event));
    }

    private _pendingSetup = false;
    private async _setup() {
      if (this._pendingSetup) return;
      this._pendingSetup = true;

      const parent = this._findParent();

      // Wait for parent custom element to be defined and mounted.
      if (parent) {
        await customElements.whenDefined(parent.localName);
        parent[MOUNTED] || (await new Promise((res) => (parent[MOUNT] ??= []).push(res)));
      }

      // Skip setting up if we disconnected while waiting for parent to mount.
      if (this.isConnected) {
        // Create instance and attach parent scope.
        const instance = createElementInstance(definition, {
          props: this._resolvePropsFromAttrs(),
          scope: parent?.instance![SCOPE]!,
        });

        this.attachComponent(instance);
      }

      this._pendingSetup = false;
    }

    private _findParent(): HTMLCustomElement | null {
      let node: Node | null = this.parentNode,
        prefix = definition.tagName.split('-', 1)[0] + '-';

      while (node) {
        if (node.nodeType === 1 && (node as T).localName.startsWith(prefix)) {
          return node as HTMLCustomElement;
        }

        node = node.parentNode;
      }

      return null;
    }

    private _resolvePropsFromAttrs() {
      const props = {} as Partial<Props>;

      if (attrToProp) {
        for (const attrName of attrToProp.keys()) {
          if (this.hasAttribute(attrName)) {
            const propName = attrToProp.get(attrName)! as keyof Props;
            const convert = definition.props![propName].type?.from;
            if (convert) {
              const attrValue = this.getAttribute(attrName);
              props[propName] = convert(attrValue);
            }
          }
        }
      }

      return props;
    }
  }

  return HTMLCustomElement as any;
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
