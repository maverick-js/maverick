import type * as React from 'react';
import type { PascalCase } from 'type-fest';

import type {
  AnyMaverickElement,
  ElementEventRecord,
  InferElementCSSVars,
  InferElementEvents,
  InferElementProps,
} from '../element/types';
import type { JSX } from '../runtime/jsx';

export interface ReactElement<Element extends AnyMaverickElement>
  extends React.ForwardRefExoticComponent<ReactElementProps<Element>> {}

export type ReactElementProps<Element extends AnyMaverickElement> = Partial<
  InferElementProps<Element>
> &
  React.RefAttributes<Element> &
  Omit<React.HTMLAttributes<Element>, 'style'> & {
    style?:
      | (React.CSSProperties &
          Partial<InferElementCSSVars<Element>> & { [name: `--${string}`]: string })
      | undefined;
    children?: React.ReactNode | undefined;
    __forwardedRef?: React.Ref<Element>;
  } & ReactElementEventCallbacks<
    Element & EventTarget,
    InferElementEvents<Element> & Omit<MaverickOnAttributes, keyof HTMLElementEventMap>
  >;

export type ReactElementEventCallbacks<
  Target extends EventTarget,
  Events extends ElementEventRecord,
> = {
  [EventType in keyof Events as `on${PascalCase<EventType & string>}`]?: JSX.TargetedEventHandler<
    Target,
    Events[EventType]
  >;
};
