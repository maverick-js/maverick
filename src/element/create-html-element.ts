import { effect, getScheduler, observable, root } from '@maverick-js/observables';
import { hydrate, render, setAttribute, type JSX, type SubjectRecord } from '../runtime';
import { raf } from '../utils/animation';
import { run, runAll } from '../utils/fn';
import { camelToKebabCase } from '../utils/str';

import { isBoolean, isFunction, noop } from '../utils/unit';
import { createSetupProps } from './define-element';
import { MaverickEvent } from './event';
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
  ElementProps,
  ElementMembers,
  ElementPropDefinitions,
  MaverickElementConstructor,
  ElementDefinition,
  ElementSetupContext,
  MaverickHost,
  MaverickElement,
} from './types';

export function defineCustomElement(definition: ElementDefinition) {
  if (__NODE__) return;
  if (!window.customElements.get(definition.tagName)) {
    window.customElements.define(definition.tagName, createHTMLElement(definition));
  }
}

const MAVERICK_ELEMENT = Symbol('MAVERICK');

export function isMaverickElement(node?: Node): node is MaverickElement {
  return !!node?.[MAVERICK_ELEMENT];
}

export function createHTMLElement<
  Props extends ElementProps,
  Events = JSX.GlobalOnAttributes,
  Members extends ElementMembers = ElementMembers,
>(
  definition: ElementDefinition<Props, Events, Members>,
): MaverickElementConstructor<Props, Events, Members> {
  if (__NODE__) {
    throw Error(
      '[maverick] `createHTMLElement` was called outside of browser - use `createSSRElement`',
    );
  }

  const propDefs: ElementPropDefinitions<Props> = definition.props ?? ({} as any);

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
    private _children = observable(false);
    private _connected = observable(false);
    private _mounted = observable(false);
    private _props: SubjectRecord = {};
    private _onEventDispatch?: (eventType: string) => void;

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
      const from = propDefs[propName]?.transform?.from;
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

        const scheduler = getScheduler();
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
        raf(() => {
          if (!this.isConnected) this.$destroy();
        });
      }
    }

    $setup({
      props,
      context,
      children,
      onEventDispatch,
    }: ElementSetupContext<Props> = {}): () => void {
      if (this._setup || this._destroyed) return noop;
      if (this._delegate) this.$keepAlive = true;

      const ctor = this.constructor as typeof MaverickElement;

      const members = root((dispose) => {
        const { $props, $setupProps } = createSetupProps(propDefs, props);

        this._props = $props;

        ctor._resolveAttrs();
        for (const attrName of ctor._attrMap.keys()) {
          if (this.hasAttribute(attrName)) {
            const propName = ctor._attrMap.get(attrName)!;
            const from = propDefs[propName].transform?.from;
            if (from) {
              const attrValue = this.getAttribute(attrName);
              this._props[propName]?.set(from(attrValue));
            }
          }
        }

        if (children) {
          this._children = children;
        } else {
          const onMutation = () => {
            const noChildren =
              (!this.firstChild || this.firstChild.nodeType === 8) &&
              (!this.lastChild || this.lastChild.nodeType === 8);
            this._children.set(!noChildren);
          };

          onMutation();
          const observer = new MutationObserver(onMutation);
          observer.observe(this, { childList: true });
          this[DESTROY].push(() => observer.disconnect());
        }

        const dispatch: any = (type, init) =>
          this.dispatchEvent(type instanceof Event ? type : new MaverickEvent(type, init));

        const members = definition.setup({
          host: this as any,
          props: $setupProps,
          context,
          dispatch,
          ssr: false,
        });

        this[DESTROY].push(dispose);
        return members;
      });

      // User might've destroy component in setup.
      if (this._destroyed) return noop;

      this._root = definition.shadow
        ? this.attachShadow(isBoolean(definition.shadow) ? { mode: 'open' } : definition.shadow)
        : this;

      Object.defineProperties(this, Object.getOwnPropertyDescriptors(members));
      this._reflectProps();

      if (onEventDispatch) {
        for (const eventType of ctor._events) onEventDispatch(eventType);
        this._onEventDispatch = onEventDispatch;
      }

      let before: Node | undefined;
      if (!this._hydrate) {
        this.append(document.createComment('#internal'));
        before = document.createComment('/#internal');
        this.append(before);
      }

      const renderer = this._hydrate ? hydrate : render;
      this[DESTROY].push(renderer(members.$render, { target: this._root, before }));
      getScheduler().flushSync();

      this._setup = true;
      this.connectedCallback();
      return () => this.$destroy();
    }

    $destroy() {
      if (this._destroyed) return;

      this._mounted.set(false);

      this.remove();
      runAll(this[DESTROY]);
      getScheduler().flushSync();

      this._props = {};
      for (const name of LIFECYCLES) this[name] = [];
      if (this._root) this._root.textContent = '';
      this._destroyed = true;
    }

    override dispatchEvent(event: Event): boolean {
      const ctor = this.constructor as typeof MaverickElement;
      if (event.type.includes('-') && !ctor._events.has(event.type)) {
        this._onEventDispatch?.(event.type);
        ctor._events.add(event.type);
      }

      return super.dispatchEvent(event);
    }

    private _reflectProps() {
      const ctor = this.constructor as typeof MaverickElement;
      for (const propName of ctor._reflectedProps) {
        const attrName = ctor._propMap.get(propName)!;
        const transform = propDefs[propName]!.transform?.to;
        this[DESTROY].push(
          effect(() => {
            const propValue = this._props[propName]();
            const attrValue = transform?.(propValue) ?? propValue + '';
            setAttribute(this, attrName, attrValue);
          }),
        );
      }
    }
  }

  return MaverickElement as any;
}
