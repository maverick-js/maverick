import type {
  Component,
  ComponentConstructor,
  InferComponentEvents,
} from '../../maverick/src/core';
import { createClientComponent } from './client-component';
import { createServerComponent } from './server-component';
import type { ReactComponentBridge, ReactEventCallbacks } from './types';

export interface CreateReactComponentOptions<T extends Component> {
  events?: (keyof ReactEventCallbacks<InferComponentEvents<T>>)[];
  eventsRegex?: RegExp;
  domEvents?: Set<string>;
  domEventsRegex?: RegExp;
}

export function createReactComponent<T extends Component>(
  Component: ComponentConstructor<T>,
  options?: CreateReactComponentOptions<T>,
): ReactComponentBridge<T> {
  if (__SERVER__) {
    return createServerComponent<T>(Component, {
      props: new Set(Object.keys(Component.props || {})),
    });
  } else {
    return createClientComponent<T>(Component, {
      props: new Set(Object.keys(Component.props || {})),
      events: new Set(options?.events as string[]),
      eventsRE: options?.eventsRegex,
      domEvents: options?.domEvents,
      domEventsRE: options?.domEventsRegex,
    }) as any;
  }
}

export * from './scope';
export * from './hooks/use-state-context';
export * from './hooks/use-signal';
export * from './hooks/use-signal-record';
export * from './utils';
export type * from './types';
