import type * as React from 'react';
import type { PascalCase } from 'type-fest';

import type { DOMEvent, InferEventInit } from '../element/event';
import type {
  AnyElementDefinition,
  ElementDefinition,
  ElementEventRecord,
  InferMaverickElement,
} from '../element/types';
import type { JSX } from '../runtime/jsx';

export type ReactElement<Definition extends AnyElementDefinition> = React.ForwardRefExoticComponent<
  ReactElementProps<Definition>
>;

export type ReactElementProps<Definition extends AnyElementDefinition> =
  Definition extends ElementDefinition<infer Props, infer Events>
    ? Partial<Props> &
        React.RefAttributes<InferMaverickElement<Definition>> &
        Omit<React.HTMLAttributes<InferMaverickElement<Definition>>, 'style'> & {
          style?: (React.CSSProperties & { [name: `--${string}`]: string }) | undefined;
          children?: React.ReactNode | undefined;
          __forwardedRef?: React.Ref<InferMaverickElement<Definition>>;
        } & ReactElementEventCallbacks<
          InferMaverickElement<Definition> & EventTarget,
          Events & Omit<JSX.GlobalOnAttributes, keyof GlobalEventHandlersEventMap>
        >
    : never;

export type ReactElementEventCallbacks<
  Target extends EventTarget,
  Events extends ElementEventRecord,
> = {
  [EventType in keyof Events as `on${PascalCase<EventType & string>}`]?: JSX.TargetedEventHandler<
    Target,
    Events[EventType] extends Event
      ? Events[EventType]
      : DOMEvent<InferEventInit<Events[EventType]>['detail']>
  >;
};
