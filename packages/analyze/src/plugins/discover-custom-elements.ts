import ts from 'typescript';

import { LogLevel, reportDiagnosticByNode } from '../utils/logger';
import { getDeclaration } from '../utils/declaration';
import { getStaticProp } from '../utils/props';
import { findPropertyAssignment, getHeritage } from '../utils/walk';
import type { CustomElementNode } from './analyze-plugin';

export function discoverCustomElements(checker: ts.TypeChecker, sourceFile: ts.SourceFile) {
  const discovered: CustomElementNode[] = [];

  ts.forEachChild(sourceFile, (node: ts.Node) => {
    if (!ts.isClassDeclaration(node) || !node.name || !node.heritageClauses) return;

    const heritage = getHeritage(checker, node),
      hostMixin = heritage.mixins.get('Host'),
      createElementClassMixin = heritage.mixins.get('createElementClass'),
      maverickMixin = hostMixin || createElementClassMixin,
      maverickMixinDeclaration =
        maverickMixin &&
        ts.isIdentifier(maverickMixin.expression) &&
        getDeclaration(checker, maverickMixin.expression);

    if (
      !heritage.classes.has('HTMLElement') &&
      (!maverickMixinDeclaration ||
        !maverickMixinDeclaration.getSourceFile().fileName.includes('maverick'))
    ) {
      return;
    }

    // Host(HTMLElement, Component)
    if (hostMixin && !ts.isIdentifier(hostMixin.arguments[1])) return;
    // createElementClass(Component)
    if (createElementClassMixin && !ts.isIdentifier(createElementClassMixin.arguments[0])) return;

    const componentArg = hostMixin
        ? hostMixin.arguments[1]
        : createElementClassMixin
          ? createElementClassMixin.arguments[0]
          : null,
      component = componentArg && getDeclaration(checker, componentArg as ts.Identifier);
    if (component && !ts.isClassDeclaration(component)) {
      reportDiagnosticByNode('expected component', componentArg!, LogLevel.Warn);
      return;
    }

    const elementProp = component ? getStaticElementProp(component, 'name') : undefined,
      tagNameProp = getStaticProp(node, 'tagName') || elementProp;
    if (!tagNameProp) {
      reportDiagnosticByNode('missing static `tagName` or `element.name`', node, LogLevel.Warn);
      return;
    }

    if (!tagNameProp.initializer || !ts.isStringLiteral(tagNameProp.initializer)) {
      reportDiagnosticByNode(
        '`tagName` or `element.name` must be a string literal',
        tagNameProp,
        LogLevel.Warn,
      );
      return;
    }

    let attrs =
      getStaticProp(node, 'attrs') ||
      (component ? getStaticElementProp(component, 'attributes') : undefined);
    if (attrs && (!attrs.initializer || !ts.isObjectLiteralExpression(attrs.initializer))) {
      reportDiagnosticByNode(
        '`attrs` or `element.attributes` must be a object literal',
        attrs,
        LogLevel.Warn,
      );
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

function getStaticElementProp(node: ts.ClassDeclaration, name: string) {
  const element = getStaticProp(node, 'element');
  if (!element?.initializer || !ts.isObjectLiteralExpression(element.initializer)) return;

  const prop = findPropertyAssignment(element.initializer, name);
  return prop && ts.isPropertyAssignment(prop) ? prop : undefined;
}
