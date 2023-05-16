import ts from 'typescript';

import { onceFn } from '../../utils/fn';
import { resolveExpressionChildren } from '../../utils/ts';
import {
  type AST,
  type ComponentChildren,
  createAST,
  createAttributeNode,
  createDirectiveNode,
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
} from '../ast';
import {
  DELEGATED_EVENT_TYPE,
  STATICABLE_NAMESPACE,
  SVG_ELEMENT_TAGNAME,
  VOID_ELEMENT_TAGNAME,
} from './constants';
import {
  isJSXElementNode,
  type JSXElementNode,
  type JSXNamespace,
  type JSXNodeMeta,
  type JSXRootNode,
} from './parse-jsx';
import {
  filterDOMElements,
  filterEmptyJSXChildNodes,
  getTagName,
  isComponentTagName,
  isEmptyNode,
  isStaticExpression,
  isValidAttrNamespace,
  isValidNamespace,
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
    ast.tree.push(createTextNode({ ref: node }));
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
          childNodes.push(createTextNode({ ref: child }));
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
      ast.tree.push(createSpreadNode({ ref: attr }));
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

    let rawName = attr.name.escapedText as string,
      rawNameParts = rawName.split(':'),
      hasValidNamespace = isValidNamespace(rawNameParts[0]),
      namespace = hasValidNamespace ? (rawNameParts[0] as JSXNamespace) : null,
      name = hasValidNamespace ? rawNameParts[1] : rawName,
      isStaticExpr = expression && isStaticExpression(expression),
      isStaticValue = !initializer || !!literal || isStaticExpr;

    const value = !initializer
      ? meta.component || namespace === '$prop'
        ? 'true'
        : ''
      : (literal || expression)!.getText();

    const dynamic =
      !isStaticValue || (namespace && !STATICABLE_NAMESPACE.has(namespace)) || name === 'innerHTML';

    const { observable, children } =
      !isStaticValue && expression
        ? resolveExpressionChildren(expression)
        : { observable: false, children: undefined };

    const callId =
      expression && ts.isCallExpression(expression) && expression.arguments.length === 0
        ? expression.expression.getText()
        : undefined;

    if (expression && !isStaticExpr) {
      if (name === '$ref') {
        ast.tree.push(createRefNode({ ref: expression, value }));
        meta.dynamic?.();
      } else if (namespace === '$use') {
        ast.tree.push(createDirectiveNode({ ref: expression, name, value }));
        meta.dynamic?.();
      } else if (namespace === '$on' || namespace === '$oncapture') {
        const data =
          !!initializer &&
          ts.isJsxExpression(initializer) &&
          !!initializer.expression &&
          ts.isArrayLiteralExpression(initializer.expression)
            ? initializer.expression
            : null;

        ast.tree.push(
          createEventNode({
            ref: expression,
            namespace,
            type: name,
            value: data ? data.elements[0].getText() : value,
            data: data ? data.elements[1].getText() : undefined,
            delegate: namespace !== '$oncapture' && DELEGATED_EVENT_TYPE.has(name),
          }),
        );
        meta.dynamic?.();
      } else if (!namespace || isValidAttrNamespace(namespace)) {
        ast.tree.push(
          createAttributeNode({
            ref: expression,
            namespace,
            name,
            value,
            dynamic,
            observable,
            callId,
            children,
          }),
        );
        if (dynamic) meta.dynamic?.();
      }
    } else {
      ast.tree.push(
        createAttributeNode({
          ref: node,
          namespace: isValidAttrNamespace(namespace) ? namespace : null,
          name,
          value,
          dynamic,
          observable,
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
      childNodes.push(createTextNode({ ref: child }));
    } else if (ts.isJsxExpression(child)) {
      childNodes.push(buildExpressionNode(child, { parent: node }));
    } else {
      childNodes.push(buildAST(child));
    }
  }

  ast.tree.push(
    createFragmentNode({
      ref: node,
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
    { observable, children } = resolveExpressionChildren(expression),
    isStatic = !observable && !children && isStaticExpression(expression);

  return createExpressionNode({
    ref: node,
    children,
    observable,
    root: !meta.parent,
    dynamic: !isStatic,
    value: expression.getText(),
    callId: isCallable ? expression.expression.getText() : undefined,
  });
}
