import type MagicString from 'magic-string';
import type ts from 'typescript';

export function overwriteNode(code: MagicString, node: ts.Node, content: string) {
  const start = node.getStart(node.getSourceFile()),
    end = node.getEnd();
  code.overwrite(start, end, content);
}
