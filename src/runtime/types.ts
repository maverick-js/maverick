import type { JSX } from './jsx';

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

export {};
