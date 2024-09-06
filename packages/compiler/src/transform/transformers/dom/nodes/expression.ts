import { encode } from 'html-entities';

import { type ExpressionNode, isElementNode, isFragmentNode, Scope } from '../../../../parse/ast';
import { trimQuotes } from '../../../../utils/print';
import { $, getUniqueNameForNode, transformAstNodeChildren } from '../../ts-factory';
import { insert } from '../position';
import type { DomVisitorContext } from '../state';
import { transform } from '../transform';

export function Expression(node: ExpressionNode, { state, walk }: DomVisitorContext) {
  const { hydratable } = state;

  // Transform all child JSX elements before inserting.
  if (node.children) {
    node.expression = transformAstNodeChildren(node, transform, (childNode) => {
      return state.child(childNode, new Scope());
    });
  }

  if (state.element && !node.dynamic) {
    state.html += encode(trimQuotes(node.expression.getText()));
  } else {
    // We wrap dynamic expressions in a function to ensure hydration is in the correct order.
    const arg = hydratable && node.dynamic ? $.arrowFn([], node.expression) : node.expression;
    state.args.push(arg);

    const rootElement = walk.path.find(isElementNode);
    if (rootElement) {
      const id = getUniqueNameForNode(arg);
      insert(rootElement, hydratable ? $.call(id) : id, node, state, walk);
    }
  }
}
