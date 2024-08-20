import { DOMEvent } from '@maverick-js/std';

import type { Component, ComponentConstructor, InferComponentProps } from './component';
import { provideContext } from './context';
import type { HostElementCallback, LifecycleHooks, SetupCallback } from './lifecycle';
import { createScope, getScope, onDispose, root, type Scope, scoped, signal } from './signals';
import { State as StateFactory } from './state';
import { ON_DISPATCH } from './symbols';
import type { WriteSignalRecord } from './types';

export let currentInstance: AnyInstance | null = null;

export interface InstanceInit<Props = {}> {
  scope?: Scope | null;
  props?: Readonly<Partial<Props>> | null;
}

const EMPTY_PROPS = {} as any;

export interface AnyInstance extends Instance<any, any> {}

export class Instance<Props = {}, State = {}> {
  /* @internal */
  [ON_DISPATCH]?: ((event: Event) => void) | null = null;

  readonly $host = signal<HTMLElement | null>(null);

  host: HTMLElement | null = null;
  scope: Scope | null = null;
  attachScope: Scope | null = null;
  connectScope: Scope | null = null;
  component: Component | null = null;
  destroyed = false;

  props: WriteSignalRecord<Props> = EMPTY_PROPS;

  state!: Readonly<State>;
  $state!: any;

  #setupCallbacks: SetupCallback[] = [];
  #attachCallbacks: HostElementCallback[] = [];
  #connectCallbacks: HostElementCallback[] = [];
  #destroyCallbacks: HostElementCallback[] = [];

  constructor(scope: Scope, props: Props, state?: StateFactory<State>, init?: InstanceInit<Props>) {
    this.scope = scope;

    if (init?.scope) init.scope.append(scope);

    if (state) {
      this.$state = state.create();

      this.state = new Proxy(this.$state, {
        get: (_, prop: string) => this.$state[prop](),
      }) as State;

      provideContext(state, this.$state);
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
    currentInstance = this;

    scoped(() => {
      for (const callback of this.#setupCallbacks) callback();
    }, this.scope);

    currentInstance = null;
  }

  attach(host: HTMLElement) {
    if (this.host) return;

    currentInstance = this;

    this.host = host;
    this.$host.set(host);

    if (__DEV__) {
      (host as any).$$COMPONENT_NAME = this.component?.constructor.name;
    }

    scoped(() => {
      this.attachScope = createScope();
      scoped(() => {
        for (const callback of this.#attachCallbacks) callback(this.host!);
      }, this.attachScope);
    }, this.scope);

    this.component?.dispatchEvent(new Event('attach'));

    currentInstance = null;
  }

  detach() {
    this.attachScope?.dispose();
    this.attachScope = null;
    this.connectScope = null;

    if (__DEV__ && this.host) {
      (this.host as any).$$COMPONENT_NAME = null;
    }

    this.component?.dispatch(new DOMEvent<void>('detach'));

    this.host = null;
    this.$host.set(null);
  }

  connect() {
    if (!this.host || !this.attachScope || !this.#connectCallbacks.length) return;

    currentInstance = this;

    scoped(() => {
      this.connectScope = createScope();
      scoped(() => {
        for (const callback of this.#connectCallbacks) callback(this.host!);
      }, this.connectScope);
    }, this.attachScope);

    this.component?.dispatch(new DOMEvent<void>('connect'));

    currentInstance = null;
  }

  disconnect() {
    this.connectScope?.dispose();
    this.connectScope = null;
    this.component?.dispatch(new DOMEvent<void>('disconnect'));
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;

    scoped(() => {
      for (const callback of this.#destroyCallbacks) callback(this.host!);
    }, this.scope);

    const host = this.host;

    this.detach();
    this.scope!.dispose();

    this.#setupCallbacks.length = 0;
    this.#attachCallbacks.length = 0;
    this.#connectCallbacks.length = 0;
    this.#destroyCallbacks.length = 0;

    this.props = EMPTY_PROPS;
    this.scope = null;
    this.state = EMPTY_PROPS;
    this.$state = null;

    // @ts-expect-error
    if (host) delete host.$;

    this.component?.dispatch(new DOMEvent<void>('destroy'));
    this.component = null;
  }

  addHooks(target: LifecycleHooks) {
    if (target.onSetup) this.#setupCallbacks.push(target.onSetup.bind(target));
    if (target.onAttach) this.#attachCallbacks.push(target.onAttach.bind(target));
    if (target.onConnect) this.#connectCallbacks.push(target.onConnect.bind(target));
    if (target.onDestroy) this.#destroyCallbacks.push(target.onDestroy.bind(target));
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

export function createComponent<T extends Component>(
  Component: ComponentConstructor<T>,
  init?: InstanceInit<InferComponentProps<T>>,
) {
  return root(() => {
    currentInstance = new Instance(getScope()!, Component.props, Component.state, init);

    const component = new Component();

    currentInstance.component = component;
    currentInstance = null;

    return component;
  });
}
