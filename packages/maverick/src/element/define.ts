import type { Writable } from 'type-fest';

import { isArray, isFunction } from '../std/unit';
import { isHostElement } from './create-html-element';
import type {
  ElementAttributeConverter,
  ElementCSSVarRecord,
  ElementDeclaration,
  ElementDefinition,
  ElementEventRecord,
  ElementMembers,
  ElementPropDefinition,
  ElementPropRecord,
  MaverickElement,
} from './types';

export function defineElement<
  Props extends ElementPropRecord,
  Events extends ElementEventRecord,
  CSSVars extends ElementCSSVarRecord,
  Members extends ElementMembers,
>(
  declaration: ElementDeclaration<Props, Events, CSSVars, Members>,
): ElementDefinition<Props, Events, CSSVars, Members> {
  const definition: ElementDefinition<Props, Events, CSSVars, Members> = {
    ...declaration,
    setup(instance) {
      const setup = declaration.setup?.(instance) ?? {};
      return (isFunction(setup) ? { $render: setup } : setup) as Members;
    },
    is: __SERVER__
      ? (node): node is never => false
      : (node): node is MaverickElement<Props, Events> & Members =>
          isHostElement(node) && node.localName === definition.tagName,
  };

  if (definition.props) {
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
