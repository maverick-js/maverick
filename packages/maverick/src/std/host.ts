import { getElementInstance } from '../element/internal';
import type { AnyMaverickElement } from '../element/types';

export function useHost<Element extends AnyMaverickElement>(): Element {
  const instance = getElementInstance();

  if (!instance) {
    throw Error(__DEV__ ? '[maverick] called `useHost` outside of root or setup function' : '');
  }

  return instance.host as unknown as Element;
}
