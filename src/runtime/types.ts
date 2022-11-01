import type { Observable, ObservableSubject } from '@maverick-js/observables';
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

export type VoidComponent<Props = {}> = Component<VoidComponentProps<Props>>;

export type ObservableRecord<Props = Record<string, any>> = {
  [Prop in keyof Props]: Observable<Props[Prop]>;
};

export type SubjectRecord<Props = Record<string, any>> = {
  [Prop in keyof Props]: ObservableSubject<Props[Prop]>;
};

export type ObservableRecordValues<T> = {
  [P in keyof T]: T[P] extends Observable<infer R> ? R : never;
};

export type AnyRecord = Readonly<{
  [name: string]: any;
}>;

export {};
