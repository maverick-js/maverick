import { getContext, getScope, setContext } from '@maverick-js/observables';

export type Context<T> = {
  id: symbol;
  initial: T;
  (): T;
  set(value: T): void;
  next(next: (prevValue: T) => T): void;
};

const CONTEXT_MAP = Symbol(__DEV__ ? 'CONTEXT_MAP' : 0);

export type ContextMap = Map<string | symbol, any>;

export function getContextMap(): ContextMap {
  let map = getContext(CONTEXT_MAP) as ContextMap;

  if (!map) {
    map = new Map();
    setContextMap(map);
  }

  return map;
}

export function setContextMap(map: ContextMap) {
  setContext(CONTEXT_MAP, map);
}

export function createContext<T>(initialValue: T): Context<T> {
  let id = Symbol(__DEV__ ? 'CONTEXT' : 0);

  const context: Context<T> = () => {
    if (__DEV__) {
      if (!getScope()) {
        throw Error(
          __DEV__
            ? '[maverick] attempting to get context outside `root` or `setup` function'
            : '[maverick] context',
        );
      }
    }

    const map = getContextMap();
    return map.has(id) ? map.get(id) : initialValue;
  };

  context.id = id;
  context.initial = initialValue;
  context.set = (value) => {
    if (__DEV__) {
      if (!getScope()) {
        throw Error(
          __DEV__
            ? '[maverick] attempting to set context outside `root` or `setup` function'
            : '[maverick] context.set',
        );
      }
    }

    getContextMap().set(id, value);
  };
  context.next = (next) => context.set(next(context()));
  return context;
}
