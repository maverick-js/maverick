import ts from 'typescript';

import { isValueImportDeclarationFrom } from './is';

export function getModuleExportNameText(name: ts.ModuleExportName) {
  return ts.isStringLiteral(name) ? name.text : (name.escapedText as string);
}

export function getNamedImportBindings(node: ts.ImportDeclaration) {
  const bindings = node.importClause?.namedBindings;
  if (bindings && ts.isNamedImports(bindings)) {
    return bindings.elements;
  }
}

export function findImportDeclarationFromModule(sourceFile: ts.SourceFile, name: string) {
  for (const statement of sourceFile.statements) {
    if (isValueImportDeclarationFrom(statement, name)) {
      return statement;
    } else if (!ts.isImportDeclaration(statement)) {
      return; // exit early
    }
  }
}

export function findImportSpecifierFromDeclaration(
  node: ts.ImportDeclaration | undefined,
  importSpecifier: string,
) {
  if (!node) return;
  const elements = getNamedImportBindings(node);
  if (!elements) return;
  return findImportSpecifierFromElements(elements, importSpecifier);
}

export function findImportSpecifierFromElements(
  elements: ts.NodeArray<ts.ImportSpecifier>,
  id: string,
) {
  return elements.find((element) => element.name.text === id);
}
