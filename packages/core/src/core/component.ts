import { isFunction } from '@maverick-js/std';
import type { WritableKeysOf } from 'type-fest';

import type { JSX } from '../jsx/jsx';
import { ViewController } from './controller';
import type { CustomElementOptions, MaverickCustomElement } from './custom-element/types';
import { Instance } from './instance';
import type { ComponentLifecycleEvents } from './lifecycle';
import { type Dispose, effect, type Maybe, scoped } from './signals';
import type { State } from './state';
import type { CUSTOM_ELEMENT_SYMBOL } from './symbols';
import type { SignalOrValueRecord } from './types';

const COMPONENT_CTOR_SYMBOL = /* #__PURE__ */ Symbol.for('maverick.component.ctor');

export class Component<Props = {}, State = {}, Events = {}, CSSVars = {}> extends ViewController<
  Props,
  State,
  Events & ComponentLifecycleEvents,
  CSSVars
> {
  static [COMPONENT_CTOR_SYMBOL] = true;

  /** @internal - DO NOT USE (for jsx types only) */
  jsxProps!: JSX.ComponentAttributes<Partial<SignalOrValueRecord<Props>>, Events, CSSVars>;

  render?(): JSX.Element;

  subscribe(callback: (state: Readonly<State>) => Maybe<Dispose>) {
    if (__DEV__ && !this.state) {
      const name = this.constructor.name;
      throw Error(
        `[maverick]: component \`${name}\` can not be subscribed to because it has no internal state`,
      );
    }

    return scoped(() => effect(() => callback(this.state)), this.$$.scope)!;
  }

  destroy(): void {
    this.$$.destroy();
  }
}

export function isComponentConstructor(value: unknown): value is ComponentConstructor {
  return isFunction(value) && COMPONENT_CTOR_SYMBOL in value;
}

export interface AnyComponent extends Component<any, any, any, any> {}

export interface ComponentConstructor<T extends Component = AnyComponent> {
  readonly element?: CustomElementOptions<InferComponentCSSProps<T>>;
  readonly props?: InferComponentProps<T>;
  readonly state?: State<InferComponentState<T>>;
  [CUSTOM_ELEMENT_SYMBOL]?(): MaverickCustomElement<T>;
  new (): T;
}

export type InferComponentProps<T> = T extends Component<infer Props> ? Props : {};

export type InferComponentState<T> = T extends Component<any, infer State> ? State : {};

export type InferComponentEvents<T> =
  T extends Component<any, any, infer Events> ? Events & ComponentLifecycleEvents : {};

export type InferComponentCSSProps<T> =
  T extends Component<any, any, any, infer CSSVars> ? CSSVars : {};

export type InferComponentMembers<T> =
  T extends Component<infer Props> ? Omit<Props, keyof T> & Omit<T, keyof Component> : {};

export type InferComponentCSSVars<
  Component extends AnyComponent,
  CSSProps = InferComponentCSSProps<Component>,
> = { [Var in WritableKeysOf<CSSProps> as `--${Var & string}`]: CSSProps[Var] };

export type InferComponentInstance<T> =
  T extends Component<infer Props, infer State> ? Instance<Props, State> : {};
