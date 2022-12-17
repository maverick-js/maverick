import {
  Dispose,
  effect,
  getScope,
  root,
  SCOPE,
  Scope,
  scoped,
  tick,
  untrack,
} from '@maverick-js/signals';
import type { Writable } from 'type-fest';

import { hydrate, hydration, render } from '../runtime';
import { $$_create_element } from '../runtime/dom/internal';
import { isDOMElement, setAttribute, setStyle } from '../std/dom';
import { runAll } from '../std/fn';
import { camelToKebabCase } from '../std/string';
import { isBoolean } from '../std/unit';
import { adoptCSS } from './css';
import { createElementInstance } from './instance';
import { ATTACH, CONNECT, DESTROY, HOST, MEMBERS, MOUNT, PROPS, RENDER } from './internal';
import type {
  AnyCustomElement,
  AnyCustomElementDefinition,
  AnyCustomElementInstance,
  CustomElementDefinition,
  CustomElementHost,
  CustomElementPropDefinitions,
  HostElement,
  HTMLCustomElement,
  HTMLCustomElementConstructor,
  InferCustomElementProps,
} from './types';

const MOUNTED = Symbol(__DEV__ ? 'MOUNTED' : 0);

export function createHTMLElement<T extends AnyCustomElement>(
  definition: CustomElementDefinition<T>,
): HTMLCustomElementConstructor<T> {
  if (__SERVER__) {
    throw Error(
      '[maverick] `createHTMLElement` was called outside of browser - use `createServerElement`',
    );
  }

  type Props = InferCustomElementProps<T>;

  const propDefs = (definition.props ?? {}) as CustomElementPropDefinitions<Props>;
  const attrToProp = new Map<string, string>();
  const propToAttr = new Map<string, string>();
  const dispatchedEvents = new Set<string>();
  const reflectedProps = new Set<string>();

  for (const propName of Object.keys(propDefs)) {
    const def = propDefs[propName];
    const attr = def.attribute;
    if (attr !== false) {
      const attrName = attr ?? camelToKebabCase(propName);
      attrToProp.set(attrName, propName);
      propToAttr.set(propName, attrName);
      if (def.reflect) reflectedProps.add(propName);
    }
  }

  class HTMLCustomElement extends HTMLElement implements HostElement {
    /** @internal */
    [HOST] = true;

    private _root?: Node | null;
    private _destroyed = false;
    private _instance: AnyCustomElementInstance | null = null;
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
      return Array.from(attrToProp.keys());
    }

    attributeChangedCallback(name, _, newValue) {
      if (!this._instance) return;
      const propName = attrToProp.get(name)! as keyof Props;
      const from = propDefs[propName]?.type?.from;
      if (from) this._instance[PROPS][propName] = from(newValue);
    }

    connectedCallback() {
      const instance = this._instance;

      // If no host framework is available which generally occurs loading over a CDN.
      if (!this._delegate && !instance) return this._setup();

      // Could be called once element is no longer connected.
      if (!instance || !this.isConnected || instance.host.$connected) return;

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
      if (!instance.host.$mounted) {
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

      if (!instance?.host.$connected || this._destroyed) return;

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

    attachComponent(instance: AnyCustomElementInstance) {
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

      if (!hydration && definition.shadowRoot && definition.css) {
        adoptCSS(this._root as ShadowRoot, definition.css);
      }

      const { $attrs, $cssvars } = instance.host[PROPS];

      for (const name of Object.keys($attrs)) setAttribute(this, name, $attrs[name]);
      for (const name of Object.keys($cssvars)) setStyle(this, `--${name}`, $cssvars[name]);

      Object.defineProperties(this, Object.getOwnPropertyDescriptors(instance[MEMBERS]));
      instance[MEMBERS] = undefined;

      (instance.host as Writable<CustomElementHost<T>>).el = this as unknown as T;
      this._instance = instance;

      for (const attachCallback of instance[ATTACH]) {
        scoped(attachCallback, instance[SCOPE]);
      }

      if (reflectedProps.size) {
        scoped(() => {
          // Reflected props.
          for (const propName of reflectedProps) {
            const attrName = propToAttr.get(propName)!;
            const convert = propDefs[propName]!.type?.to;
            effect(() => {
              const propValue = instance![PROPS][propName];
              setAttribute(this, attrName, convert ? convert(propValue) : propValue);
            });
          }
        }, instance[SCOPE]);
      }

      if (this._root && $render) {
        const renderer = this._hydrate ? hydrate : render;
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
      for (const eventType of dispatchedEvents) callback(eventType);
      this._onEventDispatch = callback;
    }

    override dispatchEvent(event: Event): boolean {
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

      for (const attrName of attrToProp.keys()) {
        if (this.hasAttribute(attrName)) {
          const propName = attrToProp.get(attrName)! as keyof Props;
          const convert = propDefs[propName].type?.from;
          if (convert) {
            const attrValue = this.getAttribute(attrName);
            props[propName] = convert(attrValue);
          }
        }
      }

      return props;
    }
  }

  return HTMLCustomElement as any;
}

export function isHostElement(node?: Node | null): node is HTMLCustomElement {
  return !!node?.[HOST];
}

export function registerCustomElement(definition: AnyCustomElementDefinition) {
  if (__SERVER__) return;
  if (!window.customElements.get(definition.tagName)) {
    window.customElements.define(definition.tagName, createHTMLElement(definition));
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
