import type { InferSignalValue, ReadSignal, WriteSignal } from '@maverick-js/signals';
import type { ConditionalExcept, ConditionalPick } from 'type-fest';

import type { JSX } from './jsx';

export type ComponentChildren = JSX.Element;

export type ComponentProps<Props = {}, Children = never> = Props & {
  $children?: Children;
};

export type Component<Props = {}, Children = never> = (
  props: ComponentProps<Props, Children>,
) => JSX.Element;

export type ParentComponentProps<Props = {}, Children = ComponentChildren> = Props & {
  $children: Children;
};

export type ParentComponent<Props = {}, Children = ComponentChildren> = (
  props: ParentComponentProps<Props, Children>,
) => JSX.Element;

export type VoidComponentProps<Props = {}> = ComponentProps<Props>;

export interface VoidComponent<Props = {}> extends Component<VoidComponentProps<Props>> {}

export type Signals<Props = Record<string, any>> = {
  [Prop in keyof Props as `$${Prop & string}`]: ReadSignal<Props[Prop]>;
};

export type WriteSignals<Props = Record<string, any>> = {
  [Prop in keyof Props as `$${Prop & string}`]: WriteSignal<Props[Prop]>;
};

export type ReadSignalRecord<Props = Record<string, any>> = {
  [Prop in keyof Props]: ReadSignal<Props[Prop]>;
};

export type WriteSignalRecord<Props = Record<string, any>> = {
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

export {};
