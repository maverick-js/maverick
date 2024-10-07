import {
  $,
  addClassMembers,
  createImports,
  createStaticComputedMethod,
  findImportDeclarationFromModule,
  findImportSpecifierFromDeclaration,
  findStaticProp,
  isClassThatExtends,
} from '@maverick-js/ts';
import ts from 'typescript';

export function setupCustomElements(
  sourceFile: ts.SourceFile,
  register: (component: ts.ClassDeclaration) => ts.Expression,
  registerImports: ts.Statement[] = [],
): ts.SourceFile {
  const maverickImport = findImportDeclarationFromModule(sourceFile, 'maverick.js'),
    maverickComponent = findImportSpecifierFromDeclaration(maverickImport, 'Component');

  if (maverickComponent) {
    let statements: ts.Statement[] = [],
      hasCustomElement = false;

    for (const statement of sourceFile.statements) {
      if (isMaverickElementClass(statement, maverickComponent)) {
        const newClass = addClassMembers(statement, [
          createStaticElementRegistration(register(statement)),
        ]);

        statements.push(newClass);
        hasCustomElement = true;
      } else {
        statements.push(statement);
      }
    }

    return hasCustomElement
      ? $.updateSourceFile(sourceFile, [
          ...registerImports,
          createCustomElementSymbolImport(),
          ...statements,
        ])
      : sourceFile;
  }

  return sourceFile;
}

const CUSTOM_ELEMENT_SYMBOL_NAME = 'CUSTOM_ELEMENT_SYMBOL';

function createCustomElementSymbolImport() {
  return createImports([$.id(CUSTOM_ELEMENT_SYMBOL_NAME)], 'maverick.js');
}

function createStaticElementRegistration(registration: ts.Expression) {
  return createStaticComputedMethod(
    $.id(CUSTOM_ELEMENT_SYMBOL_NAME),
    [],
    [$.createReturnStatement(registration)],
  );
}

function isMaverickElementClass(
  node: ts.Node,
  specifier: ts.ImportSpecifier,
): node is ts.ClassDeclaration {
  return isClassThatExtends(node, specifier.name) && !!findStaticProp(node, 'element');
}
