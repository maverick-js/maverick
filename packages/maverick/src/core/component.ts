import type { WritableKeys } from '../../../std/src/types';
import { ViewController } from './controller';
import { Instance } from './instance';
import { type Dispose, effect, type Maybe, scoped } from './signals';
import type { State } from './state';

export class Component<Props = {}, State = {}, Events = {}, CSSVars = {}> extends ViewController<
  Props,
  State,
  Events,
  CSSVars
> {
  subscribe(callback: (state: Readonly<State>) => Maybe<Dispose>) {
    if (__DEV__ && !this.state) {
      const name = this.constructor.name;
      throw Error(
        `[maverick] component \`${name}\` can not be subscribed to because it has no internal state`,
      );
    }

    return scoped(() => effect(() => callback(this.state)), this.$$.scope)!;
  }

  destroy(): void {
    this.$$.destroy();
  }
}

export interface AnyComponent extends Component<any, any, any, any> {}

export interface ComponentConstructor<T extends Component = AnyComponent> {
  readonly props?: InferComponentProps<T>;
  readonly state?: State<InferComponentState<T>>;
  new (): T;
}

export type InferComponentProps<T> = T extends Component<infer Props> ? Props : {};

export type InferComponentState<T> = T extends Component<any, infer State> ? State : {};

export type InferComponentEvents<T> = T extends Component<any, any, infer Events> ? Events : {};

export type InferComponentCSSProps<T> = T extends Component<any, any, any, infer CSSVars>
  ? CSSVars
  : {};

export type InferComponentMembers<T> = T extends Component<infer Props>
  ? Omit<Props, keyof T> & Omit<T, keyof Component>
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
