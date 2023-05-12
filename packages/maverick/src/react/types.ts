import type * as React from 'react';
import type { PascalCase } from 'type-fest';

import type {
  Component,
  InferComponentCSSVars,
  InferComponentEvents,
  InferComponentProps,
} from '../element/component';
import type { HTMLCustomElement, InferElementComponent } from '../element/host';
import type { JSX } from '../runtime/jsx';

export interface ReactElement<Props> extends React.ForwardRefExoticComponent<Props> {}

export type InferReactElement<T> = T extends ReactElementProps<infer E, any> ? E : never;

export type ReactElementProps<
  T extends HTMLCustomElement = HTMLCustomElement<any>,
  R extends Component = InferElementComponent<T>,
> = {
  /** @internal types only */
  ts__element?: T;
} & Partial<InferComponentProps<R>> &
  React.RefAttributes<T> &
  Omit<React.HTMLAttributes<T>, 'style'> & {
    style?:
      | (React.CSSProperties &
          Partial<InferComponentCSSVars<R>> & { [name: `--${string}`]: string })
      | undefined;
    children?: React.ReactNode | undefined;
    part?: string | undefined;
    __forwardedRef?: React.Ref<T>;
  } & ReactElementEventCallbacks<T, InferComponentEvents<R> & ReactEventMap>;

export interface ReactEventMap extends Omit<MaverickOnAttributes, keyof HTMLElementEventMap> {}

export type ReactElementEventCallbacks<Target extends EventTarget, Events> = {
  [EventType in keyof Events as `on${PascalCase<EventType & string>}`]?: JSX.TargetedEventHandler<
    Target,
    Events[EventType]
  >;
};
