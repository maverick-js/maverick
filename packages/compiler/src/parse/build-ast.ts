import { isUndefined } from '@maverick-js/std';
import ts from 'typescript';

import { onceFn } from '../utils/fn';
import {
  type AST,
  type ComponentChildren,
  createAST,
  createAttributeNode,
  createElementNode,
  createEventNode,
  createExpressionNode,
  createFragmentNode,
  createRefNode,
  createSpreadNode,
  createStructuralNode,
  createTextNode,
  type ExpressionNode,
  StructuralNodeType,
} from './ast';
import {
  DELEGATED_EVENT_TYPE,
  DYNAMIC_NAMESPACE,
  SVG_ELEMENT_TAGNAME,
  VOID_ELEMENT_TAGNAME,
} from './constants';
import {
  type JSXElementNode,
  type JSXNamespace,
  type JSXNodeMeta,
  type JSXRootNode,
} from './jsx/types';
import {
  filterDOMElements,
  filterEmptyJSXChildNodes,
  getTagName,
  isComponentTagName,
  isEmptyNode,
  isJSXElementNode,
  isStaticExpression,
  isValidAttrNamespace,
  isValidNamespace,
  resolveExpressionChildren,
} from './utils';

export function buildAST(
  root: JSXRootNode,
  meta: Omit<JSXNodeMeta, 'parent'> = {},
  skipRoot = false,
) {
  const ast = createAST(root);

  if (ts.isBinaryExpression(root) || ts.isConditionalExpression(root)) {
    parseExpression(root, ast, meta);
  } else if (!skipRoot) {
    parseNode(root, ast, { ...meta, parent: undefined });
  } else if (!ts.isJsxSelfClosingElement(root)) {
    parseChildren(root, ast, meta);
  }

  return ast;
}

function parseNode(node: ts.Node, ast: AST, meta: JSXNodeMeta) {
  if (isJSXElementNode(node)) {
    parseElement(node, ast, meta);
  } else if (ts.isJsxFragment(node)) {
    parseFragment(node, ast, meta);
  } else if (ts.isJsxText(node) && !isEmptyNode(node)) {
    ast.tree.push(createTextNode({ node: node }));
  } else if (ts.isJsxExpression(node) && node.expression && !isEmptyNode(node)) {
    parseExpression(node, ast, meta);
  }
}

function parseElement(node: JSXElementNode, ast: AST, meta: JSXNodeMeta) {
  const tagName = getTagName(node),
    isComponent = isComponentTagName(tagName),
    isCustomElement = tagName.includes('-'),
    isVoid = !isComponent && VOID_ELEMENT_TAGNAME.has(tagName),
    isSVG = !isComponent && (tagName === 'svg' || SVG_ELEMENT_TAGNAME.has(tagName)),
    isSelfClosing = ts.isJsxSelfClosingElement(node),
    supportsChildren = isSelfClosing || isVoid;

  let children = !supportsChildren ? filterEmptyJSXChildNodes(Array.from(node.children)) : [];

  const firstChild = children[0];
  if (!isComponent && firstChild && ts.isJsxFragment(firstChild)) {
    children = filterEmptyJSXChildNodes(Array.from(firstChild.children));
  }

  const childCount = children.length,
    childElementCount = filterDOMElements(children).length,
    hasChildren = childCount > 0;

  // Whether this element contains any dynamic top-level expressions which would require a new marker.
  // For example, a property set or attaching an event listener.
  let isDynamic = isComponent || isCustomElement;
  const dynamic = onceFn(() => {
    isDynamic = true;
  });

  let hasSpread = false;
  const spread = onceFn(() => {
    hasSpread = true;
  });

  const element = createElementNode({
    node: node,
    tagName,
    isVoid,
    isSVG,
    isCE: tagName.includes('-'),
    childCount,
    childElementCount,
    hasChildren,
    isComponent,
    dynamic: () => isDynamic,
    spread: () => hasSpread,
  });

  ast.tree.push(element);

  const attributes = isSelfClosing ? node.attributes : node.openingElement.attributes;
  parseElementAttrs(attributes, ast, { parent: meta, component: isComponent, dynamic, spread });
  ast.tree.push(createStructuralNode(StructuralNodeType.AttributesEnd));

  if (hasChildren) {
    if (isComponent) {
      const childNodes: ComponentChildren[] = [];

      for (const child of children) {
        if (ts.isJsxText(child)) {
          childNodes.push(createTextNode({ node: child }));
        } else if (ts.isJsxExpression(child)) {
          childNodes.push(buildExpressionNode(child, { parent: node }));
        } else {
          childNodes.push(buildAST(child));
        }
      }

      element.children = childNodes;
    } else {
      ast.tree.push(createStructuralNode(StructuralNodeType.ChildrenStart));
      for (const child of children) {
        parseNode(child, ast, { parent: meta, dynamic });
      }
      ast.tree.push(createStructuralNode(StructuralNodeType.ChildrenEnd));
    }
  }

  ast.tree.push(createStructuralNode(StructuralNodeType.ElementEnd));
}

function parseElementAttrs(attributes: ts.JsxAttributes, ast: AST, meta: JSXNodeMeta) {
  const attrs = Array.from(attributes.properties) as ts.JsxAttribute[];

  for (const attr of attrs) {
    if (ts.isJsxSpreadAttribute(attr)) {
      ast.tree.push(createSpreadNode({ node: attr }));
      meta.dynamic!();
      meta.spread!();
      continue;
    }

    const initializer = attr.initializer,
      node = initializer || attr,
      literal = initializer && ts.isStringLiteral(initializer) ? initializer : undefined,
      expression =
        initializer && ts.isJsxExpression(initializer) ? initializer.expression : undefined;

    if (initializer && isEmptyNode((literal || expression)!)) continue;

    let rawName = attr.name.getText() || '',
      rawNameParts = rawName.includes(':') ? rawName.split(':') : [],
      hasValidNamespace = isValidNamespace(rawNameParts[0]),
      namespace = hasValidNamespace ? (rawNameParts[0] as JSXNamespace) : null,
      name = (hasValidNamespace ? rawNameParts[1] : rawName).replace(/^$/, ''),
      isStaticExpr = expression && isStaticExpression(expression),
      isStaticValue = !initializer || !!literal || isStaticExpr;

    const value = !initializer
      ? meta.component || namespace === '$prop'
        ? 'true'
        : '""'
      : (literal || expression)!.getText();

    const { signal: hasExpressionSignal, children } =
      !isStaticValue && expression
        ? resolveExpressionChildren(expression)
        : { signal: false, children: undefined };

    const signal = rawName.startsWith('$') || hasExpressionSignal;

    const dynamic =
      signal ||
      !isStaticValue ||
      (namespace && DYNAMIC_NAMESPACE.has(namespace)) ||
      name === 'innerHTML';

    const callId =
      expression && ts.isCallExpression(expression) && expression.arguments.length === 0
        ? expression.expression.getText()
        : undefined;

    if (expression && !isStaticExpr && !namespace?.startsWith('on')) {
      if (name === 'ref') {
        ast.tree.push(createRefNode({ node: expression, value }));
        meta.dynamic?.();
      } else if (!namespace || isValidAttrNamespace(namespace)) {
        ast.tree.push(
          createAttributeNode({
            node: expression,
            namespace,
            name,
            value,
            dynamic,
            signal,
            callId,
            children,
          }),
        );
        if (dynamic) meta.dynamic?.();
      }
    } else if (namespace === 'on' || namespace === 'on_capture') {
      const isForwardedEvent = isUndefined(expression);
      ast.tree.push(
        createEventNode({
          node: expression,
          namespace,
          type: name,
          value: !isForwardedEvent ? value : '',
          capture: namespace === 'on_capture',
          forward: isForwardedEvent,
          delegate: namespace !== 'on_capture' && DELEGATED_EVENT_TYPE.has(name),
        }),
      );
    } else {
      ast.tree.push(
        createAttributeNode({
          node: node,
          namespace: isValidAttrNamespace(namespace) ? namespace : null,
          name,
          value,
          dynamic,
          signal,
          callId,
          children,
        }),
      );

      if (dynamic) meta.dynamic?.();
    }
  }
}

function parseFragment(node: ts.JsxFragment, ast: AST, meta: JSXNodeMeta) {
  const childNodes: ComponentChildren[] = [],
    children = filterEmptyJSXChildNodes(Array.from(node.children));

  for (const child of children) {
    if (ts.isJsxText(child)) {
      childNodes.push(createTextNode({ node: child }));
    } else if (ts.isJsxExpression(child)) {
      childNodes.push(buildExpressionNode(child, { parent: node }));
    } else {
      childNodes.push(buildAST(child));
    }
  }

  ast.tree.push(
    createFragmentNode({
      node: node,
      childCount: children.length,
      childElementCount: filterDOMElements(children).length,
      children: childNodes,
    }),
  );
}

function parseChildren(root: ts.JsxElement | ts.JsxFragment, ast: AST, meta: JSXNodeMeta) {
  const children = filterEmptyJSXChildNodes(Array.from(root.children));
  for (const child of children) parseNode(child, ast, { parent: meta });
}

function parseExpression(node: ts.Expression | ts.JsxExpression, ast: AST, meta: JSXNodeMeta) {
  ast.tree.push(buildExpressionNode(node, meta));
}

function buildExpressionNode(
  node: ts.JsxExpression | ts.Expression,
  meta: JSXNodeMeta,
): ExpressionNode {
  const expression = ts.isJsxExpression(node) ? node.expression! : node,
    isRootCallExpression = ts.isCallExpression(expression),
    isCallable = isRootCallExpression && expression.arguments.length === 0,
    { signal, children } = resolveExpressionChildren(expression),
    isStatic = !signal && !children && isStaticExpression(expression);

  return createExpressionNode({
    node: node,
    children,
    signal,
    root: !meta.parent,
    dynamic: !isStatic,
    value: expression.getText(),
    callId: isCallable ? expression.expression.getText() : undefined,
  });
}
