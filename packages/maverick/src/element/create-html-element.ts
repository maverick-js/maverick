import { effect, getScheduler, isSubject, scope } from '@maverick-js/observables';

import { hydrate, hydration, render } from '../runtime';
import { $$_create_element } from '../runtime/dom/internal';
import { isDOMElement, setAttribute, setStyle } from '../std/dom';
import { run, runAll } from '../std/fn';
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
  SCOPE,
} from './internal';
import type { ElementLifecycleCallback } from './lifecycle';
import type {
  AnyElementDefinition,
  ElementCSSVarRecord,
  ElementDefinition,
  ElementEventRecord,
  ElementInstance,
  ElementInstanceInit,
  ElementMembers,
  ElementPropDefinitions,
  ElementPropRecord,
  HostElement,
  MaverickElement,
  MaverickElementConstructor,
} from './types';

const scheduler = getScheduler();

export function createHTMLElement<
  Props extends ElementPropRecord,
  Events extends ElementEventRecord,
  CSSVars extends ElementCSSVarRecord,
  Members extends ElementMembers,
>(
  definition: ElementDefinition<Props, Events, CSSVars, Members>,
): MaverickElementConstructor<Props, Events, Members> {
  if (__SERVER__) {
    throw Error(
      '[maverick] `createHTMLElement` was called outside of browser - use `createServerElement`',
    );
  }

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

    private _root?: Node;
    private _destroyed = false;
    private _instance: ElementInstance<Props, Events> | null = null;
    private _onEventDispatch?: (eventType: string) => void;

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
      const propName = attrToProp.get(name)!;
      const from = propDefs[propName]?.converter?.from;
      if (from) this._instance[PROPS][propName]?.set(from(newValue));
    }

    connectedCallback() {
      if (!this._delegate && !this._instance) {
        if (definition.parent) {
          defineCustomElement(definition.parent);
          const parent = this.closest(definition.parent.tagName) as MaverickElement;
          const onParentMount = (parent[MOUNT] ??= []);
          onParentMount.push(() =>
            scope(() => this._attachComponent(), parent.instance![SCOPE]!)(),
          );
        } else {
          this._attachComponent();
        }
      }

      // Could be called once element is no longer connected.
      if (!this._instance || !this.isConnected || this._instance.host.$connected) return;

      if (this._destroyed) {
        if (__DEV__) {
          throw Error('[maverick] attempting to connect an element that has been destroyed');
        }

        return;
      }

      // Connect
      this._instance.host[PROPS].$connected.set(true);
      this._instance[DISCONNECT].push(
        ...(this._instance[CONNECT].map(run).filter(isFunction) as ElementLifecycleCallback[]),
      );

      // Mount
      if (!this._instance.host.$mounted) {
        this._instance.host[PROPS].$mounted.set(true);

        this._instance[DESTROY].push(
          ...(this._instance[MOUNT].map(run).filter(isFunction) as ElementLifecycleCallback[]),
        );

        this._instance[MOUNT] = [];
        scheduler.flushSync();

        if (this[MOUNT]) {
          runAll(this[MOUNT]);
          this[MOUNT] = undefined;
        }

        // Updates
        this._instance[DESTROY].push(
          scheduler.onBeforeFlush(() => runAll(this._instance![BEFORE_UPDATE])),
        );
        this._instance[DESTROY].push(
          scheduler.onFlush(() => runAll(this._instance![AFTER_UPDATE])),
        );

        this._instance[SCOPE] = undefined;
      }
    }

    disconnectedCallback() {
      if (!this._instance?.host.$connected || this._destroyed) return;

      this._instance.host[PROPS].$connected.set(false);
      runAll(this._instance[DISCONNECT]);
      this._instance[DISCONNECT] = [];

      if (!this._delegate) {
        requestAnimationFrame(() => {
          if (!this.isConnected) {
            this._instance?.destroy();
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

      this._root = definition.shadowRoot
        ? this.shadowRoot ??
          this.attachShadow(
            isBoolean(definition.shadowRoot) ? { mode: 'open' } : definition.shadowRoot,
          )
        : resolveShadowRootElement(this);

      if (!hydration && definition.shadowRoot && definition.css) {
        adoptCSS(this._root as ShadowRoot, definition.css);
      }

      for (const attrName of attrToProp.keys()) {
        if (this.hasAttribute(attrName)) {
          const propName = attrToProp.get(attrName)!;
          const convert = propDefs[propName].converter?.from;
          if (convert) {
            const attrValue = this.getAttribute(attrName);
            instance[PROPS][propName]!.set(convert(attrValue));
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
      runAll(instance[ATTACH]);

      if (reflectedProps.size) {
        scope(() => {
          // Reflected props.
          for (const propName of reflectedProps) {
            const attrName = propToAttr.get(propName)!;
            const prop = this._instance![PROPS][propName];
            const convert = propDefs[propName]!.converter?.to;
            effect(() => {
              const propValue = prop();
              const attrValue = convert?.(propValue) ?? propValue + '';
              setAttribute(this, attrName, attrValue);
            });
          }
        }, instance[SCOPE]!)();
      }

      const renderer = this._hydrate ? hydrate : render;
      renderer(instance[RENDER]!, {
        target: this._root,
        resume: !definition.shadowRoot,
      });

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

      return super.dispatchEvent(event);
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
