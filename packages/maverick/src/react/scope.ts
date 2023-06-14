import { getContext } from '@maverick-js/signals';
import * as React from 'react';

import { type Context, provideContext } from '../core/context';
import { createScope } from '../core/signals';
import type { Scope } from '../core/signals';

export interface ReactScopeProvider {
  new (props: React.PropsWithChildren): React.Component<React.PropsWithChildren>;
}

export interface ReactContextProvider {
  new (props: React.PropsWithChildren): React.Component<React.PropsWithChildren>;
}

const ReactScopeContext = React.createContext<Scope | null>(null);
ReactScopeContext.displayName = 'Scope';
export { ReactScopeContext };

export function WithScope(scope: Scope, ...children: React.ReactNode[]) {
  return React.createElement(ReactScopeContext.Provider, { value: scope }, ...children);
}

export function useReactScope(): Scope | null {
  return React.useContext(ReactScopeContext);
}

export function useReactContext<T>(context: Context<T>): T | undefined {
  const scope = useReactScope();
  return React.useMemo(() => getContext(context.id, scope), [scope]);
}

export function createReactScopeProvider(): ReactScopeProvider {
  return ScopeProvider;
}

export function createReactContextProvider<T>(
  context: Context<T>,
  provide?: () => T,
): ReactContextProvider {
  return class ContextProvider extends ScopeProvider {
    static override _context = context;
    static override _provide = provide;
  };
}

class ScopeProvider extends React.Component<React.PropsWithChildren> {
  static override contextType = ReactScopeContext;
  declare context: React.ContextType<typeof ReactScopeContext>;

  static _context?: Context<unknown>;
  static _provide?: () => unknown;

  private _scope: Scope;

  constructor(props, context?: Scope) {
    super(props);

    this._scope = createScope();
    if (context) context.append(this._scope);

    const Ctor = this.constructor as typeof ScopeProvider;
    if (Ctor._context) provideContext(Ctor._context, Ctor._provide?.(), this._scope);
  }

  override render() {
    return WithScope(this._scope, this.props?.children);
  }
}
