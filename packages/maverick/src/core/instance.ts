import { setAttribute, setStyle } from '../../../std/src/dom';
import { unwrapDeep } from '../../../std/src/signal';
import { isFunction } from '../../../std/src/unit';
import type { ServerElement } from '../element/server';
import type { ElementAttributesRecord, ElementStylesRecord } from '../element/types';
import type { Component, ComponentConstructor } from './component';
import { provideContext } from './context';
import { createScope, effect, onDispose } from './signals';
import { type Scope, scoped, signal } from './signals';
import { ON_DISPATCH } from './symbols';
import type { WriteSignalRecord } from './types';

export interface SetupCallback {
  (): void;
}

export interface ElementCallback {
  (el: HTMLElement): any;
}

export interface LifecycleHooks {
  onSetup?(): void;
  onAttach?(el: HTMLElement): void;
  onConnect?(el: HTMLElement): void;
  onDestroy?(el: HTMLElement): void;
}

export interface InstanceInit<Props = {}> {
  scope?: Scope | null;
  props?: Readonly<Partial<Props>> | null;
}

const EMPTY_PROPS = {} as any;

export interface AnyInstance extends Instance<any, any, any, any> {}

export class Instance<Props = {}, State = {}, Events = {}, CSSVars = {}> {
  /** @internal type only */
  $ts__events?: Events;
  /** @internal type only */
  $ts__vars?: CSSVars;

  /* @internal */
  [ON_DISPATCH]?: ((event: Event) => void) | null = null;

  readonly $el = signal<HTMLElement | null>(null);

  el: HTMLElement | null = null;
  scope: Scope | null = null;
  attachScope: Scope | null = null;
  connectScope: Scope | null = null;
  component: Component | null = null;
  destroyed = false;

  props: WriteSignalRecord<Props> = EMPTY_PROPS;
  attrs: ElementAttributesRecord | null = null;
  styles: ElementStylesRecord | null = null;

  state!: Readonly<State>;
  $state!: any;

  #setupCallbacks: SetupCallback[] = [];
  #attachCallbacks: ElementCallback[] = [];
  #connectCallbacks: ElementCallback[] = [];
  #destroyCallbacks: ElementCallback[] = [];

  constructor(
    Component: ComponentConstructor<Component<Props, State, any, any>>,
    scope: Scope,
    init?: InstanceInit<Props>,
  ) {
    this.scope = scope;
    if (init?.scope) init.scope.append(scope);

    let stateFactory = Component.state,
      props = Component.props;

    if (stateFactory) {
      this.$state = stateFactory.create();
      this.state = new Proxy(this.$state, {
        get: (_, prop: string) => this.$state[prop](),
      }) as State;
      provideContext(stateFactory, this.$state);
    }

    if (props) {
      this.props = createInstanceProps(props) as WriteSignalRecord<Props>;
      if (init?.props) {
        for (const prop of Object.keys(init.props)) {
          this.props[prop]?.set(init.props[prop]);
        }
      }
    }

    onDispose(this.destroy.bind(this));
  }

  setup() {
    scoped(() => {
      for (const callback of this.#setupCallbacks) callback();
    }, this.scope);
  }

  attach(el: HTMLElement | ServerElement) {
    if (this.el) return;

    this.el = el as HTMLElement;
    this.$el.set(el as HTMLElement);

    if (__DEV__) {
      (el as any).$$COMPONENT_NAME = this.component?.constructor.name;
    }

    scoped(() => {
      this.attachScope = createScope();
      scoped(() => {
        for (const callback of this.#attachCallbacks) callback(this.el!);
        this.#attachAttrs();
        this.#attachStyles();
      }, this.attachScope);
    }, this.scope);

    el.dispatchEvent(new Event('attached'));
  }

  detach() {
    this.attachScope?.dispose();
    this.attachScope = null;
    this.connectScope = null;

    if (__DEV__ && this.el) {
      (this.el as any).$$COMPONENT_NAME = null;
    }

    this.el = null;
    this.$el.set(null);
  }

  connect() {
    if (!this.el || !this.attachScope || !this.#connectCallbacks.length) return;
    scoped(() => {
      this.connectScope = createScope();
      scoped(() => {
        for (const callback of this.#connectCallbacks) callback(this.el!);
      }, this.connectScope);
    }, this.attachScope);
  }

  disconnect() {
    this.connectScope?.dispose();
    this.connectScope = null;
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;

    scoped(() => {
      for (const callback of this.#destroyCallbacks) callback(this.el!);
    }, this.scope);

    const el = this.el;

    this.detach();
    this.scope!.dispose();

    this.#setupCallbacks.length = 0;
    this.#attachCallbacks.length = 0;
    this.#connectCallbacks.length = 0;
    this.#destroyCallbacks.length = 0;

    this.component = null;
    this.attrs = null;
    this.styles = null;
    this.props = EMPTY_PROPS;
    this.scope = null;
    this.state = EMPTY_PROPS;
    this.$state = null;
    // @ts-expect-error
    if (el) delete el.$;
  }

  addHooks(target: LifecycleHooks) {
    if (target.onSetup) this.#setupCallbacks.push(target.onSetup.bind(target));
    if (target.onAttach) this.#attachCallbacks.push(target.onAttach.bind(target));
    if (target.onConnect) this.#connectCallbacks.push(target.onConnect.bind(target));
    if (target.onDestroy) this.#destroyCallbacks.push(target.onDestroy.bind(target));
  }

  #attachAttrs() {
    if (!this.attrs) return;
    for (const name of Object.keys(this.attrs)) {
      if (__SERVER__) {
        setAttribute(this.el!, name, unwrapDeep.call(this.component, this.attrs[name]));
      } else if (isFunction(this.attrs[name])) {
        effect(this.#setAttr.bind(this, name));
      } else {
        setAttribute(this.el!, name, this.attrs[name]);
      }
    }
  }

  #attachStyles() {
    if (!this.styles) return;
    for (const name of Object.keys(this.styles)) {
      if (__SERVER__) {
        setStyle(this.el!, name, unwrapDeep.call(this.component, this.styles[name]));
      } else if (isFunction(this.styles[name])) {
        effect(this.#setStyle.bind(this, name));
      } else {
        setStyle(this.el!, name, this.styles[name]);
      }
    }
  }

  #setAttr(name: string) {
    setAttribute(this.el!, name, (this.attrs![name] as Function).call(this.component));
  }

  #setStyle(name: string) {
    setStyle(this.el!, name, (this.styles![name] as Function).call(this.component));
  }
}

function createInstanceProps<Props>(props: Props) {
  const $props = {} as WriteSignalRecord<Props>;

  for (const name of Object.keys(props as Record<string, any>)) {
    const def = props[name];
    $props[name] = signal(def, def);
  }

  return $props;
}
