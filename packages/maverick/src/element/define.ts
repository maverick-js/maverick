import type { Writable } from 'type-fest';

import { isArray, isFunction } from '../std/unit';
import { isHostElement } from './create-html-element';
import type {
  AnyCustomElement,
  CustomElementAttributeConverter,
  CustomElementDeclaration,
  CustomElementDefinition,
  CustomElementPropDefinition,
  PartialCustomElementDeclaration,
} from './types';

export function defineCustomElement<Element extends AnyCustomElement>(
  declaration: PartialCustomElementDeclaration<Element>,
): CustomElementDefinition<Element> {
  const definition = {
    ...(declaration as CustomElementDeclaration<Element>),
    setup(instance) {
      const setup = (declaration as CustomElementDeclaration<Element>).setup?.(instance) ?? {};
      return isFunction(setup) ? { $render: setup } : setup;
    },
    is: __SERVER__
      ? (node): node is never => false
      : (node): node is Element => isHostElement(node) && node.localName === definition.tagName,
  } as CustomElementDefinition<Element>;

  if ('props' in definition) {
    for (const prop of Object.values(definition.props) as Writable<CustomElementPropDefinition>[]) {
      if (prop.attribute !== false && !prop.converter) {
        prop.converter = createConverter(prop.initial);
      }
    }
  }

  return definition;
}

const STRING_CONVERTER: CustomElementAttributeConverter<string> = {
  from: (v) => (v === null ? '' : v + ''),
};

const NUMBER_CONVERTER: CustomElementAttributeConverter<number> = {
  from: (v) => (v === null ? 0 : Number(v)),
};

const BOOLEAN_CONVERTER: CustomElementAttributeConverter<boolean> = {
  from: (v) => v !== null,
  to: (v) => (v ? '' : null),
};

const FUNCTION_CONVERTER: CustomElementAttributeConverter<() => void> = {
  from: false,
  to: () => null,
};

const ARRAY_CONVERTER: CustomElementAttributeConverter<unknown[]> = {
  from: (v) => (v === null ? [] : JSON.parse(v)),
  to: (v) => JSON.stringify(v),
};

const OBJECT_CONVERTER: CustomElementAttributeConverter<object> = {
  from: (v) => (v === null ? {} : JSON.parse(v)),
  to: (v) => JSON.stringify(v),
};

function createConverter(value: unknown): CustomElementAttributeConverter<any> {
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
