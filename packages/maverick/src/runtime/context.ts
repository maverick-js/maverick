import { getContext, getScope, setContext } from '@maverick-js/observables';

export type Context<T> = {
  id: symbol;
  factory?: () => T;
};

export function createContext<T>(factory?: () => T): Context<T> {
  return { id: Symbol(), factory };
}

export function provideContext<T>(context: Context<T>, value?: T) {
  if (!getScope()) {
    throw Error(
      __DEV__ ? '[maverick] attempting to provide context outside `root` or `setup` function' : '',
    );
  }

  const providedValue = arguments.length >= 2;

  if (!providedValue && !context.factory) {
    throw Error(__DEV__ ? '[maverick] context can not be provided without a value or factory' : '');
  }

  const map = useContextMap() ?? provideContextMap();
  map.set(context.id, providedValue ? value : context.factory?.());
}

export function useContext<T>(context: Context<T>): T {
  const map = useContextMap();

  if (!map?.has(context.id)) {
    throw Error(__DEV__ ? '[maverick] attempting to use context without providing first' : '');
  }

  return map.get(context.id)!;
}

export function hasProvidedContext(context: Context<any>): boolean {
  return !!useContextMap()?.has(context.id);
}

const CONTEXT_MAP = Symbol(__DEV__ ? 'CONTEXT_MAP' : 0);

export type ContextMap = Map<string | symbol, any>;

export function useContextMap() {
  return getContext(CONTEXT_MAP) as ContextMap | undefined;
}

export function provideContextMap(map: ContextMap = new Map()) {
  setContext(CONTEXT_MAP, map);
  return map;
}
