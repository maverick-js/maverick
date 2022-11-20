import { getElementInstance } from '../element/internal';
import type { ElementEventRecord, ElementInstanceHost, ElementPropRecord } from '../element/types';

export function useHost<
  Props extends ElementPropRecord = ElementPropRecord,
  Events extends ElementEventRecord = ElementEventRecord,
>(): ElementInstanceHost<Props, Events> {
  const instance = getElementInstance();

  if (!instance) {
    throw Error(
      __DEV__
        ? '[maverick] called `useHost` outside of root or setup function'
        : '[maverick] useHost',
    );
  }

  return instance.host;
}
