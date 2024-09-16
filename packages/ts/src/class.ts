import ts from 'typescript';

import { isIdentifierWithText, isStaticPropDeclaration } from './is';
import { getModuleExportNameText } from './module';

export function isClassThatExtends(
  node: ts.Node,
  className: ts.StringLiteral | ts.Identifier,
): node is ts.ClassDeclaration {
  const classNameText = getModuleExportNameText(className);
  return ts.isClassDeclaration(node) && !!findHeritageClauseByName(node, classNameText);
}

export function findHeritageClauseByName(node: ts.ClassDeclaration, name: string) {
  return node.heritageClauses?.find((clause) =>
    clause.types.find(
      (type) =>
        ts.isExpressionWithTypeArguments(type) && isIdentifierWithText(type.expression, name),
    ),
  );
}

export function findStaticProp(node: ts.ClassDeclaration | undefined, name: string) {
  return node?.members
    .filter(isStaticPropDeclaration)
    .find((member) => isIdentifierWithText(member.name, name));
}

export function findClassThatExtendsModuleExport(
  sourceFile: ts.SourceFile,
  className: ts.ModuleExportName,
) {
  for (const statement of sourceFile.statements) {
    if (isClassThatExtends(statement, className)) {
      return statement;
    }
  }
}
