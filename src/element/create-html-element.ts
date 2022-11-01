import { effect, getScheduler, observable, root } from '@maverick-js/observables';
import { $$_create_element, $$_next_element } from '../runtime/dom/internal';
import { hydrate, hydration, render, setAttribute, setStyle, type SubjectRecord } from '../runtime';
import { run, runAll } from '../utils/fn';
import { camelToKebabCase } from '../utils/str';

import { isBoolean, isFunction, noop } from '../utils/unit';
import { setupElementProps } from './define-element';
import { DOMEvent } from './event';
import {
  CONNECT,
  MOUNT,
  BEFORE_UPDATE,
  AFTER_UPDATE,
  DISCONNECT,
  DESTROY,
  LIFECYCLES,
} from './internal';
import type { ElementLifecycleManager, ElementLifecycleCallback } from './lifecycle';
import type {
  ElementPropRecord,
  ElementEventRecord,
  ElementCSSVarRecord,
  ElementMembers,
  ElementPropDefinitions,
  ElementDefinition,
  ElementSetupContext,
  MaverickHost,
  MaverickElement,
  MaverickElementConstructor,
} from './types';

const MAVERICK = Symbol('MAVERICK');

export function createHTMLElement<
  Props extends ElementPropRecord,
  Events extends ElementEventRecord = ElementEventRecord,
  CSSVars extends ElementCSSVarRecord = ElementCSSVarRecord,
  Members extends ElementMembers = ElementMembers,
>(
  definition: ElementDefinition<Props, Events, CSSVars, Members>,
): MaverickElementConstructor<Props, Events, CSSVars, Members> {
  if (__SERVER__) {
    throw Error(
      '[maverick] `createHTMLElement` was called outside of browser - use `createServerElement`',
    );
  }

  const propDefs = (definition.props ?? {}) as ElementPropDefinitions<Props>;

  class MaverickElement
    extends HTMLElement
    implements MaverickHost<Props, CSSVars>, ElementLifecycleManager
  {
    /** attr name to prop name map */
    private static _attrMap = new Map<string, string>();
    /** prop name to attr name map */
    private static _propMap = new Map<string, string>();
    /** events that were dispatched by this element. */
    private static _events = new Set<string>();
    /** prop names that should reflect changes to respective attr */
    private static _reflectedProps = new Set<string>();

    static get $definition() {
      return definition;
    }

    /** @internal */
    [MAVERICK] = true;
    /** @internal */
    [CONNECT]: ElementLifecycleCallback[] = [];
    /** @internal */
    [MOUNT]: ElementLifecycleCallback[] = [];
    /** @internal */
    [BEFORE_UPDATE]: ElementLifecycleCallback[] = [];
    /** @internal */
    [AFTER_UPDATE]: ElementLifecycleCallback[] = [];
    /** @internal */
    [DISCONNECT]: ElementLifecycleCallback[] = [];
    /** @internal */
    [DESTROY]: ElementLifecycleCallback[] = [];

    private _root?: Node;
    private _setup = false;
    private _destroyed = false;
    private _props: SubjectRecord = {};
    private _onEventDispatch?: (eventType: string) => void;

    private _scheduler = getScheduler();
    private _children = observable(false);
    private _connected = observable(false);
    private _mounted = observable(false);
    private _el = observable<MaverickElement | null>(null);

    private get _hydrate() {
      return this.hasAttribute('data-hydrate');
    }

    private get _delegate() {
      return this.hasAttribute('data-delegate');
    }

    $keepAlive = false;

    get $tagName() {
      return definition.tagName;
    }

    get $$props() {
      return this._props as any;
    }

    get $children() {
      return this._children();
    }

    get $connected() {
      return this._connected();
    }

    get $mounted() {
      return this._mounted();
    }

    get $el() {
      return this._el() as any;
    }

    static get observedAttributes() {
      this._resolveAttrs();
      return Array.from(this._attrMap.keys());
    }

    private static _resolvedAttrs = false;
    private static _resolveAttrs() {
      if (this._resolvedAttrs) return;

      for (const propName of Object.keys(propDefs)) {
        const def = propDefs[propName];
        const attr = def.attribute;
        if (attr !== false) {
          const attrName = attr ?? camelToKebabCase(propName);
          this._attrMap.set(attrName, propName);
          this._propMap.set(propName, attrName);
          if (def.reflect) this._reflectedProps.add(propName);
        }
      }

      this._resolvedAttrs = true;
    }

    attributeChangedCallback(name, _, newValue) {
      if (!this._setup) return;
      const ctor = this.constructor as typeof MaverickElement;
      const propName = ctor._attrMap.get(name)!;
      const from = propDefs[propName]?.converter?.from;
      if (from) this._props[propName]?.set(from(newValue));
    }

    connectedCallback() {
      if (!this._delegate && !this._setup) this.$setup();

      // Could be called once element is no longer connected.
      if (!this._setup || !this.isConnected || this._connected()) return;

      if (this._destroyed) {
        if (__DEV__) {
          throw Error('[maverick] attempting to connect an element that has been destroyed');
        }

        return;
      }

      this._connected.set(true);

      this[DISCONNECT].push(
        ...(this[CONNECT].map(run).filter(isFunction) as ElementLifecycleCallback[]),
      );

      if (!this._mounted()) {
        this._mounted.set(true);

        this[DESTROY].push(
          ...(this[MOUNT].map(run).filter(isFunction) as ElementLifecycleCallback[]),
        );

        this[MOUNT] = [];

        this._scheduler.flushSync();
        this[DESTROY].push(this._scheduler.onBeforeFlush(() => runAll(this[BEFORE_UPDATE])));
        this[DESTROY].push(this._scheduler.onFlush(() => runAll(this[AFTER_UPDATE])));
      }
    }

    disconnectedCallback() {
      if (!this._connected() || this._destroyed) return;

      this._connected.set(false);

      runAll(this[DISCONNECT]);
      this[DISCONNECT] = [];

      if (!this.$keepAlive) {
        requestAnimationFrame(() => {
          if (!this.isConnected) this.$destroy();
        });
      }
    }

    $setup(ctx: ElementSetupContext<Props, CSSVars> = {}): () => void {
      if (this._setup || this._destroyed) return noop;
      if (this._delegate) this.$keepAlive = true;

      const ctor = this.constructor as typeof MaverickElement;

      this._root = definition.shadowRoot
        ? this.shadowRoot ??
          this.attachShadow(
            isBoolean(definition.shadowRoot) ? { mode: 'open' } : definition.shadowRoot,
          )
        : resolveShadowRootElement(this);

      const members = root((dispose) => {
        const { $$props, $$setupProps } = setupElementProps(propDefs);
        this._props = $$props;

        ctor._resolveAttrs();
        for (const attrName of ctor._attrMap.keys()) {
          if (this.hasAttribute(attrName)) {
            const propName = ctor._attrMap.get(attrName)!;
            const from = propDefs[propName].converter?.from;
            if (from) {
              const attrValue = this.getAttribute(attrName);
              this._props[propName]?.set(from(attrValue));
            }
          }
        }

        if (ctx.props) {
          for (const prop of Object.keys(ctx.props)) {
            $$props[prop]?.set(ctx.props[prop]);
          }
        }

        if (definition.cssvars) {
          const vars = isFunction(definition.cssvars)
            ? definition.cssvars($$setupProps)
            : definition.cssvars;
          for (const name of Object.keys(vars)) setStyle(this, `--${name}`, vars[name]);
        }

        if (ctx.children) {
          this._children = ctx.children as any;
        } else {
          const onMutation = () => this._children.set(this.childNodes.length > 1);
          onMutation();
          const observer = new MutationObserver(() => this._scheduler.enqueue(onMutation));
          observer.observe(this, { childList: true });
          this[DESTROY].push(() => observer.disconnect());
        }

        const dispatch = (type, init) =>
          this.dispatchEvent(
            new DOMEvent(type, {
              ...definition.events?.[type],
              ...(init?.detail ? init : { detail: init }),
            }),
          );

        const members = definition.setup({
          host: this as any,
          props: $$setupProps,
          context: ctx.context,
          dispatch,
        });

        this[DESTROY].push(dispose);
        return members;
      });

      // User might've destroy component in setup.
      if (this._destroyed) return noop;

      Object.defineProperties(this, Object.getOwnPropertyDescriptors(members));
      this._reflectProps();

      if (ctx.onEventDispatch) {
        for (const eventType of ctor._events) ctx.onEventDispatch(eventType);
        this._onEventDispatch = ctx.onEventDispatch;
      }

      const renderer = this._hydrate ? hydrate : render;
      this[DESTROY].push(
        renderer(() => members.$render, {
          target: this._root,
          resume: !definition.shadowRoot,
        }),
      );

      this._scheduler.flushSync();

      this._setup = true;
      this._el.set(this);
      this.connectedCallback();
      return () => this.$destroy();
    }

    $destroy() {
      if (this._destroyed) return;

      this._mounted.set(false);

      this.remove();
      runAll(this[DESTROY]);
      this._scheduler.flushSync();

      this._props = {};
      for (const name of LIFECYCLES) this[name] = [];
      if (this._root) this._root.textContent = '';
      this._destroyed = true;
    }

    override dispatchEvent(event: Event): boolean {
      const ctor = this.constructor as typeof MaverickElement;

      if (!ctor._events.has(event.type)) {
        this._onEventDispatch?.(event.type);
        ctor._events.add(event.type);
      }

      return super.dispatchEvent(event);
    }

    private _reflectProps() {
      const ctor = this.constructor as typeof MaverickElement;
      for (const propName of ctor._reflectedProps) {
        const attrName = ctor._propMap.get(propName)!;
        const convert = propDefs[propName]!.converter?.to;
        this[DESTROY].push(
          effect(() => {
            const propValue = this._props[propName]();
            const attrValue = convert?.(propValue) ?? propValue + '';
            setAttribute(this, attrName, attrValue);
          }),
        );
      }
    }
  }

  return MaverickElement as any;
}

export function isMaverickElement(node?: Node): node is MaverickElement {
  return !!node?.[MAVERICK];
}

export function defineCustomElement(definition: ElementDefinition<any, any, any, any>) {
  if (__SERVER__) return;
  if (!window.customElements.get(definition.tagName)) {
    window.customElements.define(definition.tagName, createHTMLElement(definition));
  }
}

function resolveShadowRootElement(root: Element) {
  if (hydration) {
    return $$_next_element(hydration.w);
  } else {
    const shadowRoot = $$_create_element('shadow-root');
    root.prepend(shadowRoot);
    return shadowRoot;
  }
}
