import { type FragmentNode } from '../../../../parse/ast';
import type { SsrVisitorContext } from '../state';

export function Fragment(node: FragmentNode, { walk }: SsrVisitorContext) {
  walk.children();
}
