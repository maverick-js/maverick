import type { Simplify } from 'type-fest';

export function keysOf<T>(obj: T): (keyof T)[] {
  return Object.keys(obj as object) as (keyof T)[];
}

export function mergeProperties<A, B>(...sources: [A, B]): Omit<A, keyof B> & B;

export function mergeProperties<A, B, C>(
  ...sources: [A, B, C]
): Omit<A, keyof B | keyof C> & Omit<B, keyof C> & C;

export function mergeProperties<A, B, C, D>(
  ...sources: [A, B, C, D]
): Omit<A, keyof B | keyof C | keyof D> & Omit<B, keyof C | keyof D> & Omit<C, keyof D> & D;

export function mergeProperties<A, B, C, D, E>(
  ...sources: [A, B, C, D, E]
): Omit<A, keyof B | keyof C | keyof D | keyof E> &
  Omit<B, keyof C | keyof D | keyof E> &
  Omit<C, keyof D | keyof E> &
  Omit<D, keyof E> &
  E;

/**
 * Merges properties of the given `sources` together into a single object. All enumerable properties
 * are merged including values, getters, setters, and methods.
 */
export function mergeProperties(...sources: any[]) {
  const target = {} as any;

  for (let i = 0; i < sources.length; i++) {
    const source = sources[i];
    if (source) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    }
  }

  return target;
}

/**
 * Creates a new object composed of the picked `source` properties. All enumerable properties
 * are merged including values, getters, setters, and methods.
 */
export function pick<T, R extends keyof T>(source: T, props: R[]): Simplify<Pick<T, R>> {
  const target = {} as T;

  for (const prop of props) {
    Object.defineProperty(target, prop, Object.getOwnPropertyDescriptor(source, prop)!);
  }

  return target;
}

/**
 * The opposite of `pick`; this function creates a new object composed of the `source` properties
 * that are not included in the given `props` argument. All enumerable properties are merged
 * including values, getters, setters, and methods.
 */
export function omit<T, R extends keyof T>(source: T, props: R[]): Simplify<Omit<T, R>> {
  return pick(
    source,
    keysOf(source).filter((key) => !props.includes(key as R)),
  );
}
