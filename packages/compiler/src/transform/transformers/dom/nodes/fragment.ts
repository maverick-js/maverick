import { type FragmentNode, isElementNode, Scope } from '../../../../parse/ast';
import { $, transformAstNodeChildren } from '../../ts-factory';
import type { DomVisitorContext } from '../state';
import { transform } from '../transform';

export function Fragment(node: FragmentNode, { state, walk }: DomVisitorContext) {
  const parentNode = walk.path.at(-1),
    hasParentElement = Boolean(parentNode && isElementNode(parentNode));

  // If the fragment has no parent element, we create an array containing each child render function.
  if (!hasParentElement) {
    const oldFragment = node.node,
      newFragment = transformAstNodeChildren(node, transform, state.child.bind(state));
    $.updateJsxFragment(
      oldFragment,
      newFragment.openingFragment,
      newFragment.children,
      newFragment.closingFragment,
    );
  } else {
    walk.children();
  }
}
