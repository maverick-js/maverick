import type * as React from 'react';
import type { PascalCase } from 'type-fest';

import type {
  Component,
  InferComponentCSSVars,
  InferComponentEvents,
  InferComponentProps,
} from '../core/component';
import type { InferEventDetail } from '../std/event';

export interface ReactComponent<T extends Component> {
  (props: ReactProps<T>): React.ReactNode;
}

export interface InternalReactComponent<T extends Component> {
  (props: InternalReactProps<T>): React.ReactNode;
}

export type ReactProps<
  C extends Component,
  E = ReactEventCallbacks<InferComponentEvents<C>>,
> = Partial<InferComponentProps<C>> &
  React.RefAttributes<C> &
  E & {
    style?:
      | ((React.CSSProperties & { [name: `--${string}`]: string | number | null }) &
          Partial<InferComponentCSSVars<C>>)
      | undefined;
    part?: string | undefined;
  };

export type InternalReactProps<C extends Component> = ReactProps<C> & {
  className?: string;
  forwardRef?: React.Ref<C>;
  children?: (
    props: React.HTMLAttributes<HTMLElement> & React.RefAttributes<any>,
  ) => React.ReactNode;
};

export type ReactElementProps<
  T extends HTMLElement,
  C extends Component,
  E = ReactEventCallbacks<InferComponentEvents<C>>,
> = ReactProps<C, E> & Omit<React.HTMLAttributes<T>, 'style' | keyof E>;

export type ReactEventCallbacks<E> = {
  [Type in keyof E as `on${PascalCase<Type & string>}`]?: InferEventDetail<E[Type]> extends void
    ? (nativeEvent: E[Type]) => void
    : (detail: InferEventDetail<E[Type]>, nativeEvent: E[Type]) => void;
};

export type InferReactElement<T> = T extends ReactElementProps<infer E, any> ? E : never;

export type InferReactComponent<T> = T extends ReactProps<infer C, any>
  ? C
  : T extends ReactElementProps<any, infer C>
  ? C
  : never;
