import { trimQuotes } from '@maverick-js/std';
import ts from 'typescript';

import {
  isComponentTagName,
  isEmptyExpressionNode,
  isEmptyNode,
  isEmptyTextNode,
  isJsxElementNode,
} from './is';
import type { JsxElementNode } from './types';

export function getTagName(node: JsxElementNode) {
  const tagName = ts.isJsxElement(node) ? node.openingElement.tagName : node.tagName;
  return ts.isIdentifier(tagName) ? (tagName.escapedText as string) : trimQuotes(tagName.getText());
}

export function toAttributeName(name: string) {
  return name.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`);
}

export function toPropertyName(name: string) {
  return name.toLowerCase().replace(/-([a-z])/g, (_, w) => w.toUpperCase());
}

export function getJsxAttribute(node: ts.JsxElement | ts.JsxSelfClosingElement, name: string) {
  return getJsxAttributes(node).properties.find(
    (attr) =>
      ts.isJsxAttribute(attr) &&
      attr.name &&
      ts.isIdentifier(attr.name) &&
      attr.name.escapedText === name,
  ) as ts.JsxAttribute | undefined;
}

export function getJsxAttributes(node: JsxElementNode) {
  return ts.isJsxSelfClosingElement(node) ? node.attributes : node.openingElement.attributes;
}

export function getJsxChildren(node: JsxElementNode): ts.JsxChild[] | undefined {
  if (ts.isJsxSelfClosingElement(node)) return undefined;

  const children = filterEmptyJsxChildNodes(Array.from(node.children)),
    firstChild = children[0];

  // First child might be a fragment, skip over to children.
  if (firstChild && ts.isJsxFragment(firstChild)) {
    return filterEmptyJsxChildNodes(Array.from(firstChild.children));
  }

  return children;
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
