import type ts from 'typescript';

import type { AstNode, ElementNode, Scope } from '../../../parse/ast';
import type { VisitorContext } from '../../../parse/walk';
import type { DomRuntime } from './runtime';
import type { DomBlockVariables, DomTemplateVariables } from './vars';

export type DomArgsTuple = [id: ts.Identifier, value: ts.Expression];

export interface DomTransformState {
  readonly root: AstNode | null;
  readonly scope: Scope;
  readonly elements: Map<ElementNode, ts.Identifier>;
  readonly args: ts.Expression[];
  readonly block: ts.Expression[];
  readonly renders: ts.FunctionDeclaration[];
  template?: ts.VariableDeclaration & { name: ts.Identifier };
  walker?: ts.Identifier;
  readonly html: ts.StringLiteral;
  readonly hydratable: boolean;
  readonly runtime: DomRuntime;
  readonly vars: {
    readonly block: DomBlockVariables;
    readonly template: DomTemplateVariables;
  };
  readonly delegatedEvents: Set<string>;
  readonly children: DomTransformState[];
  createChild(root: AstNode, scope?: Scope): DomTransformState;
}

export interface DomVisitorContext extends VisitorContext<DomTransformState> {}

export function walkStateChildren<T>(
  state: DomTransformState,
  callback: (state: DomTransformState) => T,
) {
  for (const childState of state.children) {
    const result = callback(childState);
    if (result) return result;
    return walkStateChildren(childState, callback);
  }
}
