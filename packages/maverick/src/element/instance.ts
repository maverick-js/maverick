import {
  type Dispose,
  getScope,
  onDispose,
  root,
  type Scope,
  scoped,
  signal,
  tick,
} from '@maverick-js/signals';

import {
  type InferStore,
  type InferStoreRecord,
  provideContext,
  type WriteSignalRecord,
} from '../runtime';
import { type JSX } from '../runtime/jsx';
import type {
  AnyComponent,
  ComponentAPI,
  ComponentConstructor,
  DefaultComponentAPI,
  InferComponentProps,
  InferComponentStore,
} from './component';
import type { ElementAttributesRecord, ElementStylesRecord } from './controller';
import type { HTMLCustomElement } from './host';
import { setComponentInstance } from './internal';
import type { PropDeclarations, PropDefinitions } from './props';

export interface ComponentLifecycleCallback {
  (el: HTMLElement): any;
}

export interface ComponentInstanceInit<Props = {}> {
  scope?: Scope | null;
  props?: Readonly<Partial<Props>>;
}

export function createComponent<Component extends AnyComponent>(
  Component: ComponentConstructor<Component>,
  init?: ComponentInstanceInit<InferComponentProps<Component>>,
) {
  const instance = new ComponentInstance(Component, init);
  return scoped(() => new Component(instance as any), instance._scope)!;
}

export class ComponentInstance<API extends ComponentAPI = DefaultComponentAPI> {
  private _dispose!: Dispose;

  _scope!: Scope;
  _el: HTMLElement | null = null;
  _attrs: ElementAttributesRecord | null = {};
  _styles: ElementStylesRecord | null = {};
  _props: WriteSignalRecord<InferComponentProps<API>> = {} as any;
  _state!: Readonly<InferStoreRecord<InferComponentStore<API>>>;
  _store!: InferStore<InferComponentStore<API>>;
  _renderer: (() => JSX.Element) | null = null;
  _destroyed = false;

  _attachCallbacks: ComponentLifecycleCallback[] = [];
  _connectCallbacks: ComponentLifecycleCallback[] = [];
  _disconnectCallbacks: ComponentLifecycleCallback[] = [];
  _destroyCallbacks: ComponentLifecycleCallback[] = [];

  constructor(
    Component: ComponentConstructor<API>,
    init: ComponentInstanceInit<InferComponentProps<API>> = {},
  ) {
    root((dispose) => {
      this._scope = getScope()!;
      this._dispose = dispose;
      if (init.scope) init.scope.append(this._scope);

      const store = Component.el.store;
      if (store) {
        this._store = store.create() as InferStore<InferComponentStore<API>>;
        this._state = new Proxy(this._store, {
          get: (_, prop) => this._store[prop](),
        }) as any;
        provideContext(store, this._store);
      }

      const props = Component.el.props as PropDefinitions<InferComponentProps<API>> | undefined;
      if (props) {
        this._props = createInstanceProps(props);
        if (init.props) {
          for (const prop of Object.keys(init.props)) {
            if (prop in props) this._props[prop].set(init.props[prop]!);
          }
        }
      }

      onDispose(this._destroy.bind(this));
    });
  }

  _render(): JSX.Element {
    return scoped(() => {
      try {
        setComponentInstance(this);
        return this._renderer?.();
      } finally {
        setComponentInstance(null);
      }
    }, this._scope);
  }

  _destroy() {
    if (this._destroyed) return;

    this._destroyed = true;

    for (const destroy of this._destroyCallbacks) {
      scoped(() => destroy(this._el!), this._scope);
    }

    (this._el as HTMLCustomElement)?.destroy();

    this._attachCallbacks.length = 0;
    this._connectCallbacks.length = 0;
    this._disconnectCallbacks.length = 0;
    this._destroyCallbacks.length = 0;

    if (!__SERVER__) tick();

    this._dispose();

    this._el = null;
    this._renderer = null;
  }
}

function createInstanceProps<Props>(defs: PropDefinitions<Props>) {
  const props = {} as WriteSignalRecord<Props>;

  for (const name of Object.keys(defs) as (keyof Props)[]) {
    const def = defs[name];
    props[name] = signal(def.value, def);
  }

  return props;
}
