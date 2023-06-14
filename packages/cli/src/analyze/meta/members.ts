import ts from 'typescript';

import { reportDiagnosticByNode } from '../../utils/logger';
import { escapeQuotes } from '../../utils/str';
import { serializeType } from '../utils/types';
import { type MembersMeta, type MethodMeta, type PropMeta, TS_NODE } from './component';
import { buildMethodMeta } from './methods';
import { buildPropMeta } from './props';

export function buildMembersMeta(
  checker: ts.TypeChecker,
  root: ts.Type,
  stateDeclaration?: ts.PropertyDeclaration,
  stateType?: ts.Type,
): MembersMeta | undefined {
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

  if (stateType && stateDeclaration) {
    const type = serializeType(checker, stateType);
    props.push({
      [TS_NODE]: stateDeclaration,
      name: 'state',
      docs: 'This object contains the current state of the component.',
      type,
      readonly: true,
    });
    methods.push({
      [TS_NODE]: stateDeclaration,
      name: 'subscribe',
      docs: 'Subscribe to live updates of component state.',
      parameters: [{ name: 'callback', type: `(state: ${type}) => Maybe<Dispose>` }],
      signature: { type: `(callback: (state: ${type}) => Maybe<Dispose>) => Unsubscribe` },
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

const validDecoratorName = /^prop|method$/,
  ignoredName = new Set([
    '$',
    '$$',
    'scope',
    'attachScope',
    'connectScope',
    'el',
    '$el',
    '$props',
    'state',
    '$state',
    'subscribe',
    'attach',
    'render',
    'destroy',
    'onSetup',
    'onAttach',
    'onConnect',
    'onDestroy',
    'createEvent',
    'listen',
    'dispatch',
    'addEventListener',
    'removeEventListener',
  ]),
  decoratorWarnings = new Set<ts.Node>();

function ignoreMember(
  name: string,
  node:
    | ts.PropertyDeclaration
    | ts.MethodDeclaration
    | ts.GetAccessorDeclaration
    | ts.SetAccessorDeclaration,
) {
  if (ignoredName.has(name)) return true;

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

  if (isPublic && !hasDecorator && !decoratorWarnings.has(node) && !name.startsWith('_')) {
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
