import { effect, getScheduler, isSubject, root, untrack } from '@maverick-js/observables';

import { createScopedRunner, hydrate, hydration, render } from '../runtime';
import { $$_create_element } from '../runtime/dom/internal';
import { isDOMElement, setAttribute, setStyle } from '../std/dom';
import { runAll } from '../std/fn';
import { camelToKebabCase } from '../std/string';
import { isBoolean, isFunction } from '../std/unit';
import { adoptCSS } from './css';
import { createElementInstance } from './instance';
import {
  AFTER_UPDATE,
  ATTACH,
  BEFORE_UPDATE,
  CONNECT,
  DESTROY,
  DISCONNECT,
  HOST,
  MEMBERS,
  MOUNT,
  PROPS,
  RENDER,
} from './internal';
import type {
  AnyElementDefinition,
  AnyMaverickElement,
  ElementDefinition,
  ElementInstance,
  ElementInstanceInit,
  ElementPropDefinitions,
  HostElement,
  InferElementEvents,
  InferElementProps,
  MaverickElement,
  MaverickElementConstructor,
} from './types';

const scheduler = getScheduler(),
  MOUNTED = Symbol(__DEV__ ? 'MOUNTED' : 0);

export function createHTMLElement<Element extends AnyMaverickElement>(
  definition: ElementDefinition<Element>,
): MaverickElementConstructor<Element> {
  if (__SERVER__) {
    throw Error(
      '[maverick] `createHTMLElement` was called outside of browser - use `createServerElement`',
    );
  }

  type Props = InferElementProps<Element>;
  type Events = InferElementEvents<Element>;

  const propDefs = (definition.props ?? {}) as ElementPropDefinitions<Props>;
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

  class MaverickElement extends HTMLElement implements HostElement<Props, Events> {
    /** @internal */
    [HOST] = true;

    private _root?: Node | null;
    private _destroyed = false;
    private _instance: ElementInstance<Props, Events> | null = null;
    private _onEventDispatch?: (eventType: string) => void;
    /** Dynamic disconnect callbacks returned from `onConnect` */
    private _disconnectCallbacks: (() => void)[] = [];

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
        instance.run(() => {
          root((dispose) => {
            const run = createScopedRunner();

            for (const connectCallback of instance[CONNECT]) {
              const disconnectCallback = run(connectCallback);
              if (isFunction(disconnectCallback)) {
                this._disconnectCallbacks.push(() => run(() => disconnectCallback(this)));
              }
            }

            this._disconnectCallbacks.push(dispose);
          });
        });
      }

      // Mount
      if (!instance.host.$mounted) {
        instance.host[PROPS].$mounted.set(true);

        for (const mountCallback of instance[MOUNT]) {
          const destroyCallback = mountCallback();
          if (isFunction(destroyCallback)) {
            instance[DESTROY].push(() => instance.run(() => destroyCallback(this)));
          }
        }

        instance[MOUNT] = [];
        scheduler.flushSync();

        if (this[MOUNT]) {
          runAll(this[MOUNT]);
          this[MOUNT] = undefined;
        }

        // Updates
        instance[DESTROY].push(scheduler.onBeforeFlush(() => runAll(instance[BEFORE_UPDATE])));
        instance[DESTROY].push(scheduler.onFlush(() => runAll(instance[AFTER_UPDATE])));

        this[MOUNTED] = true;
      }
    }

    disconnectedCallback() {
      const instance = this._instance;

      if (!instance?.host.$connected || this._destroyed) return;

      instance.host[PROPS].$connected.set(false);
      runAll(instance[DISCONNECT]);
      runAll(this._disconnectCallbacks);
      this._disconnectCallbacks = [];
      scheduler.flushSync();

      if (!this._delegate) {
        requestAnimationFrame(() => {
          if (!this.isConnected) {
            instance?.destroy();
            this._destroyed = true;
          }
        });
      }
    }

    attachComponent(instance: ElementInstance<Props, Events>) {
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
      if (isSubject($children)) {
        const onMutation = () => $children.set(this.childElementCount > 1);
        onMutation();
        const observer = new MutationObserver(onMutation);
        observer.observe(this, { childList: true });
        instance[DESTROY].push(() => observer.disconnect());
      }

      Object.defineProperties(this, Object.getOwnPropertyDescriptors(instance[MEMBERS]));
      instance[MEMBERS] = undefined;

      instance.host.el = this;
      this._instance = instance;

      for (const attachCallback of instance[ATTACH]) {
        const destroyCallback = attachCallback();
        if (isFunction(destroyCallback)) {
          instance[DESTROY].push(() => instance.run(() => destroyCallback(this)));
        }
      }

      if (reflectedProps.size) {
        instance.run(() => {
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
        });
      }

      if (this._root && $render) {
        const renderer = this._hydrate ? hydrate : render;
        renderer($render, {
          target: this._root,
          resume: !definition.shadowRoot,
        });
      }

      instance[DESTROY].push(() => {
        this._instance = null;
        this._destroyed = true;
      });

      scheduler.flushSync();
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
        deps: MaverickElement[] = [],
        whenDepsMounted: Promise<void>[] = [];

      let node: Node | null = this.parentNode;
      while (node) {
        if (node.nodeType === 1 && (node as Element).localName.startsWith(prefix)) {
          const dep = node as MaverickElement;
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
          run = () => dep.instance!.run(next);
        }

        run();
      });
    }

    private _attachComponent(init?: ElementInstanceInit<Props>) {
      this.attachComponent(createElementInstance(definition, init));
    }
  }

  return MaverickElement as any;
}

export function isHostElement(node?: Node | null): node is MaverickElement {
  return !!node?.[HOST];
}

export function defineCustomElement(definition: AnyElementDefinition) {
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
