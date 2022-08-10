import { getParent, getContext, setContext } from '@maverick-js/observables';
import { isUndefined } from '../utils/unit';

export type Context<T> = {
  id: symbol;
  initialValue: T;
  get(): T;
  set(value: T): void;
};

export function createContext<T>(initialValue: T): Context<T> {
  const id = Symbol();
  return {
    id,
    initialValue,
    get: () => {
      if (__DEV__) {
        if (!getParent()) {
          throw Error('[maverick]: attempting to get context outside `root` or `setup` function.');
        }
      }

      const value = getContext<T>(id);
      return !isUndefined(value) ? value : initialValue;
    },
    set: (value) => {
      if (__DEV__) {
        if (!getParent()) {
          throw Error('[maverick]: attempting to set context outside `root` or `setup` function.');
        }
      }

      setContext(id, value);
    },
  };
}
