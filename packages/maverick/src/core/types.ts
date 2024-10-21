import type { InferSignalValue, ReadSignal, WriteSignal } from '@maverick-js/signals';
import type { ConditionalExcept, ConditionalPick, IsNever, KebabCase } from 'type-fest';

import type { JSX } from '../jsx/jsx';

export type NoChildren<T> = Omit<T, 'children'>;

export interface MaverickFunction<
  Host extends Element = never,
  Props = {},
  Events = {},
  CSSVars = {},
> {
  (props: MaverickFunctionProps<Host, Props, Events, CSSVars>): JSX.Element;
}

export type MaverickFunctionProps<
  Host extends Element = never,
  Props = {},
  Events = {},
  CSSVars = {},
> =
  IsNever<Host> extends true
    ? Props & { children?: JSX.Element }
    : JSX.ComponentAttributes<Props, Events, CSSVars> & JSX.RefAttributes<Host>;

export type SignalOrValue<T> = T | ReadSignal<T>;

export type SignalOrValueRecord<T> = {
  [P in keyof T]: SignalOrValue<T[P]>;
};

export type NullableRecord<T> = {
  [P in keyof T]: T[P] | null;
};

export type NullableSignalOrValueRecord<T> = SignalOrValueRecord<NullableRecord<T>>;

export type Stringify<P> = P extends string ? P : never;

export type LowercaseRecord<T> = {
  [P in keyof T as Lowercase<Stringify<P>>]?: T[P] | null;
};

export type KebabCaseRecord<T> = {
  [P in keyof T as KebabCase<P>]: T[P] | null;
};

export type ReadSignalRecord<Props = Record<string | symbol, any>> = {
  [Prop in keyof Props]: ReadSignal<Props[Prop]>;
};

export type WriteSignalRecord<Props = Record<string | symbol, any>> = {
  [Prop in keyof Props]: WriteSignal<Props[Prop]>;
};

export type SignalAccessorRecord<T> = {
  [P in keyof ConditionalPick<T, WriteSignal<any>>]: InferSignalValue<T[P]>;
} & {
  readonly [P in keyof ConditionalExcept<T, WriteSignal<any>>]: InferSignalValue<T[P]>;
};

export type AnyRecord = {
  [name: string]: any;
};

export interface EventHandler<E = Event> {
  (this: never, event: E): void;
}

export type TargetedEventHandler<T extends EventTarget, E extends Event> = EventHandler<
  TargetedEvent<T, E>
>;

export type TargetedEvent<T extends EventTarget = EventTarget, E = Event> = Omit<
  E,
  'currentTarget'
> & {
  readonly currentTarget: T;
};

export {};
