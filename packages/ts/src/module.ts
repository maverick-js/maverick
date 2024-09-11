import ts from 'typescript';

export function getModuleExportNameText(name: ts.ModuleExportName) {
  return ts.isStringLiteral(name) ? name.text : (name.escapedText as string);
}

export function getNamedImportBindings(node: ts.ImportDeclaration) {
  const bindings = node.importClause?.namedBindings;

  if (bindings && ts.isNamedImports(bindings)) {
    return bindings.elements;
  }
}

export function findImportSpecifierFromDeclaration(
  node: ts.ImportDeclaration,
  importSpecifier: string,
) {
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
