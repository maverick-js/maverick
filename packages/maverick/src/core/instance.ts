import type { ServerElement } from '../element/server';
import type { ElementAttributesRecord, ElementStylesRecord } from '../element/types';
import { setAttribute, setStyle } from '../std/dom';
import { unwrapDeep } from '../std/signal';
import { isFunction } from '../std/unit';
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

  _el: HTMLElement | null = null;
  _scope: Scope | null = null;
  _attachScope: Scope | null = null;
  _connectScope: Scope | null = null;
  _component: Component | null = null;
  _destroyed = false;

  _props: WriteSignalRecord<Props> = EMPTY_PROPS;
  _attrs: ElementAttributesRecord | null = null;
  _styles: ElementStylesRecord | null = null;

  _state!: Readonly<State>;
  _$state!: any;

  readonly _setupCallbacks: SetupCallback[] = [];
  readonly _attachCallbacks: ElementCallback[] = [];
  readonly _connectCallbacks: ElementCallback[] = [];
  readonly _destroyCallbacks: ElementCallback[] = [];

  constructor(
    Component: ComponentConstructor<Component<Props, State, any, any>>,
    scope: Scope,
    init?: InstanceInit<Props>,
  ) {
    this._scope = scope;
    if (init?.scope) init.scope.append(scope);

    let stateFactory = Component.state,
      props = Component.props;

    if (stateFactory) {
      this._$state = stateFactory.create();
      this._state = new Proxy(this._$state, {
        get: (_, prop: string) => this._$state[prop](),
      }) as State;
      provideContext(stateFactory, this._$state);
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

  _setup() {
    scoped(() => {
      for (const callback of this._setupCallbacks) callback();
    }, this._scope);
  }

  _attach(el: HTMLElement | ServerElement) {
    if (this._el) return;

    this._el = el as HTMLElement;
    this.$el.set(el as HTMLElement);

    scoped(() => {
      this._attachScope = createScope();
      scoped(() => {
        for (const callback of this._attachCallbacks) callback(this._el!);
        this._attachAttrs();
        this._attachStyles();
      }, this._attachScope);
    }, this._scope);

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
    scoped(() => {
      this._connectScope = createScope();
      scoped(() => {
        for (const callback of this._connectCallbacks) callback(this._el!);
      }, this._connectScope);
    }, this._attachScope);
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

    const el = this._el;

    this._detach();
    this._scope!.dispose();

    this._setupCallbacks.length = 0;
    this._attachCallbacks.length = 0;
    this._connectCallbacks.length = 0;
    this._destroyCallbacks.length = 0;

    this._component = null;
    this._attrs = null;
    this._styles = null;
    this._props = EMPTY_PROPS;
    this._scope = null;
    this._state = EMPTY_PROPS;
    this._$state = null;
    // @ts-expect-error
    if (el) delete this._el.$;
  }

  _addHooks(target: LifecycleHooks) {
    if (target.onSetup) this._setupCallbacks.push(target.onSetup.bind(target));
    if (target.onAttach) this._attachCallbacks.push(target.onAttach.bind(target));
    if (target.onConnect) this._connectCallbacks.push(target.onConnect.bind(target));
    if (target.onDestroy) this._destroyCallbacks.push(target.onDestroy.bind(target));
  }

  private _attachAttrs() {
    if (!this._attrs) return;
    for (const name of Object.keys(this._attrs)) {
      if (__SERVER__) {
        setAttribute(this._el!, name, unwrapDeep.call(this._component, this._attrs[name]));
      } else if (isFunction(this._attrs[name])) {
        effect(this._setAttr.bind(this, name));
      } else {
        setAttribute(this._el!, name, this._attrs[name]);
      }
    }
  }

  private _attachStyles() {
    if (!this._styles) return;
    for (const name of Object.keys(this._styles)) {
      if (__SERVER__) {
        setStyle(this._el!, name, unwrapDeep.call(this._component, this._styles[name]));
      } else if (isFunction(this._styles[name])) {
        effect(this._setStyle.bind(this, name));
      } else {
        setStyle(this._el!, name, this._styles[name]);
      }
    }
  }

  private _setAttr(name: string) {
    setAttribute(this._el!, name, (this._attrs![name] as Function).call(this._component));
  }

  private _setStyle(name: string) {
    setStyle(this._el!, name, (this._styles![name] as Function).call(this._component));
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
