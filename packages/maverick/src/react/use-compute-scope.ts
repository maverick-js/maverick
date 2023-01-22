import { getContext } from '@maverick-js/signals';
import * as React from 'react';

import type { Context, Scope } from '../runtime';

export interface ReactComputeScope {
  current: Scope | null;
  setups?: (() => void)[];
}

export const ComputeScopeContext = React.createContext<ReactComputeScope | null>(null);

export function WithComputeScope(scope: ReactComputeScope, element: React.ReactElement) {
  return React.createElement(ComputeScopeContext.Provider, { value: scope }, element);
}

export function useComputeScope(): ReactComputeScope | null {
  return React.useContext(ComputeScopeContext);
}

export function useContext<T>(context: Context<T>): T | undefined {
  const scope = useComputeScope();
  return React.useMemo(() => {
    return getContext(context.id, scope?.current);
  }, [scope?.current]);
}
