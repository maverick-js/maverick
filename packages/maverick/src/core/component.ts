import type { WritableKeys } from '@maverick-js/std';
import type { IsNever } from 'type-fest';

import type { JSX } from '../jsx/jsx';
import { ViewController } from './controller';
import { Instance } from './instance';
import type { LifecycleEvents } from './lifecycle';
import { type Dispose, effect, type Maybe, scoped } from './signals';
import type { State } from './state';
import type { SignalOrValueRecord } from './types';

export class Component<
  Props = {},
  State = {},
  Events = {},
  CSSVars = {},
  Slots = {},
> extends ViewController<Props, State, Events & LifecycleEvents, CSSVars> {
  /** @internal - DO NOT USE (for jsx types only) */
  jsxProps!: JSX.ComponentAttributes<SignalOrValueRecord<Props>, Events, CSSVars, Slots>;

  render?(props: ComponentRenderProps<Slots>): JSX.Element;

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

export interface AnyComponent extends Component<any, any, any, any, any> {}

export interface ComponentConstructor<T extends Component = AnyComponent> {
  readonly props?: InferComponentProps<T>;
  readonly state?: State<InferComponentState<T>>;
  new (): T;
}

export type InferComponentProps<T> = T extends Component<infer Props> ? Props : {};

export type InferComponentState<T> = T extends Component<any, infer State> ? State : {};

export type InferComponentEvents<T> =
  T extends Component<any, any, infer Events> ? Events & LifecycleEvents : {};

export type InferComponentCSSProps<T> =
  T extends Component<any, any, any, infer CSSVars> ? CSSVars : {};

export type InferComponentMembers<T> =
  T extends Component<infer Props> ? Omit<Props, keyof T> & Omit<T, keyof Component> : {};

export type InferComponentCSSVars<
  Component extends AnyComponent,
  CSSProps = InferComponentCSSProps<Component>,
> = { [Var in WritableKeys<CSSProps> as `--${Var & string}`]: CSSProps[Var] };

export type InferComponentSlots<T> =
  T extends Component<any, any, any, any, infer Slots> ? Slots : {};

export type InferComponentInstance<T> =
  T extends Component<infer Props, infer State> ? Instance<Props, State> : {};

export interface ComponentRenderProps<Slots> {
  $slots: Slots;
}

export type ComponentSlot<Props = never> =
  IsNever<Props> extends true ? { (): JSX.Element } : { (props: Props): JSX.Element };
