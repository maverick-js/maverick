import { getElementInstance } from '../element/internal';
import type {
  AnyCustomElement,
  CustomElementInstanceHost,
  HTMLCustomElement,
} from '../element/types';

export function useHost<
  Element extends AnyCustomElement = HTMLCustomElement,
>(): CustomElementInstanceHost<Element> {
  const instance = getElementInstance();

  if (!instance) {
    throw Error(__DEV__ ? '[maverick] called `useHost` outside of root or setup function' : '');
  }

  return instance.host as CustomElementInstanceHost<Element>;
}
