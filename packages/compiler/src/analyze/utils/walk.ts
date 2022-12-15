import ts from 'typescript';

import { getDeclaration, getDeclarations, getShorthandAssignmentDeclaration } from './declaration';

export type SeenMembers = {
  props: Map<
    string,
    {
      assignment: ts.PropertyAssignment | ts.ShorthandPropertyAssignment;
      value: ts.Declaration | ts.Expression;
    }
  >;
  methods: Map<
    string,
    {
      assignment: ts.MethodDeclaration | ts.ShorthandPropertyAssignment;
      value: ts.FunctionDeclaration | ts.MethodDeclaration;
    }
  >;
  accessors: Map<
    string,
    {
      get?: ts.GetAccessorDeclaration | undefined;
      set?: ts.SetAccessorDeclaration | undefined;
    }
  >;
};

export function walkProperties(
  checker: ts.TypeChecker,
  node: ts.Node,
  members: SeenMembers = {
    props: new Map(),
    methods: new Map(),
    accessors: new Map(),
  },
): SeenMembers {
  if (ts.isObjectLiteralExpression(node)) {
    for (const prop of node.properties) {
      if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
        const name = prop.name.escapedText as string;
        members.props.set(name, { assignment: prop, value: prop.initializer });
      } else if (ts.isMethodDeclaration(prop) && ts.isIdentifier(prop.name)) {
        const name = prop.name.escapedText as string;
        members.methods.set(name, { assignment: prop, value: prop });
      } else if (ts.isShorthandPropertyAssignment(prop)) {
        const name = prop.name.escapedText as string;
        const declaration = getShorthandAssignmentDeclaration(checker, prop);
        if (declaration) {
          if (ts.isFunctionDeclaration(declaration)) {
            members.methods.set(name, { assignment: prop, value: declaration });
          } else {
            members.props.set(name, { assignment: prop, value: declaration });
          }
        }
      } else if (ts.isGetAccessor(prop) && ts.isIdentifier(prop.name)) {
        const name = prop.name.escapedText as string;
        if (!members.accessors.has(name)) members.accessors.set(name, {});
        members.accessors.get(name)!.get = prop;
      } else if (ts.isSetAccessor(prop) && ts.isIdentifier(prop.name)) {
        const name = prop.name.escapedText as string;
        if (!members.accessors.has(name)) members.accessors.set(name, {});
        members.accessors.get(name)!.set = prop;
      } else {
        walkProperties(checker, prop, members);
      }
    }
  } else if (ts.isSpreadAssignment(node)) {
    walkProperties(checker, node.expression, members);
  } else if (isCallExpression(node, 'mergeProperties')) {
    for (const argument of node.arguments) {
      walkProperties(checker, argument, members);
    }
  } else {
    const value = getDeepValueNode(checker, node);
    if (value) walkProperties(checker, value, members);
  }

  return members;
}

export type SeenMemberSignatures = {
  heritage: Map<string, ts.TypeReferenceNode | ts.ExpressionWithTypeArguments>;
  props: Map<
    string,
    {
      signature: ts.PropertySignature;
      type?: ts.Type;
    }
  >;
  methods: Map<
    string,
    {
      signature: ts.MethodSignature;
      type?: ts.Type;
    }
  >;
};

export function walkSignatures(
  checker: ts.TypeChecker,
  node: ts.Node,
  members: SeenMemberSignatures = {
    heritage: new Map(),
    props: new Map(),
    methods: new Map(),
  },
  ignoredIdentifiers = new Set<string>(),
): SeenMemberSignatures {
  if (ts.isTypeLiteralNode(node) || ts.isInterfaceDeclaration(node)) {
    if (ts.isInterfaceDeclaration(node) && node.typeParameters) {
      const type = checker.getTypeAtLocation(node);
      for (const prop of checker.getPropertiesOfType(type)) {
        const declaration = prop.declarations?.[0];
        if (declaration) {
          const type = checker.getTypeOfSymbolAtLocation(prop, declaration);
          if (ts.isPropertySignature(declaration)) {
            const name = ts.isIdentifier(declaration.name) ? declaration.name.escapedText : null;
            if (name) members.props.set(name, { signature: declaration, type });
          } else if (ts.isMethodSignature(declaration)) {
            const name = ts.isIdentifier(declaration.name) ? declaration.name.escapedText : null;
            if (name) members.methods.set(name, { signature: declaration, type });
          }
        }
      }
    } else {
      if (ts.isInterfaceDeclaration(node) && node.heritageClauses) {
        for (const clause of node.heritageClauses) {
          for (const type of clause.types) {
            if (ts.isIdentifier(type.expression)) {
              members.heritage.set(type.expression.escapedText as string, type);
              if (!ignoredIdentifiers.has(type.expression.escapedText as string)) {
                const declarations = getDeclarations(checker, type.expression);
                if (declarations) {
                  for (const declaration of declarations) {
                    walkSignatures(checker, declaration, members, ignoredIdentifiers);
                  }
                }
              }
            }
          }
        }
      }

      for (const member of node.members) {
        const name = member.name && ts.isIdentifier(member.name) ? member.name.escapedText : null;
        if (name) {
          if (ts.isPropertySignature(member)) {
            members.props.set(name, { signature: member });
          } else if (ts.isMethodSignature(member)) {
            members.methods.set(name, { signature: member });
          }
        }
      }
    }
  } else if (ts.isTypeReferenceNode(node)) {
    if (node.typeArguments) {
      const type = checker.getTypeAtLocation(node);
      for (const prop of checker.getPropertiesOfType(type)) {
        const declaration = prop.declarations?.[0];
        if (declaration) {
          const type = checker.getTypeOfSymbolAtLocation(prop, declaration);
          if (ts.isPropertySignature(declaration)) {
            const name = ts.isIdentifier(declaration.name) ? declaration.name.escapedText : null;
            if (name) members.props.set(name, { signature: declaration, type });
          } else if (ts.isMethodSignature(declaration)) {
            const name = ts.isIdentifier(declaration.name) ? declaration.name.escapedText : null;
            if (name) members.methods.set(name, { signature: declaration, type });
          }
        }
      }
    } else if (ts.isIdentifier(node.typeName)) {
      members.heritage.set(node.typeName.escapedText as string, node);
      if (!ignoredIdentifiers.has(node.typeName.escapedText as string)) {
        const declarations = getDeclarations(checker, node.typeName);
        if (declarations) {
          for (const declaration of declarations) {
            walkSignatures(checker, declaration, members, ignoredIdentifiers);
          }
        }
      }
    }
  } else if (ts.isIntersectionTypeNode(node)) {
    for (const type of node.types) {
      walkSignatures(checker, type, members, ignoredIdentifiers);
    }
  } else if (ts.isTypeAliasDeclaration(node)) {
    walkSignatures(checker, node.type, members, ignoredIdentifiers);
  }

  return members;
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
