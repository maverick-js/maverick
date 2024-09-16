import { $ } from '@maverick-js/ts';
import type ts from 'typescript';

import type { AstNode } from '../../../parse/ast';
import type { VisitorContext } from '../../../parse/walk';
import { Variables } from '../shared/variables';
import { SsrRuntime } from './runtime';

export class SsrTransformState {
  readonly root: AstNode | null;
  readonly runtime: SsrRuntime;
  readonly statics: ts.StringLiteral[] = [];
  readonly values: ts.Expression[] = [];
  readonly children: SsrTransformState[] = [];
  readonly vars: Variables;

  html = '';
  template?: ts.Identifier;

  constructor(root: AstNode | null, init?: Partial<SsrTransformState>) {
    this.root = root;
    this.runtime = init?.runtime ?? new SsrRuntime();
    this.vars = init?.vars ?? new Variables();
  }

  marker() {
    this.html += '<!$>';
  }

  value(value: ts.Expression) {
    this.values.push(value);
    this.commit();
  }

  commit() {
    if (this.html.length === 0) return;
    this.statics.push($.string(this.html));
    this.html = '';
  }

  child(root: AstNode | null) {
    const childState = new SsrTransformState(root, this);
    this.children.push(childState);
    return childState;
  }

  walk<T>(callback: (state: SsrTransformState) => T) {
    for (const childState of this.children) {
      callback(childState);
      childState.walk(callback);
    }
  }
}

export interface SsrVisitorContext extends VisitorContext<SsrTransformState> {}

export function createSsrTransformState(root: AstNode | null, init?: Partial<SsrTransformState>) {
  return new SsrTransformState(root, init);
}
