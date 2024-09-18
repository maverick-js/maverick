import type { FragmentNode } from '../../../../parse/ast';
import { createReactNode } from '../react-node';
import type { ReactVisitorContext } from '../state';

export function Fragment(node: FragmentNode, { state, walk }: ReactVisitorContext) {
  const id = state.runtime.add('ReactFragment');
  state.appendNode(createReactNode(id), walk);
}
