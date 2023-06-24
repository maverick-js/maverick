import ts from 'typescript';

import { LogLevel, reportDiagnosticByNode } from '../../utils/logger';
import { escapeQuotes } from '../../utils/str';
import { getProperties } from '../utils/walk';
import { TS_NODE } from './component';
import type { AttrsMeta } from './element';

export function buildAttrsMeta(
  checker: ts.TypeChecker,
  staticProp: ts.PropertyDeclaration | undefined,
): AttrsMeta | undefined {
  if (!staticProp) return undefined;

  const attrs: AttrsMeta = {},
    props = getProperties(checker, staticProp.initializer!);

  for (const [propName, assignment] of props) {
    const attr = ts.isStringLiteral(assignment.initializer)
      ? assignment.initializer
      : getProperties(checker, assignment.initializer).get('attr')?.initializer;

    if (!attr || (!ts.isStringLiteral(attr) && attr.kind !== ts.SyntaxKind.FalseKeyword)) {
      reportDiagnosticByNode('expected string or false', assignment, LogLevel.Warn);
      continue;
    }

    attrs[propName] = {
      [TS_NODE]: assignment,
      attr: ts.isStringLiteral(attr) ? escapeQuotes(attr.getText()) : false,
    };
  }

  return Object.keys(attrs).length ? attrs : undefined;
}
