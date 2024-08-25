import { isUndefined } from '@maverick-js/std';
import ts from 'typescript';

import {
  type ASTNode,
  type AttributeNode,
  type ComponentNode,
  createComponentNode,
  createElementNode,
  createExpressionNode,
  createFragmentNode,
  createNoopNode,
  createSpreadNode,
  createTextNode,
  type ElementAttributes,
  type ElementNode,
  type ExpressionNode,
  type FragmentNode,
} from './ast';
import {
  DELEGATED_EVENT_TYPE,
  DYNAMIC_NAMESPACE,
  SVG_ELEMENT_TAGNAME,
  VOID_ELEMENT_TAGNAME,
} from './constants';
import { type JsxElementNode, type JsxNamespace, type JsxRootNode } from './jsx/types';
import {
  filterEmptyJsxChildNodes,
  getTagName,
  isComponentTagName,
  isEmptyNode,
  isJsxElementNode,
  isStaticNode,
  isValidNamespace,
  resolveExpressionChildren,
  resolveJsxAttrs,
  resolveJsxChildren,
} from './utils';

export function createASTNode(root: JsxRootNode): ASTNode {
  if (ts.isBinaryExpression(root) || ts.isConditionalExpression(root)) {
    return parseExpression(root, true);
  } else {
    return parseNode(root);
  }
}

function parseNode(node: ts.Node): ASTNode {
  if (isJsxElementNode(node)) {
    const tagName = getTagName(node);
    return isComponentTagName(tagName)
      ? parseElement(node, tagName)
      : parseComponent(node, tagName);
  } else if (ts.isJsxFragment(node)) {
    return parseFragment(node);
  } else if (ts.isJsxText(node) && !isEmptyNode(node)) {
    return createTextNode({ node: node });
  } else if (ts.isJsxExpression(node) && node.expression && !isEmptyNode(node)) {
    return parseExpression(node);
  } else {
    return createNoopNode();
  }
}

function parseElement(node: JsxElementNode, tagName: string): ElementNode {
  const isCustomElement = tagName.includes('-'),
    isVoid = VOID_ELEMENT_TAGNAME.has(tagName),
    isSVG = tagName === 'svg' || SVG_ELEMENT_TAGNAME.has(tagName);

  return createElementNode({
    node: node,
    tagName,
    isVoid,
    isSVG,
    isCustomElement,
    children: !isVoid ? resolveJsxChildren(node)?.map(parseNode) : undefined,
    ...parseAttrs(resolveJsxAttrs(node), false),
  });
}

function parseComponent(node: JsxElementNode, tagName: string): ComponentNode {
  return createComponentNode({
    node,
    tagName,
    children: resolveJsxChildren(node)?.map(parseNode),
    ...parseAttrs(resolveJsxAttrs(node), true),
  });
}

function parseAttrs(root: ts.JsxAttributes, isComponent: boolean): ElementAttributes {
  let attrs: ElementAttributes = {},
    jsxAttrs = Array.from(root.properties) as ts.JsxAttribute[];

  for (const jsxAttr of jsxAttrs) {
    if (ts.isJsxSpreadAttribute(jsxAttr)) {
      (attrs.spreads ??= []).push(createSpreadNode({ node: jsxAttr }));
      continue;
    }

    const initializer = jsxAttr.initializer,
      node = initializer || jsxAttr,
      stringLiteral = initializer && ts.isStringLiteral(initializer) ? initializer : undefined,
      expression =
        initializer && ts.isJsxExpression(initializer) ? initializer.expression : undefined;

    if (initializer && isEmptyNode((stringLiteral || expression)!)) continue;

    let attrText = jsxAttr.name.getText() || '',
      nameParts = attrText.includes(':') ? attrText.split(':') : [],
      hasValidNamespace = isValidNamespace(nameParts[0]),
      namespace = hasValidNamespace ? (nameParts[0] as JsxNamespace) : null,
      name = (hasValidNamespace ? nameParts[1] : attrText).replace(/^$/, ''),
      isStaticExpression = !!expression && isStaticNode(expression),
      isStaticValue = !initializer || isStaticNode(initializer) || isStaticExpression;

    const value = !initializer
      ? namespace === 'prop' || namespace === '$prop'
        ? 'true'
        : '""'
      : (stringLiteral || expression)!.getText();

    const { signal: hasDynamicExpression, children } =
      !isStaticValue && expression
        ? resolveExpressionChildren(expression)
        : { signal: false, children: undefined };

    const signal = attrText.startsWith('$') || hasDynamicExpression;

    const dynamic =
      signal ||
      !isStaticValue ||
      (namespace && DYNAMIC_NAMESPACE.has(namespace)) ||
      name === 'innerHTML';

    const attr: AttributeNode = {
      node: expression ?? node,
      name,
      value,
      dynamic,
      signal,
      children,
    };

    if (namespace) {
      if (namespace === 'on' || namespace === 'on_capture') {
        const isForwardedEvent = isUndefined(expression);
        (attrs.events ??= []).push({
          node: expression ?? node,
          namespace,
          type: name,
          value: !isForwardedEvent ? value : '',
          capture: namespace === 'on_capture',
          forward: isForwardedEvent,
          delegate: namespace !== 'on_capture' && DELEGATED_EVENT_TYPE.has(name),
        });
      } else if (namespace === 'class' || namespace === '$class') {
        (attrs.classes ??= []).push(attr);
      } else if (namespace === 'prop' || namespace === '$prop') {
        (attrs.props ??= []).push(attr);
      } else if (namespace === 'style' || namespace === '$style') {
        (attrs.styles ??= []).push(attr);
      } else if (namespace === 'var' || namespace === '$var') {
        (attrs.vars ??= []).push(attr);
      }
    } else if (name === 'ref') {
      if (expression) attrs.ref = { node: expression, value };
    } else if (name === 'class') {
      attrs.class = attr;
    } else if (name === 'style') {
      attrs.style = attr;
    } else if (isComponent) {
      (attrs.props ??= []).push(attr);
    } else {
      (attrs.attrs ??= []).push(attr);
    }
  }

  return attrs;
}

function parseFragment(node: ts.JsxFragment): FragmentNode {
  const children: ASTNode[] = [],
    jsxChildren = filterEmptyJsxChildNodes(Array.from(node.children));

  for (const child of jsxChildren) {
    if (ts.isJsxText(child)) {
      children.push(createTextNode({ node: child }));
    } else if (ts.isJsxExpression(child)) {
      children.push(buildExpressionNode(child));
    } else {
      const node = createASTNode(child);
      if (node) children.push(node);
    }
  }

  return createFragmentNode({ node, children });
}

function parseExpression(node: ts.Expression | ts.JsxExpression, isRoot?: boolean) {
  return buildExpressionNode(node, isRoot);
}

function buildExpressionNode(
  node: ts.JsxExpression | ts.Expression,
  isRoot?: boolean,
): ExpressionNode {
  const expression = ts.isJsxExpression(node) ? node.expression! : node,
    isRootCallExpression = ts.isCallExpression(expression),
    isCallable = isRootCallExpression && expression.arguments.length === 0,
    { signal, children } = resolveExpressionChildren(expression),
    isStatic = !signal && !children && isStaticNode(expression);

  return createExpressionNode({
    node,
    children,
    signal,
    root: isRoot,
    dynamic: !isStatic,
    value: expression.getText(),
    callId: isCallable ? expression.expression.getText() : undefined,
  });
}
