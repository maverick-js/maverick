import { isString } from '@maverick-js/std';
import ts from 'typescript';

import { $, createVariableStatement } from '../ts-factory';

export class Variables {
  readonly declarations: ts.VariableDeclaration[] = [];

  getFirstName() {
    const name = this.declarations[0]?.name;
    if (name && ts.isArrayBindingPattern(name)) {
      return (name?.elements[0] as ts.BindingElement)?.name as ts.Identifier;
    } else {
      return name as ts.Identifier | undefined;
    }
  }

  toStatement() {
    return createVariableStatement(this.declarations);
  }

  clear() {
    this.declarations.length = 0;
  }

  protected addVariable<T extends string | ts.BindingName>(name: T, init?: ts.Expression) {
    const variable = $.var(isString(name) ? name : name, init);
    this.declarations.push(variable);
    return variable;
  }
}
