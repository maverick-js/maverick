import { isArray } from './unit';

// This only exists because array.flat(Infinity) is slow.
export function flattenArray<T>(array: (T | T[])[]): T[] {
  const flat: T[] = [];

  for (let i = 0; i < array.length; i++) {
    if (isArray(array[i])) {
      flat.push(...flattenArray(array[i] as T[]));
    } else {
      flat.push(array[i] as T);
    }
  }

  return flat;
}
