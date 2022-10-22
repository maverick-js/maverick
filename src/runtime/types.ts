import type { Observable, ObservableSubject } from '@maverick-js/observables';
import type { JSX } from './jsx';

export type DOMElement = Element;
export type DOMEvent = Event;

export type ComponentChildren = JSX.Element;

export type ComponentProps<Props = {}, Children = never> = Props & {
  children?: Children;
};

export type Component<Props = {}, Children = never> = (
  props: ComponentProps<Props, Children>,
) => JSX.Element;

export type ParentComponentProps<Props = {}, Children = ComponentChildren> = Props & {
  children: Children;
};

export type ParentComponent<Props = {}, Children = ComponentChildren> = (
  props: ParentComponentProps<Props, Children>,
) => JSX.Element;

export type VoidComponentProps<Props = {}> = ComponentProps<Props>;

export type VoidComponent<Props = {}> = Component<VoidComponentProps<Props>>;

export type ObservableRecord = {
  [key: string]: Observable<any>;
};

export type SubjectRecord = {
  [key: string]: ObservableSubject<any>;
};

export type ObservableValueRecord<T> = {
  [P in keyof T]: T[P] extends Observable<infer R> ? R : never;
};

export {};
