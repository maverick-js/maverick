import { type TextNode } from '../../../../parse/ast';
import type { SsrVisitorContext } from '../state';

export function Text(node: TextNode, { state }: SsrVisitorContext) {
  state.html += node.value;
}
