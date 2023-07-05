import * as React from 'react';

import type { Component, ComponentConstructor, InferComponentEvents } from '../core';
import { ClientComponent } from './client-component';
import { ServerComponent } from './server-component';
import type { InternalReactComponent, ReactEventCallbacks } from './types';

export function createReactComponent<T extends Component>(
  Component: ComponentConstructor<T>,
  events?: (keyof ReactEventCallbacks<InferComponentEvents<T>>)[],
  eventsRegex?: RegExp,
) {
  class MaverickComponent extends (__SERVER__ ? ServerComponent<T> : ClientComponent<T>) {
    static displayName = Component.name + 'Bridge';
    static _Component = Component;
    static _props = new Set(Object.keys(Component.props || {}));
    static _events = new Set(events);
    static _eventsRegex = eventsRegex;
  }

  const component = React.forwardRef<T>((props, ref) =>
    React.createElement(MaverickComponent as any, { ...props, forwardRef: ref }),
  ) as unknown as InternalReactComponent<T>;

  component.displayName = 'forwardRef(' + Component.name + 'Bridge)';
  return component;
}

export * from './scope';
export * from './hooks/use-state-context';
export * from './hooks/use-signal';
export * from './hooks/use-signal-record';
export * from './utils';
export type * from './types';
