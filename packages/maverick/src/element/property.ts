import type { ElementPropDefinition } from './types';

export function defineProp<T>(
  initialValue: T,
  options?: Omit<ElementPropDefinition<T>, 'initial'>,
): ElementPropDefinition<T> {
  return {
    initial: initialValue,
    ...options,
  };
}
