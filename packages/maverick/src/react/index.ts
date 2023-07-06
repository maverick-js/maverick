import * as React from 'react';

import type { Component, ComponentConstructor, InferComponentEvents } from '../core';
import { createClientComponent } from './client-component';
import { createServerComponent } from './server-component';
import type { InternalReactComponent, ReactEventCallbacks } from './types';

export function createReactComponent<T extends Component>(
  Component: ComponentConstructor<T>,
  events?: (keyof ReactEventCallbacks<InferComponentEvents<T>>)[],
  eventsRegex?: RegExp,
): InternalReactComponent<T> {
  if (__SERVER__) {
    return createServerComponent<T>(Component, new Set(Object.keys(Component.props || {})));
  } else {
    return createClientComponent<T>(
      Component,
      new Set(Object.keys(Component.props || {})),
      new Set(events as string[]),
      eventsRegex,
    ) as any;
  }
}

export * from './scope';
export * from './hooks/use-state-context';
export * from './hooks/use-signal';
export * from './hooks/use-signal-record';
export * from './utils';
export type * from './types';
