import type ts from 'typescript';

import type { AstNode } from '../../parse/ast';
import type { TransformContext } from '../transform';

export interface Transform {
  (data: TransformData): ts.SourceFile;
}

export interface TransformData {
  sourceFile: ts.SourceFile;
  nodes: AstNode[];
  ctx: TransformContext;
}

export interface StateTransform<State> {
  (node: AstNode, state: State): StateTransformResult;
}

export type StateTransformResult = ts.Expression | Array<ts.Expression | ts.Statement> | undefined;
