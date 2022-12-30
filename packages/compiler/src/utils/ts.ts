import ts from 'typescript';

import type { AST } from '../transformer/ast';
import { buildAST } from '../transformer/jsx/parse';
import { isJSXElementNode } from '../transformer/jsx/parse-jsx';

export function hasChildType(node: ts.Node, check: (child: ts.Node) => boolean) {
  const parse = (child: ts.Node) => {
    if (check(child)) return true;
    return ts.forEachChild(child, parse);
  };

  return ts.forEachChild(node, parse);
}

export function resolveExpressionChildren(expression: ts.Expression) {
  let observable = ts.isCallExpression(expression),
    children: AST[] | undefined,
    isJSXExpression = !observable && (isJSXElementNode(expression) || ts.isJsxFragment(expression));

  const parse = (node: ts.Node) => {
    if (!observable && ts.isCallExpression(node)) {
      observable = true;
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

  return { observable, children };
}
