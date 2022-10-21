import { isArray } from '../utils/unit';
import type { AttributeTransformer, ElementPropDefinition } from './types';

export function property<T>(
  initialValue: T,
  options?: Omit<ElementPropDefinition<T>, 'initialValue'>,
): ElementPropDefinition<T> {
  const createTransformer = (): AttributeTransformer<any> => {
    const type = typeof initialValue;
    if (type === 'string') {
      return { from: (v) => (v === null ? '' : v + '') };
    } else if (type === 'number') {
      return { from: (v) => (v === null ? 0 : Number(v)) };
    } else if (type === 'boolean') {
      return { from: (v) => v !== null, to: (v) => (v ? '' : null) };
    } else if (type === 'function') {
      return { from: false, to: () => null };
    } else {
      return {
        from: (v) => (v === null ? (isArray(initialValue) ? [] : {}) : JSON.parse(v)),
        to: (v) => JSON.stringify(v),
      };
    }
  };

  return {
    initialValue,
    ...options,
    transform: options?.transform ?? createTransformer(),
  };
}
