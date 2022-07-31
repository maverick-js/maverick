import {
  filterEmptyJSXChildNodes,
  getTagName,
  isComponentTagName,
  isEmptyNode,
  isStaticExpression,
  isValidAttrNamespace,
  isValidNamespace,
} from './utils';
import t from 'typescript';
import {
  type AST,
  type ExpressionNode,
  createAST,
  createTextNode,
  createExpressionNode,
  createElementNode,
  createRefNode,
  createDirectiveNode,
  createEventNode,
  createSpreadNode,
  createAttributeNode,
  createStructuralNode,
  StructuralNodeType,
} from '../ast';
import {
  type JSXRootNode,
  isJSXElementNode,
  type JSXNodeMeta,
  type JSXNamespace,
  type JSXElementNode,
} from './parse-jsx';
import { STATICABLE_NAMESPACE, SVG_ELEMENT_TAGNAME, VOID_ELEMENT_TAGNAME } from './constants';
import { onceFn } from '../../utils/fn';
import { containsCallExpression } from '../../utils/ts';

export function buildAST(
  root: JSXRootNode,
  meta: Omit<JSXNodeMeta, 'parent'> = {},
  skipRoot = false,
) {
  const ast = createAST(root);

  if (!skipRoot) {
    parseNode(root, ast, { ...meta, parent: undefined });
  } else if (!t.isJsxSelfClosingElement(root)) {
    parseChildren(root, ast, meta);
  }

  return ast;
}

function parseNode(node: t.Node, ast: AST, meta: JSXNodeMeta) {
  if (isJSXElementNode(node)) {
    parseElement(node, ast, meta);
  } else if (t.isJsxFragment(node)) {
    parseFragment(node, ast, meta);
  } else if (t.isJsxText(node) && !isEmptyNode(node)) {
    ast.tree.push(createTextNode({ ref: node }));
  } else if (t.isJsxExpression(node) && node.expression && !isEmptyNode(node)) {
    parseExpression(node, ast, meta);
  }
}

function parseElement(node: JSXElementNode, ast: AST, meta: JSXNodeMeta) {
  const tagName = getTagName(node);
  const isComponent = isComponentTagName(tagName);
  const isVoid = !isComponent && VOID_ELEMENT_TAGNAME.has(tagName);
  const isSVGChild =
    !isComponent && !meta.parent && tagName != 'svg' && SVG_ELEMENT_TAGNAME.has(tagName);
  const isSVG = tagName === 'svg' || isSVGChild;
  const isSelfClosing = t.isJsxSelfClosingElement(node);
  const supportsChildren = isSelfClosing || isVoid;

  let filteredChildren = !supportsChildren
    ? filterEmptyJSXChildNodes(Array.from(node.children))
    : [];

  const firstChild = filteredChildren[0];
  if (!isComponent && firstChild && t.isJsxFragment(firstChild)) {
    filteredChildren = filterEmptyJSXChildNodes(Array.from(firstChild.children));
  }

  const childCount = filteredChildren.length;
  const childElementCount = filteredChildren.filter(
    (node) => isJSXElementNode(node) && !isComponentTagName(getTagName(node)),
  ).length;
  const hasChildren = childCount > 0;

  // Whether this element contains any dynamic expressions which would require a new marker.
  let isDynamic = isComponent;
  const dynamic = onceFn(() => {
    isDynamic = true;
  });

  const element = createElementNode({
    ref: node,
    tagName,
    isVoid,
    isSVG,
    isCE: tagName.includes('-'),
    childCount,
    childElementCount,
    hasChildren,
    isComponent,
    dynamic: () => isDynamic,
  });

  ast.tree.push(element);

  const attributes = isSelfClosing ? node.attributes : node.openingElement.attributes;
  parseElementAttrs(attributes, ast, { parent: meta, dynamic });
  ast.tree.push(createStructuralNode(StructuralNodeType.AttributesEnd));

  if (hasChildren) {
    ast.tree.push(createStructuralNode(StructuralNodeType.ChildrenStart));
    if (isComponent) {
      if (filteredChildren.length === 1 && t.isJsxText(filteredChildren[0])) {
        element.children = createTextNode({ ref: filteredChildren[0] });
      } else if (filteredChildren.length === 1 && t.isJsxExpression(filteredChildren[0])) {
        element.children = buildExpressionNode(filteredChildren[0], { parent: meta, dynamic });
      } else if (filteredChildren.length > 0) {
        element.children = buildAST(node, { isSVGChild, dynamic }, true);
      }
    } else {
      for (const child of filteredChildren) {
        parseNode(child, ast, { parent: meta, isSVGChild, dynamic });
      }
    }
    ast.tree.push(createStructuralNode(StructuralNodeType.ChildrenEnd));
  }

  ast.tree.push(createStructuralNode(StructuralNodeType.ElementEnd));
}

function parseElementAttrs(attributes: t.JsxAttributes, ast: AST, meta: JSXNodeMeta) {
  const attrs = Array.from(attributes.properties) as t.JsxAttribute[];

  for (const attr of attrs) {
    if (t.isJsxSpreadAttribute(attr)) {
      ast.tree.push(createSpreadNode({ ref: attr }));
      meta.dynamic?.();
      continue;
    }

    let initNode = attr.initializer;
    if (!initNode) continue;

    const literal = t.isStringLiteral(initNode) ? initNode : undefined;
    const expression = t.isJsxExpression(initNode) ? initNode.expression : undefined;

    if ((!literal && !expression) || isEmptyNode((literal || expression)!)) {
      continue;
    }

    const value: t.StringLiteral | t.Expression = (literal || expression)!;

    const rawName = attr.name.escapedText as string;
    const rawNameParts = rawName.split(':');

    const hasValidNamespace = isValidNamespace(rawNameParts[0]);
    const namespace = hasValidNamespace ? (rawNameParts[0] as JSXNamespace) : null;
    const name = hasValidNamespace ? rawNameParts[1] : rawName;

    const isStaticExpr = expression && isStaticExpression(expression);
    const isStaticValue = !!literal || isStaticExpr;
    const isDynamic =
      !isStaticValue || (namespace && !STATICABLE_NAMESPACE.has(namespace)) || name === 'innerHTML';
    const isObservable = !isStaticValue && expression && containsCallExpression(expression);

    const fnId =
      expression && t.isCallExpression(expression) && expression.arguments.length === 0
        ? expression.expression.getText()
        : undefined;

    if (expression && !isStaticExpr) {
      if (name === '$ref') {
        ast.tree.push(createRefNode({ ref: expression, value: value.getText() }));
        meta.dynamic?.();
      } else if (namespace === '$use') {
        ast.tree.push(createDirectiveNode({ ref: expression, name, value: value.getText() }));
        meta.dynamic?.();
      } else if (namespace === '$on' || namespace === '$on_capture') {
        ast.tree.push(
          createEventNode({
            ref: expression,
            namespace,
            type: name,
            value: value.getText(),
          }),
        );
        meta.dynamic?.();
      } else if (!namespace || isValidAttrNamespace(namespace)) {
        ast.tree.push(
          createAttributeNode({
            ref: expression,
            namespace,
            name,
            value: value.getText(),
            dynamic: !isStaticValue,
            observable: isObservable,
            fnId,
          }),
        );
        if (isDynamic) meta.dynamic?.();
      }
    } else {
      if (hasValidNamespace) {
        ast.tree.push(
          createAttributeNode({
            ref: value,
            namespace: isValidAttrNamespace(namespace) ? namespace : null,
            name,
            value: value.getText(),
            dynamic: !isStaticValue,
            observable: isObservable,
            fnId,
          }),
        );

        if (isDynamic) meta.dynamic?.();
      } else {
        ast.tree.push(
          createAttributeNode({
            ref: value,
            namespace: null,
            name: !meta.isSVGChild ? name.toLowerCase() : name,
            value: value.getText(),
            fnId,
          }),
        );
      }
    }
  }
}

function parseFragment(fragment: t.JsxFragment, ast: AST, meta: JSXNodeMeta) {
  ast.tree.push(createStructuralNode(StructuralNodeType.FragmentStart));
  parseChildren(fragment, ast, meta);
  ast.tree.push(createStructuralNode(StructuralNodeType.FragmentEnd));
}

function parseChildren(root: t.JsxElement | t.JsxFragment, ast: AST, meta: JSXNodeMeta) {
  const filteredChildren = filterEmptyJSXChildNodes(Array.from(root.children));
  for (const child of filteredChildren) parseNode(child, ast, { parent: meta });
}

function parseExpression(node: t.JsxExpression, ast: AST, meta: JSXNodeMeta) {
  ast.tree.push(buildExpressionNode(node, meta));
}

function buildExpressionNode(node: t.JsxExpression, meta: JSXNodeMeta): ExpressionNode {
  const expression = node.expression!,
    isRootCallExpression = t.isCallExpression(expression),
    isCallable = isRootCallExpression && expression.arguments.length === 0;

  let isObservable = isRootCallExpression,
    children: AST[] | undefined;

  const parse = (node: t.Node) => {
    if (!isObservable && t.isCallExpression(node)) {
      isObservable = true;
    } else if (isJSXElementNode(node) || t.isJsxFragment(node)) {
      if (!children) children = [];
      children!.push(buildAST(node));
      return;
    }

    t.forEachChild(node, parse);
  };

  t.forEachChild(node, parse);

  const isStatic = !isObservable && !children && isStaticExpression(expression);
  if (!isStatic) meta.dynamic?.();

  return createExpressionNode({
    ref: node,
    children,
    observable: isObservable,
    root: !meta.parent,
    dynamic: !isStatic,
    value: expression.getText(),
    fnId: isCallable ? expression.expression.getText() : undefined,
  });
}
