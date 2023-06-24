import type { Constructor } from 'type-fest';

import type {
  AnyComponent,
  Component,
  ComponentConstructor,
  InferComponentEvents,
  InferComponentMembers,
  InferComponentProps,
  InferComponentState,
} from '../core/component';
import { createComponent } from '../core/controller';
import type { LifecycleCallback } from '../core/instance';
import { type Dispose, type Maybe } from '../core/signals';
import type { InferStoreRecord, Store, StoreFactory } from '../core/store';
import { METHODS, PROPS } from '../core/symbols';
import type { ReadSignalRecord } from '../core/types';
import { runAll } from '../std/fn';
import { camelToKebabCase } from '../std/string';
import { isArray, isString } from '../std/unit';
import { type AttributeConverter, type Attributes, inferAttributeConverter } from './attrs';
import { ATTRS, SETUP, SETUP_CALLBACKS, SETUP_STATE } from './symbols';

const enum SetupState {
  Idle = 0,
  Pending = 1,
  Ready = 2,
}

export function Host<T extends HTMLElement, R extends Component>(
  Super: Constructor<T>,
  Component: ComponentConstructor<R>,
) {
  // @ts-expect-error
  class MaverickElement extends Super implements HostElement<R>, HostElement<R> {
    static attrs?: Attributes<InferComponentProps<R>>;

    private static [ATTRS]: Map<
      string,
      { _prop: string; _converter: AttributeConverter<any> }
    > | null = null;

    static get observedAttributes(): string[] {
      if (!this[ATTRS] && Component.props) {
        const map = new Map();

        for (const propName of Object.keys(Component.props)) {
          let attr = this.attrs?.[propName],
            attrName = isString(attr) ? attr : !attr ? attr : attr?.attr;

          if (attrName === false) continue;
          if (!attrName) attrName = camelToKebabCase(propName);

          map.set(attrName, {
            _prop: propName,
            _converter:
              (attr && !isString(attr) && attr?.converter) ||
              inferAttributeConverter(Component.props[propName]),
          });
        }

        this[ATTRS] = map;
      }

      return this[ATTRS] ? Array.from(this[ATTRS].keys()) : [];
    }

    readonly $: R;
    [SETUP_STATE] = SetupState.Idle;
    [SETUP_CALLBACKS]: LifecycleCallback[] | null = null;

    keepAlive = false;

    get $props() {
      return this.$.$$._props as any;
    }

    get $state() {
      return this.$.$$._$state as any;
    }

    get state() {
      return this.$.state as any;
    }

    constructor(...args: any[]) {
      super(...args);
      this.$ = createComponent(Component);
      this.$.$$._addHooks(this as any);
    }

    attributeChangedCallback(name, _, newValue) {
      const Ctor = this.constructor as typeof MaverickElement;

      if (!Ctor[ATTRS]) {
        // @ts-expect-error
        super.attributeChangedCallback?.(name, _, newValue);
        return;
      }

      const def = Ctor[ATTRS].get(name);
      if (def) this[def._prop] = (def._converter as AttributeConverter)(newValue);
    }

    connectedCallback() {
      const instance = this.$.$$;
      if (instance._destroyed) return;

      if (this[SETUP_STATE] !== SetupState.Ready) {
        setup.call(this);
        return;
      }

      // Could be called once element is no longer connected.
      if (!this.isConnected) return;

      if (this.hasAttribute('keep-alive')) {
        this.keepAlive = true;
      }

      instance._connect();

      if (isArray(this[SETUP_CALLBACKS])) runAll(this[SETUP_CALLBACKS], this);
      this[SETUP_CALLBACKS] = null;

      // @ts-expect-error
      const callback = super.connectedCallback;
      if (callback) callback.call(this);

      return;
    }

    disconnectedCallback() {
      const instance = this.$.$$;
      if (instance._destroyed) return;

      instance._disconnect();

      // @ts-expect-error
      const callback = super.disconnectedCallback;
      if (callback) callback.call(this);

      if (!this.keepAlive && !this.hasAttribute('keep-alive')) {
        requestAnimationFrame(() => {
          if (!this.isConnected) instance._destroy();
        });
      }
    }

    [SETUP]() {
      const instance = this.$.$$,
        Ctor = this.constructor as typeof MaverickElement;

      if (__DEV__ && instance._destroyed) {
        console.warn(`[maverick] attempted attaching to destroyed element \`${this.tagName}\``);
      }

      if (instance._destroyed) return;

      const attrs = Ctor[ATTRS];
      if (attrs) {
        for (const attr of this.attributes) {
          let def = attrs.get(attr.name);
          if (def && def._converter) {
            instance._props[def._prop].set(def._converter(this.getAttribute(attr.name)));
          }
        }
      }

      instance._attach(this);
      this[SETUP_STATE] = SetupState.Ready;

      this.connectedCallback();
    }

    // @ts-expect-error
    subscribe(callback: (state: any) => void) {
      return this.$.subscribe(callback);
    }

    destroy() {
      this.disconnectedCallback();
      this.$.destroy();
    }
  }

  extendProto(MaverickElement, Component);
  return MaverickElement as unknown as MaverickElementConstructor<T, R>;
}

export interface MaverickElementConstructor<
  T extends HTMLElement = HTMLElement,
  R extends Component = AnyComponent,
> {
  readonly observedAttributes: string[];
  readonly attrs?: Attributes<InferComponentProps<R>>;
  new (): MaverickElement<T, R>;
}

export type MaverickElement<
  T extends HTMLElement = HTMLElement,
  R extends Component = AnyComponent,
  E = InferComponentEvents<R>,
> = Omit<T, 'addEventListener' | 'removeEventListener'> &
  HostElement<R> &
  InferComponentMembers<R> & {
    addEventListener<K extends keyof E>(
      type: K,
      listener: (this: T, ev: E[K]) => any,
      options?: boolean | AddEventListenerOptions,
    ): void;
    addEventListener<K extends keyof HTMLElementEventMap>(
      type: K,
      listener: (this: T, ev: HTMLElementEventMap[K]) => any,
      options?: boolean | AddEventListenerOptions,
    ): void;
    addEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ): void;
    removeEventListener<K extends keyof E>(
      type: K,
      listener: (this: T, ev: E[K]) => any,
      options?: boolean | EventListenerOptions,
    ): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(
      type: K,
      listener: (this: T, ev: HTMLElementEventMap[K]) => any,
      options?: boolean | EventListenerOptions,
    ): void;
    removeEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | EventListenerOptions,
    ): void;
  };

export interface HostElement<T extends Component = AnyComponent> {
  /**
   * Whether this component should be kept-alive on DOM disconnection. If `true`, all child
   * host elements will also be kept alive and the instance will need to be manually destroyed.
   *
   * Important to note that if a parent element is kept alive, calling destroy will also destroy
   * all child element instances.
   *
   * ```ts
   * // Destroy this component and all children.
   * element.destroy();
   * ```
   */
  keepAlive: boolean;

  /** Component instance. */
  readonly $: T;

  /** @internal */
  readonly $props: ReadSignalRecord<InferComponentProps<T>>;

  /** @internal */
  readonly $state: Store<InferComponentState<T>>;

  /** @internal */
  onAttach?(): void;
  /** @internal */
  onConnect?(): void;
  /** @internal */
  onDestroy?(): void;

  /**
   * This object contains the state of the component store when available.
   *
   * ```ts
   * const el = document.querySelector('foo-el');
   * el.state.foo;
   * ```
   */
  readonly state: Readonly<InferStoreRecord<InferComponentState<T>>>;

  /**
   * Enables subscribing to live updates of component store state.
   *
   * @example
   * ```ts
   * const el = document.querySelector('foo-el');
   * el.subscribe(({ foo, bar }) => {
   *   // Re-run when the value of foo or bar changes.
   * });
   * ```
   */
  subscribe: InferComponentState<T> extends StoreFactory<infer Record>
    ? (callback: (state: Readonly<Record>) => Maybe<Dispose>) => Dispose
    : never;

  /**
   * Destroys the underlying component instance.
   */
  destroy(): void;
}

export type InferElementComponent<T> = T extends MaverickElement<infer Component>
  ? Component
  : never;

function extendProto(Element: Constructor<HTMLElement>, Component: ComponentConstructor) {
  const ElementProto = Element.prototype,
    ComponentProto = Component.prototype;

  if (Component.props) {
    for (const prop of Object.keys(Component.props)) {
      Object.defineProperty(ElementProto, prop, {
        enumerable: true,
        configurable: true,
        get(this) {
          return this.$props[prop]();
        },
        set(this, value) {
          this.$props[prop].set(value);
        },
      });
    }
  }

  if (ComponentProto[PROPS]) {
    for (const name of ComponentProto[PROPS]) {
      Object.defineProperty(ElementProto, name, {
        enumerable: true,
        configurable: true,
        get(this) {
          return this.$[name];
        },
        set(this, value) {
          this.$[name] = value;
        },
      });
    }
  }

  if (ComponentProto[METHODS]) {
    for (const name of ComponentProto[METHODS]) {
      ElementProto[name] = function (this, ...args) {
        return this.$[name](...args);
      };
    }
  }
}

function setup(this: HostElement & HTMLElement) {
  if (this[SETUP_STATE] !== SetupState.Idle) return;
  this[SETUP_STATE] = SetupState.Pending;

  const parent = findParent(this),
    isParentRegistered = parent && window.customElements.get(parent.localName),
    isParentSetup = parent && parent[SETUP_STATE] === SetupState.Ready;

  if (parent && (!isParentRegistered || !isParentSetup)) {
    waitForParent.call(this, parent);
    return;
  }

  attach.call(this, parent);
}

async function waitForParent(this: HostElement & HTMLElement, parent: HostElement & HTMLElement) {
  await window.customElements.whenDefined(parent.localName);

  if (parent[SETUP_STATE] !== SetupState.Ready) {
    await new Promise((res) => (parent[SETUP_CALLBACKS] ??= []).push(res));
  }

  attach.call(this, parent);
}

function attach(this: HostElement & HTMLElement, parent: HostElement | null) {
  // Skip setting up if we disconnected while waiting for parent to connect.
  if (!this.isConnected) return;

  if (parent) {
    if (parent.keepAlive) {
      this.keepAlive = true;
      this.setAttribute('keep-alive', '');
    }

    parent.$.$$._attachScope!.append(this.$.$$._scope);
  }

  this[SETUP]();
}

function findParent(host: HTMLElement) {
  let node: Node | null = host.parentNode,
    prefix = host.localName.split('-', 1)[0] + '-';

  while (node) {
    if (node.nodeType === 1 && (node as Element).localName.startsWith(prefix)) {
      return node as HostElement & HTMLElement;
    }

    node = node.parentNode;
  }

  return null;
}
