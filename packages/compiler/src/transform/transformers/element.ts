import {
  $,
  addClassMembers,
  createStaticComputedProperty,
  createSymbolFor,
  findImportDeclarationFromModule,
  findImportSpecifierFromDeclaration,
  findStaticProp,
  isClassThatExtends,
} from '@maverick-js/ts';
import ts from 'typescript';

export function markCustomElements(sourceFile: ts.SourceFile) {
  const maverickImport = findImportDeclarationFromModule(sourceFile, 'maverick.js'),
    maverickComponent = findImportSpecifierFromDeclaration(maverickImport, 'Component');

  if (maverickComponent) {
    const statements: ts.Statement[] = [];

    for (const statement of sourceFile.statements) {
      if (isMaverickElementClass(statement, maverickComponent)) {
        const newClass = addClassMembers(statement, [createStaticElementProp()]);
        statements.push(newClass);
      } else {
        statements.push(statement);
      }
    }

    return $.updateSourceFile(sourceFile, statements);
  }

  return sourceFile;
}

function createStaticElementProp() {
  return createStaticComputedProperty(createSymbolFor('element'), $.createTrue());
}

function isMaverickElementClass(
  node: ts.Node,
  component: ts.ImportSpecifier,
): node is ts.ClassDeclaration {
  return isClassThatExtends(node, component.name) && !!findStaticProp(node, 'tagName');
}
