import type * as React from 'react';
import type { PascalCase } from 'type-fest';

import type {
  AnyCustomElement,
  InferCustomElementCSSVars,
  InferCustomElementEvents,
  InferCustomElementProps,
} from '../element/types';
import type { JSX } from '../runtime/jsx';

export interface ReactElement<T extends AnyCustomElement>
  extends React.ForwardRefExoticComponent<ReactElementProps<T>> {}

export type ReactElementProps<T extends AnyCustomElement> = Partial<InferCustomElementProps<T>> &
  React.RefAttributes<T> &
  Omit<React.HTMLAttributes<T>, 'style'> & {
    style?:
      | (React.CSSProperties &
          Partial<InferCustomElementCSSVars<T>> & { [name: `--${string}`]: string })
      | undefined;
    children?: React.ReactNode | undefined;
    part?: string | undefined;
    __forwardedRef?: React.Ref<T>;
  } & ReactElementEventCallbacks<T, InferCustomElementEvents<T> & ReactEventMap>;

export interface ReactEventMap extends Omit<MaverickOnAttributes, keyof HTMLElementEventMap> {}

export type ReactElementEventCallbacks<Target extends EventTarget, Events> = {
  [EventType in keyof Events as `on${PascalCase<EventType & string>}`]?: JSX.TargetedEventHandler<
    Target,
    Events[EventType] & Event
  >;
};
