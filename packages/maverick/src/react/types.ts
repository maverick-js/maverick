import type * as React from 'react';
import type { PascalCase } from 'type-fest';

import type {
  AnyCustomElement,
  InferCustomElementCSSVars,
  InferCustomElementEvents,
  InferCustomElementProps,
} from '../element/types';
import type { JSX } from '../runtime/jsx';

export interface ReactElement<Element extends AnyCustomElement>
  extends React.ForwardRefExoticComponent<ReactElementProps<Element>> {}

export type ReactElementProps<Element extends AnyCustomElement> = Partial<
  InferCustomElementProps<Element>
> &
  React.RefAttributes<Element> &
  Omit<React.HTMLAttributes<Element>, 'style'> & {
    style?:
      | (React.CSSProperties &
          Partial<InferCustomElementCSSVars<Element>> & { [name: `--${string}`]: string })
      | undefined;
    children?: React.ReactNode | undefined;
    __forwardedRef?: React.Ref<Element>;
  } & ReactElementEventCallbacks<Element, InferCustomElementEvents<Element> & ReactEventMap>;

export interface ReactEventMap extends Omit<MaverickOnAttributes, keyof HTMLElementEventMap> {}

export type ReactElementEventCallbacks<Target extends EventTarget, Events> = {
  [EventType in keyof Events as `on${PascalCase<EventType & string>}`]?: JSX.TargetedEventHandler<
    Target,
    Events[EventType] & Event
  >;
};
