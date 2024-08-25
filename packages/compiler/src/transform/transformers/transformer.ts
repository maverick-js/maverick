import type MagicString from 'magic-string';
import type ts from 'typescript';

import type { AstNode } from '../../parse/ast';
import type { TransformContext } from '../transform';

export interface Transformer {
  name: string;
  transform(data: TransformData): ts.SourceFile;
}

export interface TransformData {
  sourceFile: ts.SourceFile;
  nodes: AstNode[];
  ctx: TransformContext;
}

export interface Transform<State> {
  (node: AstNode, state: State): ts.Expression | undefined;
}
