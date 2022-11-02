import * as React from 'react';

import { type Context, type ContextMap } from '../runtime';

export const ReactElementContextMap = React.createContext<ContextMap | null>(null);

export function useReactElementContext<T>(context: Context<T>): T {
  const map = React.useContext(ReactElementContextMap);
  return map?.get(context.id) ?? context.initial;
}
