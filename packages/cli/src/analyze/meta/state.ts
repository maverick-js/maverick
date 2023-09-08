import ts from 'typescript';

import { escapeQuotes } from '../../utils/str';
import { getDocs } from '../utils/docs';
import { buildTypeMeta } from '../utils/types';
import { getPropertiesAndGetters, getValueNode } from '../utils/walk';
import type { StateMeta } from './component';
import { getDocTags, hasDocTag } from './doctags';
import { TS_NODE } from './symbols';

export function buildStateMeta(
  checker: ts.TypeChecker,
  staticProp: ts.PropertyDeclaration | undefined,
  typeRoot: ts.Type | undefined,
): StateMeta[] | undefined {
  if (!typeRoot) return;

  const meta: StateMeta[] = [],
    propTypes = checker.getPropertiesOfType(typeRoot);

  if (propTypes.length > 0) {
    const factory = staticProp?.initializer && getValueNode(checker, staticProp.initializer),
      stateArg = factory && ts.isNewExpression(factory) && factory.arguments?.[0],
      values = stateArg ? getPropertiesAndGetters(checker, stateArg) : null;

    for (const symbol of propTypes) {
      const signature = symbol.declarations?.[0];
      if (!signature || !ts.isPropertySignature(signature)) continue;

      const name = escapeQuotes(signature.name.getText()),
        type = checker.getTypeOfSymbol(symbol),
        value = values?.get(name),
        docs = getDocs(checker, signature.name as ts.Identifier),
        doctags = getDocTags(signature),
        filteredDoctags = doctags?.filter(
          (tag) => tag.name !== 'readonly' && tag.name !== 'deprecated',
        ),
        readonly =
          (value && ts.isGetAccessorDeclaration(value)) ||
          !!signature?.modifiers?.some((mode) => mode.kind === ts.SyntaxKind.ReadonlyKeyword) ||
          (doctags && hasDocTag(doctags, 'readonly')),
        deprecated = doctags && hasDocTag(doctags, 'deprecated'),
        defaultValue =
          value && ts.isPropertyAssignment(value) ? value.initializer.getText() : undefined;

      meta.push({
        [TS_NODE]: signature,
        name,
        type: buildTypeMeta(checker, type),
        docs,
        doctags: filteredDoctags?.length ? filteredDoctags : undefined,
        default: defaultValue,
        readonly: readonly ? true : undefined,
        deprecated: deprecated ? true : undefined,
      });
    }
  }

  return meta.length ? meta : undefined;
}
