import ts from 'typescript';

import { LogLevel, reportDiagnosticByNode } from '../../utils/logger';
import { getDeclaration } from '../utils/declaration';
import { getStaticProp } from '../utils/props';
import { getHeritage } from '../utils/walk';
import type { CustomElementNode } from './analyze-plugin';

export function discoverCustomElements(checker: ts.TypeChecker, sourceFile: ts.SourceFile) {
  const discovered: CustomElementNode[] = [];

  ts.forEachChild(sourceFile, (node: ts.Node) => {
    if (!ts.isClassDeclaration(node) || !node.name || !node.heritageClauses) return;

    const heritage = getHeritage(checker, node),
      hostMixin = heritage.mixins.get('Host'),
      hostMixinDeclaration =
        hostMixin &&
        ts.isIdentifier(hostMixin.expression) &&
        getDeclaration(checker, hostMixin.expression);

    if (
      !heritage.classes.has('HTMLElement') &&
      (!hostMixinDeclaration || !hostMixinDeclaration.getSourceFile().fileName.includes('maverick'))
    ) {
      return;
    }

    // Host(HTMLElement, Component)
    if (hostMixin && !ts.isIdentifier(hostMixin.arguments[1])) return;

    const component = hostMixin && getDeclaration(checker, hostMixin.arguments[1] as ts.Identifier);
    if (component && !ts.isClassDeclaration(component)) {
      reportDiagnosticByNode('expected component', hostMixin.arguments[1], LogLevel.Warn);
      return;
    }

    const tagNameProp = getStaticProp(node, 'tagName');
    if (!tagNameProp) {
      reportDiagnosticByNode('missing static `tagName`', node, LogLevel.Warn);
      return;
    }

    if (!tagNameProp.initializer || !ts.isStringLiteral(tagNameProp.initializer)) {
      reportDiagnosticByNode('`tagName` must be a string literal', tagNameProp, LogLevel.Warn);
      return;
    }

    let attrs = getStaticProp(node, 'attrs');
    if (attrs && (!attrs.initializer || !ts.isObjectLiteralExpression(attrs.initializer))) {
      reportDiagnosticByNode('`attrs` must be a object literal', attrs, LogLevel.Warn);
      attrs = undefined;
    }

    discovered.push({
      name: node.name.escapedText as string,
      root: node,
      tag: { node: tagNameProp, name: tagNameProp.initializer.text },
      component: component ? { node: component, name: component.name?.text || '' } : undefined,
      attrs,
    });
  });

  return discovered;
}
