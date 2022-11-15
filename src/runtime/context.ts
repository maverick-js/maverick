import { getContext, getScope, setContext } from '@maverick-js/observables';

export type Context<T> = {
  id: symbol;
  initial: T;
  get(): T;
  set(value: T): void;
};

const CONTEXT_MAP = Symbol();

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
  const id = Symbol();
  return {
    id,
    initial: initialValue,
    get: () => {
      if (__DEV__) {
        if (!getScope()) {
          throw Error('[maverick] attempting to get context outside `root` or `setup` function');
        }
      }

      const map = getContextMap();
      return map.has(id) ? map.get(id) : initialValue;
    },
    set: (value) => {
      if (__DEV__) {
        if (!getScope()) {
          throw Error('[maverick] attempting to set context outside `root` or `setup` function');
        }
      }

      getContextMap().set(id, value);
    },
  };
}
