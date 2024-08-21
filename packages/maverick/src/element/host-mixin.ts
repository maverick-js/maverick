import { camelToKebabCase, DOMEvent, isArray, isString, runAll } from '@maverick-js/std';
import type { Constructor } from 'type-fest';

import {
  type AnyComponent,
  type Component,
  type ComponentConstructor,
  createComponent,
  type Dispose,
  type HostElementCallback,
  type InferComponentEvents,
  type InferComponentMembers,
  type InferComponentProps,
  type InferComponentState,
  type Maybe,
  ON_DISPATCH,
  type ReadSignalRecord,
  type Scope,
  scoped,
  type Store,
} from '../core';
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
  class MaverickElement extends Super implements HostElement<R> {
    static attrs?: Attributes<InferComponentProps<R>>;

    private static [ATTRS]: Map<
      string,
      { prop: string; converter: AttributeConverter<any> }
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
            prop: propName,
            converter:
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
    [SETUP_CALLBACKS]: HostElementCallback[] | null = null;

    keepAlive = false;
    forwardKeepAlive = true;

    get scope(): Scope {
      return this.$.$$.scope!;
    }

    get attachScope(): Scope | null {
      return this.$.$$.attachScope;
    }

    get connectScope(): Scope | null {
      return this.$.$$.connectScope;
    }

    get $props() {
      return this.$.$$.props as any;
    }

    get $state() {
      return this.$.$$.$state as any;
    }

    get state() {
      return this.$.state as any;
    }

    constructor(...args: any[]) {
      super(...args);

      this.$ = scoped(() => createComponent(Component), null)!;
      this.$.$$.addHooks(this as any);

      this.$.$$[ON_DISPATCH] = this.#dispatch.bind(this);

      // Properties might be assigned before element is registered. We need to assign them
      // to the internal prop signals and delete from proto chain.
      if (Component.props) {
        const props = this.$props,
          descriptors = Object.getOwnPropertyDescriptors(this);
        for (const prop of Object.keys(descriptors)) {
          if (prop in Component.props) {
            props[prop].set(this[prop]);
            delete this[prop];
          }
        }
      }
    }

    attributeChangedCallback(name, _, newValue) {
      const Ctor = this.constructor as typeof MaverickElement;

      if (!Ctor[ATTRS]) {
        // @ts-expect-error
        super.attributeChangedCallback?.(name, _, newValue);
        return;
      }

      const def = Ctor[ATTRS].get(name);
      if (def) this[def.prop] = (def.converter as AttributeConverter)(newValue);
    }

    connectedCallback() {
      const instance = this.$?.$$;
      if (!instance || instance.destroyed) return;

      if (this[SETUP_STATE] !== SetupState.Ready) {
        setup.call(this);
        return;
      }

      // Could be called once element is no longer connected.
      if (!this.isConnected) return;

      if (this.hasAttribute('keep-alive')) {
        this.keepAlive = true;
      }

      instance.connect();

      if (isArray(this[SETUP_CALLBACKS])) runAll(this[SETUP_CALLBACKS], this);
      this[SETUP_CALLBACKS] = null;

      // @ts-expect-error
      const callback = super.connectedCallback;
      if (callback) scoped(() => callback.call(this), this.connectScope);

      return;
    }

    disconnectedCallback() {
      const instance = this.$?.$$;
      if (!instance || instance.destroyed) return;

      instance.disconnect();

      // @ts-expect-error
      const callback = super.disconnectedCallback;
      if (callback) callback.call(this);

      if (!this.keepAlive && !this.hasAttribute('keep-alive')) {
        setTimeout(() => {
          requestAnimationFrame(() => {
            if (!this.isConnected) instance.destroy();
          });
        }, 0);
      }
    }

    [SETUP]() {
      const instance = this.$.$$,
        Ctor = this.constructor as typeof MaverickElement;

      if (__DEV__ && instance.destroyed) {
        console.warn(`[maverick] attempted attaching to destroyed element \`${this.tagName}\``);
      }

      if (instance.destroyed) return;

      const attrs = Ctor[ATTRS];
      if (attrs) {
        for (const attr of this.attributes) {
          let def = attrs.get(attr.name);
          if (def && def.converter) {
            instance.props[def.prop].set(def.converter(this.getAttribute(attr.name)));
          }
        }
      }

      instance.setup();
      instance.attach(this);
      this[SETUP_STATE] = SetupState.Ready;

      this.connectedCallback();
    }

    // @ts-expect-error
    subscribe(callback: (state: any) => void) {
      return this.$.subscribe(callback);
    }

    #dispatch(event: Event) {
      this.dispatchEvent(
        new DOMEvent<any>(event.type, {
          ...event,
          trigger: event,
        }),
      );
    }

    destroy() {
      this.disconnectedCallback();
      this.$.$$[ON_DISPATCH] = null;
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
  InferComponentMembers<R> &
  HostElement<R> & {
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
   * host elements will also be kept alive and the instance will need to be manually destroyed. Do
   * note, this can be prevented by setting `forwardKeepAlive` to ``false`.
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

  /**
   * If this is `false`, children will _not_ adopt the `keepAlive` state of this element.
   *
   * @defaultValue true
   */
  forwardKeepAlive: boolean;

  /** Component instance. */
  readonly $: T;

  readonly scope: Scope;
  readonly attachScope: Scope | null;
  readonly connectScope: Scope | null;

  /** @internal */
  readonly $props: ReadSignalRecord<InferComponentProps<T>>;

  /** @internal */
  readonly $state: Store<InferComponentState<T>>;

  /**
   * This object contains the state of the component.
   *
   * ```ts
   * const el = document.querySelector('foo-el');
   * el.state.foo;
   * ```
   */
  readonly state: InferComponentState<T> extends Record<string, never>
    ? never
    : Readonly<InferComponentState<T>>;

  /**
   * Enables subscribing to live updates of component state.
   *
   * @example
   * ```ts
   * const el = document.querySelector('foo-el');
   * el.subscribe(({ foo, bar }) => {
   *   // Re-run when the value of foo or bar changes.
   * });
   * ```
   */
  subscribe: InferComponentState<T> extends Record<string, never>
    ? never
    : (callback: (state: Readonly<InferComponentState<T>>) => Maybe<Dispose>) => Dispose;

  /**
   * Destroys the underlying component instance.
   */
  destroy(): void;
}

export type InferElementComponent<T> =
  T extends MaverickElement<infer Component> ? Component : never;

function extendProto(Element: Constructor<HTMLElement>, Component: ComponentConstructor) {
  const ElementProto = Element.prototype;

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
    if (parent.keepAlive && parent.forwardKeepAlive) {
      this.keepAlive = true;
      this.setAttribute('keep-alive', '');
    }

    const scope = this.$.$$.scope;
    if (scope) parent.$.$$.attachScope!.append(scope);
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
