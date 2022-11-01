import { isArray } from '../utils/unit';
import type { ElementAttributeConverter, ElementPropDefinition } from './types';

export function defineProp<T>(
  initialValue: T,
  options?: Omit<ElementPropDefinition<T>, 'initial'>,
): ElementPropDefinition<T> {
  return {
    initial: initialValue,
    ...options,
    converter: options?.converter ?? createConverter(initialValue),
  };
}

const STRING_CONVERTER: ElementAttributeConverter<string> = {
  from: (v) => (v === null ? '' : v + ''),
};

const NUMBER_CONVERTER: ElementAttributeConverter<number> = {
  from: (v) => (v === null ? 0 : Number(v)),
};

const BOOLEAN_CONVERTER: ElementAttributeConverter<boolean> = {
  from: (v) => v !== null,
  to: (v) => (v ? '' : null),
};

const FUNCTION_CONVERTER: ElementAttributeConverter<() => void> = {
  from: false,
  to: () => null,
};

const ARRAY_CONVERTER: ElementAttributeConverter<unknown[]> = {
  from: (v) => (v === null ? [] : JSON.parse(v)),
  to: (v) => JSON.stringify(v),
};

const OBJECT_CONVERTER: ElementAttributeConverter<object> = {
  from: (v) => (v === null ? {} : JSON.parse(v)),
  to: (v) => JSON.stringify(v),
};

function createConverter(value: unknown): ElementAttributeConverter<any> {
  const type = typeof value;
  if (type === 'string') {
    return STRING_CONVERTER;
  } else if (type === 'number') {
    return NUMBER_CONVERTER;
  } else if (type === 'boolean') {
    return BOOLEAN_CONVERTER;
  } else if (type === 'function') {
    return FUNCTION_CONVERTER;
  } else if (isArray(value)) {
    return ARRAY_CONVERTER;
  } else {
    return OBJECT_CONVERTER;
  }
}
