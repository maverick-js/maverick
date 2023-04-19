import type * as React from 'react';
import type { PascalCase } from 'type-fest';

import type {
  AnyComponent,
  InferComponentCSSVars,
  InferComponentEvents,
  InferComponentProps,
} from '../element/component';
import type { HTMLCustomElement } from '../element/host';
import type { JSX } from '../runtime/jsx';

export interface ReactElement<Component extends AnyComponent>
  extends React.ForwardRefExoticComponent<ReactElementProps<Component>> {}

export type ReactElementProps<
  Component extends AnyComponent,
  CustomElement = HTMLCustomElement<Component>,
> = Partial<InferComponentProps<Component>> &
  React.RefAttributes<CustomElement> &
  Omit<React.HTMLAttributes<CustomElement>, 'style'> & {
    style?:
      | (React.CSSProperties &
          Partial<InferComponentCSSVars<Component>> & { [name: `--${string}`]: string })
      | undefined;
    children?: React.ReactNode | undefined;
    part?: string | undefined;
    __forwardedRef?: React.Ref<CustomElement>;
  } & ReactElementEventCallbacks<
    CustomElement & EventTarget,
    InferComponentEvents<Component> & ReactEventMap
  >;

export interface ReactEventMap extends Omit<MaverickOnAttributes, keyof HTMLElementEventMap> {}

export type ReactElementEventCallbacks<Target extends EventTarget, Events> = {
  [EventType in keyof Events as `on${PascalCase<EventType & string>}`]?: JSX.TargetedEventHandler<
    Target,
    Events[EventType] & Event
  >;
};
