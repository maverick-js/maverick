import { isFunction, type WritableKeys } from '@maverick-js/std';

import type { JSX } from '../jsx/jsx';
import { MaverickViewController } from './controller';
import type { CustomElementOptions, MaverickCustomElement } from './custom-element/types';
import { MaverickInstance } from './instance';
import type { ComponentLifecycleEvents } from './lifecycle';
import { type Dispose, effect, type Maybe, scoped } from './signals';
import type { State } from './state';
import type { CUSTOM_ELEMENT_SYMBOL } from './symbols';
import type { SignalOrValueRecord } from './types';

const MAVERICK_COMPONENT_CTOR_SYMBOL = /* #__PURE__ */ Symbol.for('maverick.component.ctor');

export class MaverickComponent<
  Props = {},
  State = {},
  Events = {},
  CSSVars = {},
> extends MaverickViewController<Props, State, Events & ComponentLifecycleEvents, CSSVars> {
  static [MAVERICK_COMPONENT_CTOR_SYMBOL] = true;

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

export function isMaverickComponentConstructor(
  value: unknown,
): value is MaverickComponentConstructor {
  return isFunction(value) && MAVERICK_COMPONENT_CTOR_SYMBOL in value;
}

export interface AnyMaverickComponent extends MaverickComponent<any, any, any, any> {}

export interface MaverickComponentConstructor<T extends MaverickComponent = AnyMaverickComponent> {
  readonly element?: CustomElementOptions<InferComponentCSSProps<T>>;
  readonly props?: InferComponentProps<T>;
  readonly state?: State<InferComponentState<T>>;
  [CUSTOM_ELEMENT_SYMBOL]?(): MaverickCustomElement<T>;
  new (): T;
}

export type InferComponentProps<T> = T extends MaverickComponent<infer Props> ? Props : {};

export type InferComponentState<T> = T extends MaverickComponent<any, infer State> ? State : {};

export type InferComponentEvents<T> =
  T extends MaverickComponent<any, any, infer Events> ? Events & ComponentLifecycleEvents : {};

export type InferComponentCSSProps<T> =
  T extends MaverickComponent<any, any, any, infer CSSVars> ? CSSVars : {};

export type InferComponentMembers<T> =
  T extends MaverickComponent<infer Props>
    ? Omit<Props, keyof T> & Omit<T, keyof MaverickComponent>
    : {};

export type InferComponentCSSVars<
  Component extends AnyMaverickComponent,
  CSSProps = InferComponentCSSProps<Component>,
> = { [Var in WritableKeys<CSSProps> as `--${Var & string}`]: CSSProps[Var] };

export type InferComponentInstance<T> =
  T extends MaverickComponent<infer Props, infer State> ? MaverickInstance<Props, State> : {};
