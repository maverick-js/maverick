import type { TextNode } from '../../../../parse/ast';
import type { DomVisitorContext } from '../state';

export function Text(node: TextNode, { state, walk }: DomVisitorContext) {
  state.html += node.value;
}
