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

export interface ReactComponentBridge<T extends Component> {
  displayName?: string;
  (props: ReactBridgeProps<T>): React.ReactNode;
}

export type ReactProps<
  C extends Component,
  E = ReactEventCallbacks<InferComponentEvents<C>>,
> = Partial<InferComponentProps<C>> &
  E & {
    style?:
      | ((React.CSSProperties & { [name: `--${string}`]: string | number | null }) &
          Partial<InferComponentCSSVars<C>>)
      | undefined;
    part?: string | undefined;
  };

export type ReactBridgeProps<C extends Component> = ReactProps<C> & {
  className?: string;
  ref?: React.Ref<C>;
  forwardRef?: React.Ref<C>;
  children?:
    | React.ReactNode
    | ((
        props: React.HTMLAttributes<HTMLElement> & React.RefAttributes<any>,
        component: C,
      ) => React.ReactNode);
};

export type ReactElementProps<
  C extends Component,
  T extends HTMLElement | SVGElement = HTMLElement,
  E = ReactEventCallbacks<InferComponentEvents<C>>,
> = ReactProps<C, E> &
  Omit<T extends HTMLElement ? React.HTMLAttributes<T> : React.SVGAttributes<T>, 'style' | keyof E>;

export type ReactEventCallbacks<E> = {
  [Type in keyof E as `on${PascalCase<Type & string>}`]?: InferEventDetail<E[Type]> extends void
    ? (nativeEvent: E[Type]) => void
    : (detail: InferEventDetail<E[Type]>, nativeEvent: E[Type]) => void;
};

export type InferReactElement<T> = T extends ReactElementProps<any, infer E, any> ? E : never;

export type InferReactComponent<T> = T extends ReactProps<infer C, any>
  ? C
  : T extends ReactElementProps<infer C, any>
  ? C
  : never;
