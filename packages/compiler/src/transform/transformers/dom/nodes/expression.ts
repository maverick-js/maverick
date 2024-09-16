import { trimQuotes } from '@maverick-js/std';
import { $, getArgId } from '@maverick-js/ts';
import { encode } from 'html-entities';

import { type ExpressionNode, isElementNode, Scope } from '../../../../parse/ast';
import { isHigherOrderExpression, transformAstNodeChildren } from '../../factory';
import { insert } from '../position';
import type { DomVisitorContext } from '../state';
import { transform } from '../transform';

export function Expression(node: ExpressionNode, { state, walk }: DomVisitorContext) {
  // Transform all child JSX elements before inserting.
  if (node.children) {
    node.expression = transformAstNodeChildren(node, transform, (childNode) => {
      return state.child(childNode, new Scope());
    });
  }

  if (state.element && !node.dynamic) {
    state.html += encode(trimQuotes(node.expression.getText()));
  } else if (node.dynamic) {
    const shouldWrap = state.hydratable && isHigherOrderExpression(node);
    node.expression = shouldWrap ? $.arrowFn([], node.expression) : node.expression;

    state.args.push(node.expression);

    const id = getArgId(node.expression),
      rootElement = walk.path.find(isElementNode);

    if (rootElement) {
      const value = shouldWrap ? $.call(id) : id;
      insert(rootElement, value, node, state, walk);
    }
  }
}
