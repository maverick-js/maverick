import type { JSX, StoreFactory } from '../runtime';
import type { WritableKeys } from '../std/types';
import { ComponentController } from './controller';
import type { CustomElementDefinition } from './define';
import type { ComponentInstance } from './instance';
import { INSTANCE } from './internal';

export interface ComponentAPI {
  props?: {};
  events?: {};
  cssvars?: {};
  store?: StoreFactory<any>;
}

export interface AnyComponentAPI {
  props?: any;
  events?: any;
  cssvars?: any;
  store?: StoreFactory<any>;
}

export class Component<
  API extends ComponentAPI = DefaultComponentAPI,
> extends ComponentController<API> {
  constructor(instance: ComponentInstance<API>) {
    super(instance);
    if (this.render) instance._renderer = this.render.bind(this);
  }

  render?(): JSX.Element;

  destroy(): void {
    this[INSTANCE]._destroy();
  }
}

export interface DefaultComponentAPI extends Omit<AnyComponentAPI, 'store'> {}

export interface AnyComponent extends Component<AnyComponentAPI> {}

export interface ComponentConstructor<
  T = AnyComponent,
  API extends ComponentAPI = T extends Component<infer API>
    ? API
    : T extends ComponentAPI
    ? T
    : never,
> {
  el: CustomElementDefinition<API>;
  new (instance: ComponentInstance<API>): T extends AnyComponent ? T : Component<API>;
}

export type InferComponentAPI<T> = T extends Component<infer API> ? API : never;

export type InferComponentProps<T> = T extends Component<infer API>
  ? NonNullable<API['props']>
  : T extends ComponentAPI
  ? NonNullable<T['props']>
  : never;

export type InferComponentEvents<T> = T extends Component<infer API>
  ? NonNullable<API['events']>
  : T extends ComponentAPI
  ? NonNullable<T['events']>
  : never;

export type InferComponentCSSProps<T> = T extends Component<infer API>
  ? NonNullable<API['cssvars']>
  : T extends ComponentAPI
  ? NonNullable<T['cssvars']>
  : never;

export type InferComponentStore<T> = T extends Component<infer API>
  ? NonNullable<API['store']>
  : T extends ComponentAPI
  ? NonNullable<T['store']>
  : never;

export type InferComponentMembers<T> = T extends Component<infer API>
  ? Omit<NonNullable<API['props']>, keyof T> & T
  : never;

export type InferComponentCSSVars<
  Component extends AnyComponent,
  CSSProps = InferComponentCSSProps<Component>,
> = { [Var in WritableKeys<CSSProps> as `--${Var & string}`]: CSSProps[Var] };