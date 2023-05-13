import {
  createScope,
  type Dispose,
  effect,
  getScope,
  isFunction,
  onDispose,
  root,
  type Scope,
  scoped,
  signal,
  tick,
} from '@maverick-js/signals';

import { provideContext, StoreFactory, type WriteSignalRecord } from '../runtime';
import { type JSX } from '../runtime/jsx';
import type {
  AnyComponentAPI,
  Component,
  ComponentAPI,
  ComponentConstructor,
  InferComponentAPI,
  InferComponentProps,
} from './component';
import type { ElementAttributesRecord, ElementStylesRecord } from './controller';
import type { HTMLCustomElement } from './host';
import type { PropDefinitions } from './props';

export interface ComponentLifecycleCallback {
  (el: HTMLElement): any;
}

export interface ComponentInstanceInit<Props = {}> {
  scope?: Scope | null;
  props?: Readonly<Partial<Props>> | null;
}

export function createComponent<T extends Component>(
  Component: ComponentConstructor<T>,
  init?: ComponentInstanceInit<InferComponentProps<T>>,
) {
  const instance = new ComponentInstance<InferComponentAPI<T>>(Component, init);
  return scoped(() => new Component(instance), instance._scope)!;
}

export class ComponentInstance<API extends ComponentAPI = AnyComponentAPI> {
  private _dispose!: Dispose;

  _scope!: Scope;
  _renderScope!: Scope;

  _el: HTMLElement | null = null;

  _renderer: (() => JSX.Element) | null = null;
  _innerHTML = false;
  _destroyed = false;

  _attrs: ElementAttributesRecord | null = {};
  _styles: ElementStylesRecord | null = {};
  _props: WriteSignalRecord<API['props']> = {} as any;

  // these props cause type issues - don't type them.
  _state: any = null;
  _store: any = null;

  _attachCallbacks: ComponentLifecycleCallback[] = [];
  _connectCallbacks: ComponentLifecycleCallback[] = [];
  _disconnectCallbacks: ComponentLifecycleCallback[] = [];
  _destroyCallbacks: ComponentLifecycleCallback[] = [];

  constructor(
    Component: ComponentConstructor,
    init: ComponentInstanceInit<InferComponentProps<API>> = {},
  ) {
    root((dispose) => {
      this._scope = getScope()!;

      this._dispose = dispose;
      if (init.scope) init.scope.append(this._scope);

      const store = Component.el.store as unknown as StoreFactory<any>;
      if (store) {
        this._store = store.create();
        this._state = new Proxy(this._store, {
          get: (_, prop: string) => this._store[prop](),
        });
        provideContext(store, this._store);
      }

      const props = Component.el.props as PropDefinitions<API['props']> | undefined;
      if (props) {
        this._props = createInstanceProps(props);
        if (init.props) {
          for (const prop of Object.keys(init.props)) {
            if (prop in props) {
              const value = init.props[prop]!;
              if (isFunction(value)) {
                effect(() => void this._props[prop].set(value()));
              } else {
                this._props[prop].set(value);
              }
            }
          }
        }
      }

      if ((init.props as any)?.innerHTML) {
        this._innerHTML = true;
      }

      onDispose(this._destroy.bind(this));
    });
  }

  _render(): JSX.Element {
    if (!this._renderer) return null;

    if (!this._renderScope) {
      scoped(() => {
        this._renderScope = createScope();
      }, this._scope);
    }

    return scoped(() => this._renderer!(), this._renderScope);
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
