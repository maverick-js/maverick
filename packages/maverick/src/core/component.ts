import type { WritableKeys } from '../std/types';
import { Controller } from './controller';
import { Instance } from './instance';
import type { StoreFactory } from './store';

export class Component<Props = {}, State = {}, Events = {}, CSSVars = {}> extends Controller<
  Props,
  State,
  Events,
  CSSVars
> {
  destroy(): void {
    this.$$._destroy();
  }
}

export interface AnyComponent extends Component<any, any, any, any> {}

export interface ComponentConstructor<T extends Component = AnyComponent> {
  readonly props?: InferComponentProps<T>;
  readonly state?: StoreFactory<InferComponentState<T>>;
  new (): T;
}

export type InferComponentProps<T> = T extends Component<infer Props> ? Props : {};

export type InferComponentState<T> = T extends Component<any, infer State> ? State : {};

export type InferComponentEvents<T> = T extends Component<any, any, infer Events> ? Events : {};

export type InferComponentCSSProps<T> = T extends Component<any, any, any, infer CSSVars>
  ? CSSVars
  : {};

export type InferComponentMembers<T> = T extends Component<infer Props>
  ? Omit<Props, keyof T> & Omit<T, 'onAttach' | 'onConnect' | 'onDestroy'>
  : {};

export type InferComponentCSSVars<
  Component extends AnyComponent,
  CSSProps = InferComponentCSSProps<Component>,
> = { [Var in WritableKeys<CSSProps> as `--${Var & string}`]: CSSProps[Var] };

export type InferComponentInstance<T> = T extends Component<
  infer Props,
  infer State,
  infer Events,
  infer CSSVars
>
  ? Instance<Props, State, Events, CSSVars>
  : {};
