import ts from 'typescript';

export class RuntimeVariables {
  readonly declarations: ts.VariableDeclaration[] = [];

  template() {
    return this.#createVariable('$$_template');
  }

  root() {
    return this.#createVariable('$$_root');
  }

  walker() {
    return this.#createVariable('$$_walker');
  }

  element() {
    return this.#createVariable('$$_element');
  }

  component() {
    return this.#createVariable('$$_component');
  }

  expression() {
    return this.#createVariable('$$_expression');
  }

  #createVariable(name: string, init?: ts.Expression) {
    const variable = ts.factory.createVariableDeclaration(name, undefined, undefined, init);
    this.declarations.push(variable);
    return variable;
  }
}
