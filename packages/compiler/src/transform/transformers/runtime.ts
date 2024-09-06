import ts from 'typescript';

import { $, createImports } from './ts-factory';

export abstract class Runtime {
  protected abstract pkg: string;

  readonly #record: Record<string, ts.Identifier> = {};

  get identifiers() {
    return Object.values(this.#record);
  }

  add(name: string) {
    this.id(name);
  }

  toImportDeclaration() {
    return createImports(this.identifiers, this.pkg);
  }

  protected id(name: string) {
    let id = this.#record[name];

    if (!id) {
      this.#record[name] = id = $.id(name);
    }

    return id;
  }

  protected call(name: string, args: readonly ts.Expression[] | undefined) {
    return $.createCallExpression(this.id(name), undefined, args);
  }
}
