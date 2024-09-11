import ts from 'typescript';

import { isIdentifierWithText, isStaticPropDeclaration } from './is';
import { getModuleExportNameText } from './module';

export function isClassThatExtendsModuleExport(
  node: ts.Node,
  exportName: ts.ModuleExportName,
): node is ts.ClassDeclaration {
  const name = getModuleExportNameText(exportName);
  return ts.isClassDeclaration(node) && !!findHeritageClauseByName(node, name);
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

export function findClassThatExtendsModuleExport(node: ts.Node, className: ts.ModuleExportName) {
  let current = node.parent;

  while (current) {
    if (isClassThatExtendsModuleExport(current, className)) {
      return current;
    }

    current = current.parent;
  }
}
