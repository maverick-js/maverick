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

export interface ReactScopeRef {
  current: Scope | null;
}

const ReactScopeContext = React.createContext<ReactScopeRef>({ current: null });
ReactScopeContext.displayName = 'Scope';
export { ReactScopeContext };

export function WithScope(scope: ReactScopeRef, ...children: React.ReactNode[]) {
  return React.createElement(ReactScopeContext.Provider, { value: scope }, ...children);
}

export function useReactScope() {
  return React.useContext(ReactScopeContext).current;
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
    static override #context = context;
    static override #provide = provide;
  };
}

class ScopeProvider extends React.Component<React.PropsWithChildren> {
  static override contextType = ReactScopeContext;
  declare context: React.ContextType<typeof ReactScopeContext>;

  static #context?: Context<unknown>;
  static #provide?: () => unknown;

  #scope: ReactScopeRef;

  constructor(props, context?: Scope) {
    super(props);

    this.#scope = {
      current: createScope(),
    };

    if (context) context.append(this.#scope.current!);

    const Ctor = this.constructor as typeof ScopeProvider;
    if (Ctor.#context) provideContext(Ctor.#context, Ctor.#provide?.(), this.#scope.current!);
  }

  override render() {
    return WithScope(this.#scope, this.props?.children);
  }
}
