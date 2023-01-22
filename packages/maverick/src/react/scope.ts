import { createScope, getContext } from '@maverick-js/signals';
import * as React from 'react';

import { Context, provideContext, Scope } from '../runtime';

export interface ReactScope {
  current: Scope | null;
  setups?: (() => void)[];
}

export interface ReactScopeProvider {
  new (props: React.PropsWithChildren): React.Component<React.PropsWithChildren>;
}

export interface ReactContextProvider {
  new (props: React.PropsWithChildren): React.Component<React.PropsWithChildren>;
}

export const ReactComputeScopeContext = React.createContext<ReactScope | null>(null);

export function WithReactScope(scope: ReactScope, children: React.ReactNode) {
  return React.createElement(ReactComputeScopeContext.Provider, { value: scope }, children);
}

export function useReactScope(): ReactScope | null {
  return React.useContext(ReactComputeScopeContext);
}

export function useReactContext<T>(context: Context<T>): T | undefined {
  const scope = useReactScope();
  return React.useMemo(() => {
    return getContext(context.id, scope?.current);
  }, [scope?.current]);
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
  static override contextType = ReactComputeScopeContext;
  declare context: React.ContextType<typeof ReactComputeScopeContext>;

  static _context?: Context<unknown>;
  static _provide?: () => unknown;

  private _scope: ReactScope;

  constructor(props, context?: ReactScope) {
    super(props);
    const scope = createScope();
    const ctor = this.constructor as typeof ScopeProvider;
    if (ctor._context) provideContext(ctor._context, ctor._provide?.(), scope);
    this._scope = { current: scope, setups: context?.setups || [] };
  }

  override componentDidMount(): void {
    if (this.context) return;
    const setups = this._scope.setups!;
    while (setups.length) setups.pop()!();
  }

  override render() {
    return WithReactScope(this._scope, this.props?.children);
  }
}
