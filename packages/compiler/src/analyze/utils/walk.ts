import ts from 'typescript';

import { getDeclaration, getShorthandAssignmentDeclaration } from './declaration';

export function getProperties(checker: ts.TypeChecker, node: ts.Node) {
  const props = new Map<string, ts.PropertyAssignment>();

  for (const symbol of checker.getPropertiesOfType(checker.getTypeAtLocation(node))) {
    const declaration = symbol.declarations?.[0];
    if (declaration && ts.isPropertyAssignment(declaration)) {
      props.set(declaration.name.getText(), declaration);
    }
  }

  return { props };
}

export function getHeritage(checker: ts.TypeChecker, node: ts.ClassDeclaration | null) {
  const map = new Map<string, ts.ClassDeclaration>();

  while (node) {
    if (node.name) map.set(node.name.escapedText as string, node);

    if (!node.heritageClauses) break;

    for (const clause of node.heritageClauses) {
      const identifier = clause.types[0]?.expression;

      if (!identifier || !ts.isIdentifier(identifier)) {
        node = null;
        continue;
      }

      const declaration = getDeclaration(checker, identifier);
      if (!declaration || !ts.isClassDeclaration(declaration)) {
        node = null;
        continue;
      }

      node = declaration;
    }
  }

  return map;
}

export function findPropertyAssignment(obj: ts.ObjectLiteralExpression, key: string) {
  return obj.properties.find(
    (prop) =>
      (ts.isPropertyAssignment(prop) ||
        ts.isShorthandPropertyAssignment(prop) ||
        ts.isMethodDeclaration(prop)) &&
      ts.isIdentifier(prop.name) &&
      prop.name.escapedText === key,
  ) as ts.ShorthandPropertyAssignment | ts.PropertyAssignment | ts.MethodDeclaration | undefined;
}

export function getPropertyAssignmentValue(
  checker: ts.TypeChecker,
  obj: ts.ObjectLiteralExpression,
  key: string,
): ts.Declaration | ts.Expression | undefined {
  const prop = findPropertyAssignment(obj, key);
  if (!prop) {
    return undefined;
  } else if (ts.isPropertyAssignment(prop)) {
    return prop.initializer;
  } else if (ts.isMethodDeclaration(prop)) {
    return prop;
  } else {
    return getShorthandAssignmentDeclaration(checker, prop);
  }
}

export function getValueNode(checker: ts.TypeChecker, node?: ts.Node): ts.Node | undefined {
  if (node) {
    if (ts.isIdentifier(node)) {
      return getValueNode(checker, getDeclaration(checker, node));
    } else if (ts.isShorthandPropertyAssignment(node)) {
      return getValueNode(checker, getShorthandAssignmentDeclaration(checker, node));
    } else if (ts.isVariableDeclaration(node) || ts.isPropertyAssignment(node)) {
      return getValueNode(checker, node.initializer);
    } else if (ts.isPropertyAccessExpression(node)) {
      return ts.isIdentifier(node.name) ? getDeepValueNode(checker, node.name) : node;
    }
  }

  return node;
}

export function getDeepValueNode(checker: ts.TypeChecker, node?: ts.Node): ts.Node | undefined {
  if (node) {
    if (ts.isIdentifier(node)) {
      return getDeepValueNode(checker, getDeclaration(checker, node));
    } else if (ts.isVariableDeclaration(node) || ts.isPropertyAssignment(node)) {
      return getDeepValueNode(checker, node.initializer);
    } else if (ts.isPropertyAccessExpression(node)) {
      return ts.isIdentifier(node.name) ? getDeepValueNode(checker, node.name) : node;
    } else if (ts.isShorthandPropertyAssignment(node)) {
      return getDeepValueNode(checker, getShorthandAssignmentDeclaration(checker, node));
    } else if (ts.isCallExpression(node)) {
      return getDeepValueNode(checker, node.expression);
    } else if (
      ts.isFunctionDeclaration(node) ||
      (ts.isArrowFunction(node) && ts.isBlock(node.body))
    ) {
      const returnStatement = getReturnStatement(node);
      return returnStatement ? getDeepValueNode(checker, returnStatement.expression) : node.body;
    } else if (ts.isArrowFunction(node)) {
      const body = ts.isParenthesizedExpression(node.body) ? node.body.expression : node.body;
      return getDeepValueNode(checker, body);
    }
  }

  return node;
}

export function isCallExpression(
  value: ts.Node | undefined,
  name: string,
): value is ts.CallExpression {
  return (
    !!value &&
    ts.isCallExpression(value) &&
    ts.isIdentifier(value.expression) &&
    value.expression.escapedText === name
  );
}

export function getReturnStatement(
  node?:
    | ts.ArrowFunction
    | ts.FunctionDeclaration
    | ts.GetAccessorDeclaration
    | ts.MethodDeclaration,
) {
  if (!node) return undefined;
  return (node.body as ts.FunctionBody).statements.find((statement) =>
    ts.isReturnStatement(statement),
  ) as ts.ReturnStatement | undefined;
}

export function getReturnExpression(node?: ts.Node) {
  if (!node) return undefined;
  return ts.isArrowFunction(node) && !ts.isBlock(node.body)
    ? ts.isParenthesizedExpression(node.body)
      ? node.body.expression
      : node.body
    : ts.isMethodDeclaration(node) ||
      ts.isFunctionDeclaration(node) ||
      (ts.isArrowFunction(node) && ts.isBlock(node.body))
    ? getReturnStatement(node)?.expression
    : undefined;
}

export function isExportedVariableStatement(node: ts.Node): node is ts.VariableStatement {
  return (
    ts.isVariableStatement(node) &&
    !!node.modifiers?.find((modifier) => (modifier.flags & ts.SyntaxKind.ExportKeyword) === 0)
  );
}
