import ts from 'typescript';

import { reportDiagnosticByNode } from '../../utils/logger';
import { escapeQuotes } from '../../utils/str';
import { type MembersMeta, type MethodMeta, type PropMeta } from './component';
import { buildMethodMeta } from './methods';
import { buildPropMeta } from './props';

export function buildMembersMeta(checker: ts.TypeChecker, root: ts.Type): MembersMeta | undefined {
  const props: PropMeta[] = [],
    methods: MethodMeta[] = [];

  for (const symbol of checker.getPropertiesOfType(root)) {
    const declaration = symbol.declarations?.[0];
    if (!declaration) continue;
    if (ts.isPropertyDeclaration(declaration) || ts.isGetAccessorDeclaration(declaration)) {
      const name = escapeQuotes(declaration.name.getText());
      if (ignoreMember(name, declaration)) continue;
      props.push(
        buildPropMeta(checker, name, declaration, {
          type: checker.getTypeOfSymbol(symbol),
        }),
      );
    } else if (ts.isMethodDeclaration(declaration)) {
      const name = escapeQuotes(declaration.name.getText());
      if (ignoreMember(name, declaration)) continue;
      methods.push(
        buildMethodMeta(checker, name, declaration, {
          type: checker.getTypeOfSymbol(symbol),
        }),
      );
    }
  }

  return props.length > 0 || methods.length > 0
    ? {
        props: props.length > 0 ? props : undefined,
        methods: methods.length > 0 ? methods : undefined,
        length: props.length + methods.length,
      }
    : undefined;
}

const validDecoratorName = /^prop|method$/,
  ignoredNamed = new Set(['$', 'el', '$el', '$props', '$state', 'attach', 'render', 'destroy']),
  decoratorWarnings = new Set<ts.Node>();

function ignoreMember(
  name: string,
  node:
    | ts.PropertyDeclaration
    | ts.MethodDeclaration
    | ts.GetAccessorDeclaration
    | ts.SetAccessorDeclaration,
) {
  const isPublic =
    (!node.modifiers ||
      !node.modifiers.some(
        (m) => m.kind === ts.SyntaxKind.ProtectedKeyword || m.kind === ts.SyntaxKind.PrivateKeyword,
      )) &&
    node.name.kind !== ts.SyntaxKind.PrivateIdentifier;

  const hasDecorator =
    isPublic &&
    node.modifiers &&
    node.modifiers.some(
      (modifier) =>
        modifier.kind === ts.SyntaxKind.Decorator &&
        ts.isIdentifier(modifier.expression) &&
        validDecoratorName.test(modifier.expression.escapedText as string),
    );

  if (
    isPublic &&
    !hasDecorator &&
    !decoratorWarnings.has(node) &&
    !name.startsWith('_') &&
    !ignoredNamed.has(name)
  ) {
    const isMethod = ts.isMethodDeclaration(node);

    reportDiagnosticByNode(
      `Public ${isMethod ? 'method' : 'property'} \`${name}\` requires \`${
        isMethod ? '@method' : '@prop'
      }\` decorator`,
      node,
    );

    decoratorWarnings.add(node);
  }

  return !isPublic || !hasDecorator;
}
