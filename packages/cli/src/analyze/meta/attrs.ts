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
    let attr: ts.Node | undefined = assignment.initializer;

    if (ts.isObjectLiteralExpression(attr)) {
      attr = getProperties(checker, attr).get('attr')?.initializer;
    }

    if (
      attr &&
      attr.kind !== ts.SyntaxKind.StringLiteral &&
      attr.kind !== ts.SyntaxKind.FalseKeyword
    ) {
      reportDiagnosticByNode('expected string or false', assignment, LogLevel.Warn);
      continue;
    }

    if (attr) {
      attrs[propName] = {
        [TS_NODE]: assignment,
        attr: ts.isStringLiteral(attr) ? escapeQuotes(attr.getText()) : false,
      };
    }
  }

  return Object.keys(attrs).length ? attrs : undefined;
}
