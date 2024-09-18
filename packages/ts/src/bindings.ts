import { uniqueItemsOnly } from '@maverick-js/std';
import ts from 'typescript';

import { type AccessExpression, isAccessExpression } from './is';
import { walkTsNode } from './visit';

export function resolveBindingNameIdentifiers(
  names: ts.BindingName[],
  identifiers: ts.Identifier[] = [],
) {
  for (const name of names) {
    if (ts.isIdentifier(name)) {
      identifiers.push(name);
    } else if (ts.isObjectBindingPattern(name)) {
      resolveBindingNameIdentifiers(
        name.elements.map((e) => e.name),
        identifiers,
      );
    } else if (ts.isArrayBindingPattern(name)) {
      resolveBindingNameIdentifiers(
        name.elements.filter(ts.isBindingElement).map((e) => e.name),
        identifiers,
      );
    }
  }

  return identifiers;
}

export function getAccessExpressionId(node: ts.Node) {
  if (ts.isIdentifier(node)) {
    return node;
  } else if (ts.isPropertyAccessExpression(node)) {
    return getAccessExpressionId(node.expression);
  } else if (ts.isElementAccessExpression(node)) {
    return getAccessExpressionId(node.expression);
  }
}

export function findIdentifiers(node: ts.Node) {
  const identifiers: ts.Identifier[] = [];

  if (ts.isIdentifier(node)) {
    identifiers.push(node);
  } else {
    walkTsNode(node, (child) => {
      if (ts.isIdentifier(child)) identifiers.push(child);
    });
  }

  return identifiers;
}

export function findAccessExpressions(node: ts.Node) {
  const seen: AccessExpression[] = [];

  function walk(node: ts.Node) {
    if (isAccessExpression(node)) {
      seen.push(node);
      return;
    }

    node.forEachChild(walk);
  }

  walk(node);

  return seen;
}

export function includesAccessExpression(search: AccessExpression[], needle: AccessExpression) {
  for (const expression of search) {
    if (hasIdentifierChild(expression, needle)) return true;
  }

  return false;
}

export function hasIdentifierChild(parent: ts.Node, child: AccessExpression) {
  if (parent === child) {
    return true;
  } else {
    return parent.forEachChild((node) => hasIdentifierChild(node, child)) ?? false;
  }
}

export function mergeIdentifiers(a: ts.Identifier[], b: ts.Identifier[]) {
  return uniqueItemsOnly([...a, ...b].map((id) => id.text)).map(ts.factory.createIdentifier);
}
