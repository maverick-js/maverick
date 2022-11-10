import t from 'typescript';

import { type AST } from '../transformer/ast';
import { buildAST } from '../transformer/jsx/parse';
import { isJSXElementNode } from '../transformer/jsx/parse-jsx';

export function hasChildType(node: t.Node, check: (child: t.Node) => boolean) {
  const parse = (child: t.Node) => {
    if (check(child)) return true;
    return t.forEachChild(child, parse);
  };

  return t.forEachChild(node, parse);
}

export function resolveExpressionChildren(expression: t.Expression) {
  let observable = t.isCallExpression(expression) || t.isPropertyAccessExpression(expression),
    children: AST[] | undefined,
    isJSXExpression = !observable && (isJSXElementNode(expression) || t.isJsxFragment(expression));

  const parse = (node: t.Node) => {
    if (!observable && (t.isCallExpression(node) || t.isPropertyAccessExpression(node))) {
      observable = true;
    } else if (isJSXElementNode(node) || t.isJsxFragment(node)) {
      if (!children) children = [];
      children!.push(buildAST(node));
      return;
    }

    t.forEachChild(node, parse);
  };

  if (isJSXExpression) {
    children = [buildAST(expression as t.JsxElement | t.JsxFragment)];
  } else {
    t.forEachChild(expression, parse);
  }

  return { observable, children };
}
