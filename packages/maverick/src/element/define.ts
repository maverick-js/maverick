import type { Writable } from 'type-fest';

import { isArray, isFunction } from '../std/unit';
import { isHostElement } from './create-html-element';
import type {
  AnyMaverickElement,
  ElementAttributeConverter,
  ElementDeclaration,
  ElementDefinition,
  ElementPropDefinition,
  PartialElementDeclaration,
} from './types';

export function defineElement<Element extends AnyMaverickElement>(
  declaration: PartialElementDeclaration<Element>,
): ElementDefinition<Element> {
  const definition = {
    ...(declaration as ElementDeclaration<Element>),
    setup(instance) {
      const setup = (declaration as ElementDeclaration<Element>).setup?.(instance) ?? {};
      return isFunction(setup) ? { $render: setup } : setup;
    },
    is: __SERVER__
      ? (node): node is never => false
      : (node): node is Element => isHostElement(node) && node.localName === definition.tagName,
  } as ElementDefinition<Element>;

  if ('props' in definition) {
    for (const prop of Object.values(definition.props) as Writable<ElementPropDefinition>[]) {
      if (prop.attribute !== false && !prop.converter) {
        prop.converter = createConverter(prop.initial);
      }
    }
  }

  return definition;
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
  switch (typeof value) {
    case 'string':
      return STRING_CONVERTER;
    case 'boolean':
      return BOOLEAN_CONVERTER;
    case 'number':
      return NUMBER_CONVERTER;
    case 'function':
      return FUNCTION_CONVERTER;
    default:
      return isArray(value) ? ARRAY_CONVERTER : OBJECT_CONVERTER;
  }
}
