import { isFunction, MaverickEvent } from '@maverick-js/std';

import type { Component, ComponentConstructor, InferComponentProps } from './component';
import { provideContext } from './context';
import {
  ATTACH_SYMBOL,
  type AttachCallback,
  componentLifecycleSymbols,
  CONNECT_SYMBOL,
  type ConnectCallback,
  DESTROY_SYMBOL,
  type DestroyCallback,
  SETUP_SYMBOL,
  type SetupCallback,
} from './lifecycle';
import { createScope, getScope, onDispose, root, type Scope, scoped, signal } from './signals';
import { State as StateFactory } from './state';
import { ON_DISPATCH_SYMBOL } from './symbols';
import type { SignalOrValueRecord, WriteSignalRecord } from './types';

/** @internal */
export let $$_current_instance: AnyInstance | null = null;

export interface InstanceInit<Props = {}> {
  scope?: Scope | null;
  props?: Readonly<Partial<SignalOrValueRecord<Props>>> | null;
}

const EMPTY_PROPS = {} as any;

export interface AnyInstance extends Instance<any, any> {}

export class Instance<Props = {}, State = {}> {
  /* @internal */
  [ON_DISPATCH_SYMBOL]?: ((event: Event) => void) | null = null;

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

  [SETUP_SYMBOL]: SetupCallback[] = [];
  [ATTACH_SYMBOL]: AttachCallback[] = [];
  [CONNECT_SYMBOL]: ConnectCallback[] = [];
  [DESTROY_SYMBOL]: DestroyCallback[] = [];

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
      this.props = createInstanceProps(props, init?.props) as WriteSignalRecord<Props>;

      if (init?.props) {
        for (const prop of Object.keys(init.props)) {
          const value = init.props[prop];
          if (!isFunction(value)) this.props[prop]?.set(value);
        }
      }
    }

    onDispose(this.destroy.bind(this));
  }

  setup() {
    $$_current_instance = this;

    const callbacks = this[SETUP_SYMBOL];
    if (callbacks) {
      scoped(() => {
        for (const callback of callbacks) callback();
      }, this.scope);
    }

    $$_current_instance = null;
  }

  attach(host: HTMLElement) {
    if (this.host) return;

    $$_current_instance = this;

    this.host = host;
    this.$host.set(host);

    if (__DEV__) {
      (host as any).$$COMPONENT_NAME = this.component?.constructor.name;
    }

    scoped(() => {
      this.attachScope = createScope();
      const callbacks = this[ATTACH_SYMBOL];
      if (callbacks.length > 0) {
        scoped(() => {
          for (const callback of callbacks) callback(this.host!);
        }, this.attachScope);
      }
    }, this.scope);

    this.component?.dispatchEvent(new MaverickEvent<void>('attach'));

    $$_current_instance = null;
  }

  detach() {
    this.attachScope?.dispose();
    this.attachScope = null;
    this.connectScope = null;

    if (__DEV__ && this.host) {
      (this.host as any).$$COMPONENT_NAME = null;
    }

    this.component?.dispatch(new MaverickEvent<void>('detach'));

    this.host = null;
    this.$host.set(null);
  }

  connect() {
    if (!this.host || !this.attachScope) return;

    $$_current_instance = this;

    scoped(() => {
      this.connectScope = createScope();
      const callbacks = this[CONNECT_SYMBOL];
      if (callbacks.length > 0) {
        scoped(() => {
          for (const callback of callbacks) callback(this.host!);
        }, this.connectScope);
      }
    }, this.attachScope);

    this.component?.dispatch(new MaverickEvent<void>('connect'));

    $$_current_instance = null;
  }

  disconnect() {
    this.connectScope?.dispose();
    this.connectScope = null;
    this.component?.dispatch(new MaverickEvent<void>('disconnect'));
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;

    const callbacks = this[DESTROY_SYMBOL];
    if (callbacks.length > 0) {
      scoped(() => {
        for (const callback of callbacks) callback(this.host);
      }, this.scope);
    }

    const host = this.host;

    this.detach();
    this.scope!.dispose();

    for (const hook of Object.values(componentLifecycleSymbols)) {
      this[hook].length = 0;
    }

    this.props = EMPTY_PROPS;
    this.scope = null;
    this.state = EMPTY_PROPS;
    this.$state = null;

    // @ts-expect-error
    if (host) delete host.$;

    this.component?.dispatch(new MaverickEvent<void>('destroy'));
    this.component = null;
  }
}

function createInstanceProps<Props>(
  props: Props,
  init?: Partial<SignalOrValueRecord<Props>> | null,
) {
  const $props = {} as WriteSignalRecord<Props>;

  for (const name of Object.keys(props as Record<string, any>)) {
    const def = props[name];
    $props[name] = init && isFunction(init[name]) ? init[name] : signal(def, def);
  }

  return $props;
}

export function createComponent<T extends Component>(
  Component: ComponentConstructor<T>,
  init?: InstanceInit<InferComponentProps<T>>,
) {
  return root(() => {
    $$_current_instance = new Instance(getScope()!, Component.props, Component.state, init);

    const component = new Component();

    $$_current_instance.component = component;
    $$_current_instance = null;

    return component;
  });
}
