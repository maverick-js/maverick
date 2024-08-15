import type * as React from 'react';

export function setRef(ref: React.Ref<unknown> | null | undefined, value: unknown) {
  if (typeof ref === 'function') {
    (ref as (e: unknown) => void)(value);
  } else if (ref) {
    (ref as { current: unknown }).current = value;
  }
}

export type MaybeRef<T> = React.Ref<T> | undefined;

export function composeRefs<T>(...refs: MaybeRef<T>[]) {
  return (node: T) => refs.forEach((ref) => setRef(ref, node));
}
