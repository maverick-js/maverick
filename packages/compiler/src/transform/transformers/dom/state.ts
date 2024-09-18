import type ts from 'typescript';

import { type AstNode, type ElementNode, Scope } from '../../../parse/ast';
import type { VisitorContext } from '../../../parse/walk';
import { DomRuntime } from './runtime';
import { DomSetupVariables } from './vars';

export class DomTransformState {
  readonly root: AstNode | null;
  readonly scope: Scope;
  readonly elements: Map<ElementNode, ts.Identifier> = new Map();
  readonly args: ts.Expression[] = [];
  readonly block: ts.Expression[] = [];
  readonly renders: ts.FunctionDeclaration[];
  readonly hydratable: boolean;
  readonly runtime: DomRuntime;
  readonly delegatedEvents: Set<string>;
  readonly children: DomTransformState[] = [];
  readonly vars: Readonly<{ setup: DomSetupVariables }>;

  html = '';

  template?: ts.Identifier;
  element?: ts.Identifier;
  walker?: ts.Identifier;

  constructor(root: AstNode | null, init?: Partial<DomTransformState>) {
    this.root = root;
    this.scope = init?.scope ?? new Scope();
    this.renders = init?.renders ?? [];
    this.runtime = init?.runtime ?? new DomRuntime();
    this.vars = { setup: new DomSetupVariables(this.runtime) };
    this.hydratable = init?.hydratable ?? false;
    this.delegatedEvents = init?.delegatedEvents ?? new Set();
  }

  child(root: AstNode, scope?: Scope) {
    const childState = new DomTransformState(root, {
      ...this,
      scope: scope ?? this.scope.child(),
    });

    this.children.push(childState);

    return childState;
  }

  walk<T>(callback: (state: DomTransformState) => T) {
    for (const childState of this.children) {
      callback(childState);
      childState.walk(callback);
    }
  }
}

export interface DomVisitorContext extends VisitorContext<DomTransformState> {}

/**
 * We can inherit an existing state to ensure globally tracked state such as templates, runtime
 * calls, and delegated events are not lost.
 */
export function createDomTransformState(root: AstNode | null, init?: Partial<DomTransformState>) {
  return new DomTransformState(root, init);
}
