import { getContext, getScope, setContext } from '@maverick-js/signals';

import { isUndefined } from '../std/unit';

export interface Context<T> {
  id: symbol;
  factory?: () => T;
}

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

  setContext(context.id, providedValue ? value : context.factory?.());
}

export function useContext<T>(context: Context<T>): T {
  const value = getContext(context.id) as T | undefined;

  if (isUndefined(value)) {
    throw Error(__DEV__ ? '[maverick] attempting to use context without providing first' : '');
  }

  return value;
}

export function hasProvidedContext(context: Context<any>): boolean {
  return !isUndefined(getContext(context.id));
}
