import ts from 'typescript';

import { trimQuotes } from '../utils/print';
import type { ASTNode } from './ast';
import { RESERVED_ATTR_NAMESPACE, RESERVED_NAMESPACE } from './constants';
import { createASTNode } from './create-ast';
import type {
  JsxAttrNamespace,
  JsxElementNode,
  JsxEventNamespace,
  JsxNamespace,
} from './jsx/types';

export function walkTsNode(node: ts.Node, check: (child: ts.Node) => any) {
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

export function isValidAttrNamespace(namespace: any): namespace is JsxAttrNamespace {
  return RESERVED_ATTR_NAMESPACE.has(namespace);
}

export function isValidNamespace(namespace: any): namespace is JsxNamespace {
  return RESERVED_NAMESPACE.has(namespace);
}

const eventNamespaceRE = /^\$on/;
export function isValidEventNamespace(namespace: string): namespace is JsxEventNamespace {
  return eventNamespaceRE.test(namespace);
}

export function toAttributeName(name: string) {
  return name.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`);
}

export function toPropertyName(name: string) {
  return name.toLowerCase().replace(/-([a-z])/g, (_, w) => w.toUpperCase());
}

export function isTrueKeyword(node: ts.Node) {
  return node.kind === ts.SyntaxKind.TrueKeyword;
}

export function isFalseKeyword(node: ts.Node) {
  return node.kind === ts.SyntaxKind.FalseKeyword;
}

export function isBoolLiteral(node: ts.Node) {
  return isTrueKeyword(node) || isFalseKeyword(node);
}

export function isStringLiteral(node: ts.Node) {
  return ts.isNoSubstitutionTemplateLiteral(node) || ts.isStringLiteral(node);
}

export function isStaticNode(node: ts.Node) {
  return (
    ts.isLiteralExpression(node) ||
    ts.isNumericLiteral(node) ||
    isStringLiteral(node) ||
    isBoolLiteral(node)
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

export function isJsxElementNode(node: ts.Node): node is JsxElementNode {
  return ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node);
}

export function filterEmptyJsxChildNodes(children: ts.JsxChild[]) {
  return children.filter((child) => !isEmptyExpressionNode(child) && !isEmptyTextNode(child));
}

export function filterJsxDOMElements(children: ts.JsxChild[]) {
  return children.filter(
    (node) =>
      (ts.isJsxText(node) && !isEmptyNode(node)) ||
      (isJsxElementNode(node) && !isComponentTagName(getTagName(node))),
  ) as JsxElementNode[];
}

export function resolveExpressionChildren(expression: ts.Expression) {
  let signal = ts.isCallExpression(expression),
    children: ASTNode[] | undefined,
    isJsxExpression = !signal && (isJsxElementNode(expression) || ts.isJsxFragment(expression));

  const parse = (node: ts.Node) => {
    if (!signal && ts.isCallExpression(node)) {
      signal = true;
    } else if (isJsxElementNode(node) || ts.isJsxFragment(node)) {
      if (!children) children = [];
      children!.push(createASTNode(node));
      return;
    }

    ts.forEachChild(node, parse);
  };

  if (isJsxExpression) {
    children = [createASTNode(expression as ts.JsxElement | ts.JsxFragment)];
  } else {
    ts.forEachChild(expression, parse);
  }

  return { signal, children };
}

export function resolveJsxAttrs(node: JsxElementNode) {
  return ts.isJsxSelfClosingElement(node) ? node.attributes : node.openingElement.attributes;
}

export function resolveJsxChildren(node: JsxElementNode): ts.JsxChild[] | undefined {
  if (ts.isJsxSelfClosingElement(node)) return undefined;

  const children = filterEmptyJsxChildNodes(Array.from(node.children)),
    firstChild = children[0];

  // First child might be a fragment, skip over to children.
  if (firstChild && ts.isJsxFragment(firstChild)) {
    return filterEmptyJsxChildNodes(Array.from(firstChild.children));
  }

  return children;
}
