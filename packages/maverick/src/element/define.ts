import type { Writable } from 'type-fest';

import { isArray, isFunction } from '../std/unit';
import type {
  AnyCustomElement,
  CustomElementAttributeType,
  CustomElementDeclaration,
  CustomElementDefinition,
  CustomElementInstance,
  CustomElementPropDefinition,
  PartialCustomElementDeclaration,
} from './types';

export function defineCustomElement<T extends AnyCustomElement>(
  declaration: PartialCustomElementDeclaration<T>,
): CustomElementDefinition<T> {
  const definition = {
    ...(declaration as CustomElementDeclaration<T>),
    setup(instance) {
      const setup =
        (declaration as CustomElementDeclaration<T>).setup?.(
          instance as CustomElementInstance<T>,
        ) ?? {};
      return isFunction(setup) ? { $render: setup } : setup;
    },
  } as CustomElementDefinition<T>;

  if ('props' in definition) {
    for (const prop of Object.values(definition.props) as Writable<CustomElementPropDefinition>[]) {
      if (prop.attribute !== false && !prop.type) {
        prop.type = inferAttributeType(prop.initial);
      }
    }
  }

  return definition;
}

export const STRING: CustomElementAttributeType<string> = {
  from: (v) => (v === null ? '' : v + ''),
};

export const NUMBER: CustomElementAttributeType<number> = {
  from: (v) => (v === null ? 0 : Number(v)),
};

export const BOOLEAN: CustomElementAttributeType<boolean> = {
  from: (v) => v !== null,
  to: (v) => (v ? '' : null),
};

export const FUNCTION: CustomElementAttributeType<() => void> = {
  from: false,
  to: () => null,
};

export const ARRAY: CustomElementAttributeType<unknown[]> = {
  from: (v) => (v === null ? [] : JSON.parse(v)),
  to: (v) => JSON.stringify(v),
};

export const OBJECT: CustomElementAttributeType<object> = {
  from: (v) => (v === null ? {} : JSON.parse(v)),
  to: (v) => JSON.stringify(v),
};

export function inferAttributeType(value: unknown): CustomElementAttributeType<any> {
  switch (typeof value) {
    case 'undefined':
      return STRING;
    case 'string':
      return STRING;
    case 'boolean':
      return BOOLEAN;
    case 'number':
      return NUMBER;
    case 'function':
      return FUNCTION;
    case 'object':
      return isArray(value) ? ARRAY : OBJECT;
    default:
      return STRING;
  }
}
