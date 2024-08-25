import type { TextNode } from '../../../../parse/ast';
import type { DomVisitorContext } from '../context';

export function Text(node: TextNode, { state }: DomVisitorContext) {
  state.html.text += node.value;
}
