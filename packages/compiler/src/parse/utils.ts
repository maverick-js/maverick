import { trimQuotes } from '@maverick-js/std';
import { isJsxElementNode } from '@maverick-js/ts';
import ts from 'typescript';

import {
  type AstNode,
  type AttributeNode,
  type ElementNode,
  type EventNode,
  isElementNode,
  isExpressionNode,
  isFragmentNode,
  isTextNode,
} from './ast';
import { RESERVED_ATTR_NAMESPACE, RESERVED_NAMESPACE } from './constants';
import { createAstNode } from './create-ast';
import type { JsxAttrNamespace, JsxEventNamespace, JsxNamespace } from './jsx';

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

export function getExpressionChildren(expression: ts.Expression) {
  let children: AstNode[] | undefined;

  const parse = (node: ts.Node) => {
    if (isJsxElementNode(node) || ts.isJsxFragment(node)) {
      if (!children) children = [];
      children!.push(createAstNode(node));
      return;
    }

    ts.forEachChild(node, parse);
  };

  if (isJsxElementNode(expression) || ts.isJsxFragment(expression)) {
    children = [createAstNode(expression)];
  } else {
    ts.forEachChild(expression, parse);
  }

  return children;
}

export function filterElementNodes(children: AstNode[]) {
  return children.filter((node) => isElementNode(node));
}

export function findElementIndex(parent: ElementNode, node: ElementNode) {
  return filterElementNodes(parent.children!).indexOf(node);
}

export function getAttributeNodeFullName(attr: AttributeNode) {
  return `${attr.namespace ? `${attr.namespace}:` : ''}${attr.name}`;
}

export function getEventNodeFullName(event: EventNode) {
  return `${event.namespace ? `${event.namespace}:` : ''}${event.type}`;
}

export function getAttributeText(attr: AttributeNode) {
  return attr.initializer.kind !== ts.SyntaxKind.TrueKeyword
    ? trimQuotes(attr.initializer.getText())
    : '';
}

export function isStaticTree(node: AstNode) {
  if (isElementNode(node)) {
    return (
      !node.isDynamic() && !node.props && (!node.children || node.children.every(isStaticTree))
    );
  } else if (isExpressionNode(node)) {
    return !node.dynamic;
  } else {
    return isTextNode(node) || isFragmentNode(node);
  }
}

export function getElementDepth(node: AstNode, depth = 0) {
  if ((isElementNode(node) || isFragmentNode(node)) && node.children) {
    let increment = isFragmentNode(node) ? 0 : 1,
      maxDepth = depth + increment;

    for (let i = 0; i < node.children.length; i++) {
      let newDepth = getElementDepth(node.children[i], depth + increment);
      if (newDepth > maxDepth) maxDepth = newDepth;
    }

    return maxDepth;
  }

  return depth;
}
