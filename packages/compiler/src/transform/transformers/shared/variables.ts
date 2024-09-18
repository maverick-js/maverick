import { isString } from '@maverick-js/std';
import { $, createVariableStatement } from '@maverick-js/ts';
import ts from 'typescript';

export class Variables {
  readonly declarations: ts.VariableDeclaration[] = [];

  get length() {
    return this.declarations.length;
  }

  getFirstName() {
    const name = this.declarations[0]?.name;
    if (name && ts.isArrayBindingPattern(name)) {
      return (name?.elements[0] as ts.BindingElement)?.name as ts.Identifier;
    } else {
      return name as ts.Identifier | undefined;
    }
  }

  create<T extends string | ts.BindingName>(name: T, init?: ts.Expression) {
    const variable = $.var(isString(name) ? $.createUniqueName(name) : name, init);
    this.declarations.push(variable);
    return variable as ts.VariableDeclaration & {
      readonly name: T extends string ? ts.Identifier : ts.BindingName;
    };
  }

  clear() {
    this.declarations.length = 0;
  }

  get(name: ts.Identifier) {
    return this.declarations.find((declaration) => declaration.name === name);
  }

  update(name: ts.Identifier, value: ts.Expression) {
    const declaration = this.get(name);
    // @ts-expect-error - override readonly
    if (declaration) declaration.initializer = value;
  }

  toStatement() {
    return createVariableStatement(this.declarations);
  }
}
