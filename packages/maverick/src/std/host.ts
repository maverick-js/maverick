import { getElementInstance } from '../element/internal';
import type {
  AnyMaverickElement,
  ElementInstanceHost,
  InferElementEvents,
  InferElementProps,
  MaverickElement,
} from '../element/types';

export function useHost<
  Element extends AnyMaverickElement = MaverickElement,
>(): ElementInstanceHost<InferElementProps<Element>, InferElementEvents<Element>> {
  const instance = getElementInstance();

  if (!instance) {
    throw Error(__DEV__ ? '[maverick] called `useHost` outside of root or setup function' : '');
  }

  return instance.host;
}
