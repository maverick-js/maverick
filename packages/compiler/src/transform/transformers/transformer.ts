import type MagicString from 'magic-string';
import type ts from 'typescript';

import type { ASTNode } from '../../parse/ast';
import type { TransformContext } from '../transform';

export interface Transformer {
  name: string;
  transform(data: TransformData): void;
}

export interface TransformData {
  code: MagicString;
  sourceFile: ts.SourceFile;
  jsx: ASTNode[];
  ctx: TransformContext;
}
