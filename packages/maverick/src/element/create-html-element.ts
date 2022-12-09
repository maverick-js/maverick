import {
  Dispose,
  effect,
  getScope,
  isWriteSignal,
  root,
  Scope,
  scoped,
  tick,
  untrack,
} from '@maverick-js/signals';

import { hydrate, hydration, render } from '../runtime';
import { $$_create_element } from '../runtime/dom/internal';
import { isDOMElement, setAttribute, setStyle } from '../std/dom';
import { runAll } from '../std/fn';
import { camelToKebabCase } from '../std/string';
import { isBoolean, isFunction } from '../std/unit';
import { adoptCSS } from './css';
import { createElementInstance } from './instance';
import { ATTACH, CONNECT, DESTROY, HOST, MEMBERS, MOUNT, PROPS, RENDER, SCOPE } from './internal';
import type {
  AnyCustomElement,
  AnyCustomElementDefinition,
  AnyCustomElementInstance,
  CustomElementDefinition,
  CustomElementInstanceInit,
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
      const from = propDefs[propName]?.converter?.from;
      if (from) this._instance[PROPS][propName] = from(newValue);
    }

    connectedCallback() {
      const instance = this._instance;

      // If no host framework is available which generally occurs loading over a CDN.
      if (!this._delegate && !instance) return this._nonDelegateSetup();

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
        tick();

        if (this[MOUNT]) {
          runAll(this[MOUNT]);
          this[MOUNT] = null;
        }

        this[MOUNTED] = true;
      }
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

      for (const attrName of attrToProp.keys()) {
        if (this.hasAttribute(attrName)) {
          const propName = attrToProp.get(attrName)! as keyof Props;
          const convert = propDefs[propName].converter?.from;
          if (convert) {
            const attrValue = this.getAttribute(attrName);
            instance[PROPS][propName] = convert(attrValue);
          }
        }
      }

      if (definition.cssvars) {
        const vars = isFunction(definition.cssvars)
          ? definition.cssvars(instance.props)
          : definition.cssvars;

        const style = getComputedStyle(this);
        for (const name of Object.keys(vars)) {
          const varName = `--${name}`;
          if (isFunction(vars[name]) || !style.getPropertyValue(varName)) {
            setStyle(this, varName, vars[name]);
          }
        }
      }

      const $children = instance.host[PROPS].$children;
      if (isWriteSignal($children)) {
        const onMutation = () => {
          $children.set(this.childElementCount > 1);
          tick();
        };

        onMutation();
        const observer = new MutationObserver(onMutation);
        observer.observe(this, { childList: true });
        instance[DESTROY].push(() => observer.disconnect());
      }

      Object.defineProperties(this, Object.getOwnPropertyDescriptors(instance[MEMBERS]));
      instance[MEMBERS] = undefined;

      instance.host.el = this as unknown as T;
      this._instance = instance;

      for (const attachCallback of instance[ATTACH]) {
        scoped(attachCallback, instance[SCOPE]);
      }

      if (reflectedProps.size) {
        scoped(() => {
          // Reflected props.
          for (const propName of reflectedProps) {
            const attrName = propToAttr.get(propName)!;
            const convert = propDefs[propName]!.converter?.to;
            effect(() => {
              const propValue = instance![PROPS][propName];
              const attrValue = convert?.(propValue) ?? propValue + '';
              setAttribute(this, attrName, attrValue);
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
    private _nonDelegateSetup() {
      if (this._pendingSetup) return;

      const prefix = definition.tagName.split('-', 1)[0] + '-',
        deps: HTMLCustomElement[] = [],
        whenDepsMounted: Promise<void>[] = [];

      let node: Node | null = this.parentNode;
      while (node) {
        if (node.nodeType === 1 && (node as T).localName.startsWith(prefix)) {
          const dep = node as HTMLCustomElement;
          deps.push(dep);
          whenDepsMounted.push(
            customElements
              .whenDefined(dep.localName)
              .then(() => dep[MOUNTED] || new Promise((res) => (dep[MOUNT] ??= []).push(res))),
          );
        }

        node = node.parentNode;
      }

      this._pendingSetup = true;
      Promise.all(whenDepsMounted).then(() => {
        this._pendingSetup = false;
        if (!this.isConnected) return;

        let run = () => this._attachComponent();
        for (const dep of deps) {
          const next = run;
          run = () => scoped(next, dep.instance![SCOPE]);
        }

        run();
      });
    }

    private _attachComponent(init?: CustomElementInstanceInit<Props>) {
      this.attachComponent(createElementInstance(definition, init));
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
