import { $ } from '@maverick-js/ts';

import type { TextNode } from '../../../../parse/ast';
import type { ReactVisitorContext } from '../state';

export function Text(node: TextNode, { state }: ReactVisitorContext) {
  state.node?.children.push($.string(node.value));
}
