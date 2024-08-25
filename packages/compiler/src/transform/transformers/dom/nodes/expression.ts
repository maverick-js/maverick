import { encode } from 'html-entities';

import { type ExpressionNode, isElementNode, isFragmentNode, Scope } from '../../../../parse/ast';
import { trimQuotes } from '../../../../utils/print';
import { $, getUniqueNameForNode, transformAstNodeChildren } from '../../ts-factory';
import type { DomVisitorContext } from '../context';
import { insert } from '../position';
import { transform } from '../transform';

export function Expression(node: ExpressionNode, { state, walk }: DomVisitorContext) {
  // Transform all child JSX elements before inserting.
  if (node.children) {
    node.expression = transformAstNodeChildren(node, transform, (childNode) => {
      return state.createChild(childNode, new Scope());
    });
  }

  if (state.template && !node.dynamic) {
    state.html.text += encode(trimQuotes(node.expression.getText()));
  } else {
    // We wrap dynamic expressions in a function to ensure hydration is in the correct order.
    const arg = state.hydratable && node.dynamic ? $.arrowFn([], node.expression) : node.expression;
    state.args.push(arg);

    const rootElement = walk.path.find(isElementNode);
    if (rootElement) {
      const id = getUniqueNameForNode(arg);
      insert(rootElement, state.hydratable ? $.call(id) : id, node, state, walk);
    }
  }
}
