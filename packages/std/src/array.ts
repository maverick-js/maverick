import { isArray } from './unit';

export function uniqueItemsOnly<T>(items: T[]): T[] {
  return [...new Set(items)];
}

export function filterFalsy<T>(array: (T | false | null | undefined)[]): T[] {
  return array.filter(Boolean) as T[];
}

// This only exists because array.flat(Infinity) is slow.
export function flattenArray<T>(array: (T | T[])[]): T[] {
  const flat: T[] = [];

  for (let i = 0; i < array.length; i++) {
    if (isArray(array[i])) {
      flat.push(...flattenArray(array[i] as T[]));
    } else if (array[i] || array[i] === 0) {
      flat.push(array[i] as T);
    }
  }

  return flat;
}
