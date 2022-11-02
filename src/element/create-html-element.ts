import { effect, getScheduler, observable, root } from '@maverick-js/observables';

import {
  hydrate,
  hydration,
  isDOMElement,
  render,
  setAttribute,
  setStyle,
  type SubjectRecord,
} from '../runtime';
import { $$_create_element } from '../runtime/dom/internal';
import { run, runAll } from '../utils/fn';
import { camelToKebabCase } from '../utils/str';
import { isBoolean, isFunction, noop } from '../utils/unit';
import { adoptCSS } from './css';
import { setupElementProps } from './define-element';
import { DOMEvent } from './event';
import {
  AFTER_UPDATE,
  BEFORE_UPDATE,
  CONNECT,
  DESTROY,
  DISCONNECT,
  LIFECYCLES,
  MOUNT,
} from './internal';
import type { ElementLifecycleCallback, ElementLifecycleManager } from './lifecycle';
import type {
  AnyElementDefinition,
  ElementCSSVarRecord,
  ElementDefinition,
  ElementEventRecord,
  ElementMembers,
  ElementPropDefinitions,
  ElementPropRecord,
  ElementSetupContext,
  MaverickElement,
  MaverickElementConstructor,
  MaverickHost,
} from './types';

const MAVERICK_ELEMENT = Symbol('MAVERICK'),
  scheduler = getScheduler();

export function createHTMLElement<
  Props extends ElementPropRecord,
  Events extends ElementEventRecord,
  CSSVars extends ElementCSSVarRecord,
  Members extends ElementMembers,
>(
  definition: ElementDefinition<Props, Events, CSSVars, Members>,
): MaverickElementConstructor<Props, Events, CSSVars, Members> {
  if (__SERVER__) {
    throw Error(
      '[maverick] `createHTMLElement` was called outside of browser - use `createServerElement`',
    );
  }

  const propDefs = (definition.props ?? {}) as ElementPropDefinitions<Props>;
  const createId = __DEV__ ? (id: string) => ({ id: `${definition.tagName}.${id}` }) : undefined;

  class MaverickElement
    extends HTMLElement
    implements MaverickHost<Props>, ElementLifecycleManager
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
    [MAVERICK_ELEMENT] = true;
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

    private _el = observable<MaverickElement | null>(null);
    private _children = observable(false, createId?.('$children'));
    private _connected = observable(false, createId?.('$connected'));
    private _mounted = observable(false, createId?.('$mounted'));

    private get _hydrate() {
      return this.hasAttribute('mk-hydrate');
    }

    private get _delegate() {
      return this.hasAttribute('mk-delegate');
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
      if (!this._delegate && !this._setup) {
        if (definition.parent) {
          defineCustomElement(definition.parent);
          const parent = this.closest(definition.parent.tagName) as MaverickElement;
          parent.$onMount(() => this.$setup());
        } else {
          this.$setup();
        }
      }

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

        scheduler.flushSync();
        this[DESTROY].push(scheduler.onBeforeFlush(() => runAll(this[BEFORE_UPDATE])));
        this[DESTROY].push(scheduler.onFlush(() => runAll(this[AFTER_UPDATE])));
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

    $setup(ctx: ElementSetupContext<Props> = {}): () => void {
      if (this._setup || this._destroyed) return noop;
      if (this._delegate) this.$keepAlive = true;

      const ctor = this.constructor as typeof MaverickElement;

      this._root = definition.shadowRoot
        ? this.shadowRoot ??
          this.attachShadow(
            isBoolean(definition.shadowRoot) ? { mode: 'open' } : definition.shadowRoot,
          )
        : resolveShadowRootElement(this);

      if (!hydration && definition.shadowRoot && definition.css) {
        adoptCSS(this._root as ShadowRoot, definition.css);
      }

      const renderer = this._hydrate ? hydrate : render;
      this[DESTROY].push(
        renderer(
          () => {
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
              const observer = new MutationObserver(() => scheduler.enqueue(onMutation));
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

            Object.defineProperties(this, Object.getOwnPropertyDescriptors(members));
            this._reflectProps();

            if (ctx.onEventDispatch) {
              for (const eventType of ctor._events) ctx.onEventDispatch(eventType);
              this._onEventDispatch = ctx.onEventDispatch;
            }

            return members.$render;
          },
          {
            target: this._root!,
            resume: !definition.shadowRoot,
          },
        ),
      );

      scheduler.flushSync();

      this._setup = true;
      this._el.set(this);
      this.connectedCallback();

      return () => this.$destroy();
    }

    $destroy() {
      if (this._destroyed) return;

      this._mounted.set(false);
      runAll(this[DESTROY]);
      scheduler.flushSync();

      this._props = {};
      for (const name of LIFECYCLES) this[name] = [];
      this._destroyed = true;

      if (!this._delegate) {
        this.remove();
        if (this._root) this._root.textContent = '';
      }
    }

    $onMount(callback: () => void) {
      if (this._mounted()) {
        callback();
      } else if (!this._destroyed) {
        this[MOUNT].push(callback);
      }
    }

    $onDestroy(callback: () => void) {
      if (this._destroyed) {
        callback();
      } else {
        this[DESTROY].push(callback);
      }
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
          }, createId?.(`reflect.${propName}`)),
        );
      }
    }
  }

  return MaverickElement as any;
}

export function isMaverickElement(node?: Node | null): node is MaverickElement {
  return !!node?.[MAVERICK_ELEMENT];
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
