import type { ServerElement } from '../element/server';
import type { ElementAttributesRecord, ElementStylesRecord } from '../element/types';
import { setAttribute, setStyle } from '../std/dom';
import { unwrapDeep } from '../std/signal';
import { isFunction } from '../std/unit';
import type { Component, ComponentConstructor } from './component';
import { provideContext } from './context';
import { createScope, effect, onDispose } from './signals';
import { type Scope, scoped, signal } from './signals';
import type { Store } from './store';
import type { WriteSignalRecord } from './types';

export interface LifecycleCallback {
  (el: HTMLElement): any;
}

export interface InstanceInit<Props = {}> {
  scope?: Scope | null;
  props?: Readonly<Partial<Props>> | null;
}

const EMPTY_PROPS = {} as any;

export class Instance<Props = {}, State = {}, Events = {}, CSSVars = {}> {
  /** @internal type only */
  $ts__events?: Events;
  /** @internal type only */
  $ts__vars?: CSSVars;

  readonly $el = signal<HTMLElement | null>(null);

  _el: HTMLElement | null = null;
  _scope: Scope;
  _attachScope: Scope | null = null;
  _connectScope: Scope | null = null;
  _destroyed = false;

  _props: WriteSignalRecord<Props> = EMPTY_PROPS;
  _attrs: ElementAttributesRecord | null = null;
  _styles: ElementStylesRecord | null = null;

  readonly _state!: Readonly<State>;
  readonly _$state!: Store<State>;

  readonly _attachCallbacks: LifecycleCallback[] = [];
  readonly _connectCallbacks: LifecycleCallback[] = [];
  readonly _destroyCallbacks: LifecycleCallback[] = [];

  constructor(
    Component: ComponentConstructor<Component<Props, State, any, any>>,
    scope: Scope,
    init?: InstanceInit<Props>,
  ) {
    this._scope = scope;
    if (init?.scope) init.scope.append(scope);

    let store = Component.state,
      props = Component.props;

    if (store) {
      this._$state = store.create();
      this._state = new Proxy(this._$state, {
        get: (_, prop: string) => this._$state[prop](),
      }) as State;
      provideContext(store, this._$state);
    }

    if (props) {
      this._props = createInstanceProps(props) as WriteSignalRecord<Props>;
      if (init?.props) {
        for (const prop of Object.keys(init.props)) {
          this._props[prop]?.set(init.props[prop]);
        }
      }
    }

    onDispose(this._destroy.bind(this));
  }

  _attach(el: HTMLElement | ServerElement) {
    if (this._el) return;

    this._el = el as HTMLElement;
    this.$el.set(el as HTMLElement);

    this._attachScope = createScope();
    this._scope.append(this._attachScope);

    scoped(() => {
      for (const callback of this._attachCallbacks) callback(this._el!);
      this._attachAttrs();
      this._attachStyles();
    }, this._attachScope);

    el.dispatchEvent(new Event('attached'));
  }

  _detach() {
    this._attachScope?.dispose();
    this._attachScope = null;
    this._connectScope = null;
    this._el = null;
    this.$el.set(null);
  }

  _connect() {
    if (!this._el || !this._attachScope || !this._connectCallbacks.length) return;

    this._connectScope = createScope();
    this._attachScope.append(this._connectScope);

    scoped(() => {
      for (const callback of this._connectCallbacks) callback(this._el!);
    }, this._connectScope);
  }

  _disconnect() {
    this._connectScope?.dispose();
    this._connectScope = null;
  }

  _destroy() {
    if (this._destroyed) return;
    this._destroyed = true;

    scoped(() => {
      for (const callback of this._destroyCallbacks) callback(this._el!);
    }, this._scope);

    this._detach();
    this._scope.dispose();

    this._attachCallbacks.length = 0;
    this._connectCallbacks.length = 0;
    this._destroyCallbacks.length = 0;
  }

  private _attachAttrs() {
    if (!this._attrs) return;

    let value: unknown;

    for (const name of Object.keys(this._attrs)) {
      value = this._attrs[name];
      if (__SERVER__) {
        setAttribute(this._el!, name, unwrapDeep(value));
      } else if (isFunction(value)) {
        effect(this._setAttr.bind(this, name, value));
      } else {
        setAttribute(this._el!, name, value);
      }
    }
  }

  private _attachStyles() {
    if (!this._styles) return;

    let value: unknown;

    for (const name of Object.keys(this._styles)) {
      value = this._styles[name];
      if (__SERVER__) {
        setStyle(this._el!, name, unwrapDeep(value));
      } else if (isFunction(value)) {
        effect(this._setStyle.bind(this, name, value));
      } else {
        setStyle(this._el!, name, value);
      }
    }
  }

  private _setAttr(name: string, value: Function) {
    this._el && setAttribute(this._el, name, value());
  }

  private _setStyle(name: string, value: Function) {
    this._el && setStyle(this._el, name, value());
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
