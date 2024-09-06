import { encode } from 'html-entities';
import ts from 'typescript';

import { type ExpressionNode, isElementNode } from '../../../../parse/ast';
import {
  isJsxRootNode,
  isLogicalAndExpression,
  isNullishCoalescing,
  isNullishNode,
} from '../../../../parse/utils';
import { trimQuotes } from '../../../../utils/print';
import { replaceTsNodes, transformAstNodeChildren, type TsNodeMap } from '../../ts-factory';
import type { SsrTransformState, SsrVisitorContext } from '../state';
import { transform } from '../transform';

export function Expression(node: ExpressionNode, { state, walk }: SsrVisitorContext) {
  if (!node.dynamic) {
    state.html += encode(trimQuotes(node.expression.getText()));
    return;
  }

  if (!node.children) {
    state.value(state.runtime.escape(node.expression));
    return;
  }

  node.expression = escapeExpressions(node.expression, state);
  node.expression = transformAstNodeChildren(node, transform, state.child.bind(state));

  const rootElement = walk.path.find(isElementNode);

  if (rootElement) {
    state.marker();
  }

  state.value(node.expression);
}

function escapeExpressions<T extends ts.Node>(root: T, { runtime }: SsrTransformState) {
  const map: TsNodeMap = new Map();

  function visit(node: ts.Node) {
    if (isJsxRootNode(node)) {
      // stop
    } else if (isLogicalAndExpression(node)) {
      visit(node.right);
    } else if (isNullishCoalescing(node)) {
      visit(node.left);
      visit(node.right);
    } else if (ts.isConditionalExpression(node)) {
      visit(node.whenTrue);
      visit(node.whenFalse);
    } else {
      if (!isNullishNode(node)) {
        map.set(node, runtime.escape(node as ts.Expression));
      }

      ts.forEachChild(node, visit);
    }
  }

  visit(root);

  return replaceTsNodes(root, map);
}
