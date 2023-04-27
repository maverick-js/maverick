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

export interface ReactElement<T extends HTMLCustomElement>
  extends React.ForwardRefExoticComponent<ReactElementProps<T>> {}

export type ReactElementProps<
  T extends HTMLCustomElement,
  R extends Component = InferElementComponent<T>,
> = Partial<InferComponentProps<R>> &
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
