import * as React from 'react';

import type { Context, ContextMap } from '../runtime';

export const ReactContextMap = React.createContext<ContextMap | null>(null);

export function useReactContext<T>(context: Context<T>): T {
  const map = React.useContext(ReactContextMap);
  return map?.get(context.id) ?? context.initial;
}
