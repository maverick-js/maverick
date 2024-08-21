import ts from 'typescript';

import { trimQuotes } from '../utils/print';
import type { AST } from './ast';
import { buildAST } from './build-ast';
import { RESERVED_ATTR_NAMESPACE, RESERVED_NAMESPACE } from './constants';
import type {
  JSXAttrNamespace,
  JSXElementNode,
  JSXEventNamespace,
  JSXNamespace,
} from './jsx/types';

export function walk(node: ts.Node, check: (child: ts.Node) => any) {
  let result;

  const parse = (child: ts.Node) => {
    result = check(child);
    if (result) return result;
    return ts.forEachChild(child, parse);
  };

  return ts.forEachChild(node, parse);
}

export function isComponentTagName(tagName: string) {
  return (
    !tagName.includes('-') &&
    ((tagName[0] && tagName[0].toLowerCase() !== tagName[0]) ||
      tagName.includes('.') ||
      /[^a-zA-Z]/.test(tagName[0]))
  );
}

export function getTagName(node: ts.JsxElement | ts.JsxSelfClosingElement) {
  return ts.isJsxElement(node)
    ? ((node.openingElement.tagName as ts.Identifier).escapedText as string)
    : ((node.tagName as ts.Identifier).escapedText as string);
}

export function isValidAttrNamespace(namespace: any): namespace is JSXAttrNamespace {
  return RESERVED_ATTR_NAMESPACE.has(namespace);
}

export function isValidNamespace(namespace: any): namespace is JSXNamespace {
  return RESERVED_NAMESPACE.has(namespace);
}

const eventNamespaceRE = /^\$on/;
export function isValidEventNamespace(namespace: string): namespace is JSXEventNamespace {
  return eventNamespaceRE.test(namespace);
}

export function toAttributeName(name: string) {
  return name.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`);
}

export function toPropertyName(name: string) {
  return name.toLowerCase().replace(/-([a-z])/g, (_, w) => w.toUpperCase());
}

export function isTrueBoolExpression(node: ts.Expression) {
  return node.kind === ts.SyntaxKind.TrueKeyword;
}

export function isFalseBoolExpression(node: ts.Expression) {
  return node.kind === ts.SyntaxKind.FalseKeyword;
}

export function isBoolExpression(node: ts.Expression) {
  return isTrueBoolExpression(node) || isFalseBoolExpression(node);
}

export function isStringExpression(node: ts.Expression) {
  return ts.isNoSubstitutionTemplateLiteral(node) || ts.isStringLiteral(node);
}

export function isStaticExpression(node: ts.Expression) {
  return (
    ts.isLiteralExpression(node) ||
    ts.isNumericLiteral(node) ||
    isStringExpression(node) ||
    isBoolExpression(node)
  );
}

export function isEmptyNode(node: ts.Node) {
  const text = trimQuotes(node.getText().trim());
  return text.length === 0 || text === '() => {}';
}

export function isEmptyExpressionNode(node: ts.Node) {
  return ts.isJsxExpression(node) && isEmptyNode(node);
}

export function isEmptyTextNode(node: ts.Node) {
  return ts.isJsxText(node) && (isEmptyNode(node) || /^[\r\n]\s*$/.test(node.getText()));
}

export function isJSXElementNode(node: ts.Node): node is JSXElementNode {
  return ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node);
}

export function filterEmptyJSXChildNodes(children: ts.JsxChild[]) {
  return children.filter((child) => !isEmptyExpressionNode(child) && !isEmptyTextNode(child));
}

export function filterDOMElements(children: ts.JsxChild[]) {
  return children.filter(
    (node) =>
      (ts.isJsxText(node) && !isEmptyNode(node)) ||
      (isJSXElementNode(node) && !isComponentTagName(getTagName(node))),
  ) as JSXElementNode[];
}

export function resolveExpressionChildren(expression: ts.Expression) {
  let signal = ts.isCallExpression(expression),
    children: AST[] | undefined,
    isJSXExpression = !signal && (isJSXElementNode(expression) || ts.isJsxFragment(expression));

  const parse = (node: ts.Node) => {
    if (!signal && ts.isCallExpression(node)) {
      signal = true;
    } else if (isJSXElementNode(node) || ts.isJsxFragment(node)) {
      if (!children) children = [];
      children!.push(buildAST(node));
      return;
    }

    ts.forEachChild(node, parse);
  };

  if (isJSXExpression) {
    children = [buildAST(expression as ts.JsxElement | ts.JsxFragment)];
  } else {
    ts.forEachChild(expression, parse);
  }

  return { signal, children };
}
