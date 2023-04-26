import ts from 'typescript';

import type { ElementDefintionNode } from '../plugins/AnalyzePlugin';
import {
  type MembersMeta,
  type MethodMeta,
  type PropMeta,
  type StoreMeta,
  TS_NODE,
} from './component';
import { buildMethodMeta } from './methods';
import { buildPropMeta } from './props';

export function buildMembersMeta(
  checker: ts.TypeChecker,
  root: ElementDefintionNode['root'],
  store?: StoreMeta,
): MembersMeta | undefined {
  const props: PropMeta[] = [],
    methods: MethodMeta[] = [];

  for (const symbol of checker.getPropertiesOfType(root.type)) {
    const declaration = symbol.declarations?.[0];
    if (!declaration) continue;
    if (ts.isPropertyDeclaration(declaration) || ts.isGetAccessorDeclaration(declaration)) {
      const name = declaration.name.getText();
      if (ignoreMember(declaration)) continue;
      props.push(
        buildPropMeta(checker, name, declaration, {
          type: checker.getTypeOfSymbol(symbol),
        }),
      );
    } else if (ts.isMethodDeclaration(declaration)) {
      const name = declaration.name.getText();
      if (ignoreMember(declaration)) continue;
      methods.push(
        buildMethodMeta(checker, name, declaration, {
          type: checker.getTypeOfSymbol(symbol),
        }),
      );
    }
  }

  if (store) {
    props.push({
      [TS_NODE]: store[TS_NODE],
      name: 'state',
      type: store.record,
      readonly: true,
    });
    methods.push({
      [TS_NODE]: store[TS_NODE],
      name: 'subscribe',
      parameters: [{ name: 'callback', type: `(state: ${store.record}) => Maybe<Dispose>` }],
      signature: { type: `(callback: (state: ${store.record}) => Maybe<Dispose>) => Unsubscribe` },
      return: { type: 'Unsubscribe' },
    });
  }

  return props.length > 0 || methods.length > 0
    ? {
        props: props.length > 0 ? props : undefined,
        methods: methods.length > 0 ? methods : undefined,
        length: props.length + methods.length,
      }
    : undefined;
}

const validDecoratorName = /^prop|method$/;
function ignoreMember(
  node:
    | ts.PropertyDeclaration
    | ts.MethodDeclaration
    | ts.GetAccessorDeclaration
    | ts.SetAccessorDeclaration,
) {
  return (
    !node.modifiers ||
    !node.modifiers.some(
      (modifier) =>
        modifier.kind === ts.SyntaxKind.Decorator &&
        ts.isIdentifier(modifier.expression) &&
        validDecoratorName.test(modifier.expression.escapedText as string),
    ) ||
    node.modifiers.some(
      (m) => m.kind === ts.SyntaxKind.ProtectedKeyword || m.kind === ts.SyntaxKind.PrivateKeyword,
    ) ||
    node.name.kind === ts.SyntaxKind.PrivateIdentifier
  );
}
