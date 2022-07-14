import {
  filterEmptyJSXChildNodes,
  getTagName,
  isComponentTagName,
  isEmptyNode,
  isStaticExpression,
  isValidAttrNamespace,
  isValidEventNamespace,
  isValidNamespace,
} from './utils';
import { containsCallExpression, onceFn, trimQuotes } from '../utils';
import * as t from 'typescript';
import {
  type AST,
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
import {
  CHILD_PROP,
  DELEGATED_EVENT_TYPE,
  SVG_ELEMENT_TAGNAME,
  VOID_ELEMENT_TAGNAME,
} from './constants';

export function buildAST(node: JSXRootNode, meta: Omit<JSXNodeMeta, 'parent'> = {}) {
  const ast = createAST(node);
  parseNode(node, ast, { ...meta, parent: undefined });
  return ast;
}

function parseNode(node: t.Node, ast: AST, meta: JSXNodeMeta) {
  if (isJSXElementNode(node)) {
    parseElementNode(node, ast, meta);
  } else if (t.isJsxFragment(node)) {
    parseFragment(node, ast, meta);
  } else if (t.isJsxText(node) && !isEmptyNode(node)) {
    ast.tree.push(createTextNode({ ref: node }));
  } else if (t.isJsxExpression(node) && node.expression && !isEmptyNode(node)) {
    parseExpression(node, ast, meta);
  }
}

function parseElementNode(node: JSXElementNode, ast: AST, meta: JSXNodeMeta) {
  const tagName = getTagName(node);
  const isComponent = isComponentTagName(tagName);
  const isVoid = !isComponent && VOID_ELEMENT_TAGNAME.has(tagName);
  const isSVGChild =
    !isComponent && !meta.parent && tagName != 'svg' && SVG_ELEMENT_TAGNAME.has(tagName);
  const isSelfClosing = t.isJsxSelfClosingElement(node);
  const supportsChildren = isSelfClosing || isVoid;

  const filteredChildren = !supportsChildren
    ? filterEmptyJSXChildNodes(Array.from(node.children))
    : [];

  const hasChildren = filteredChildren.length > 0;

  // Whether this element contains any dynamic expressions which would require the
  // template to be split.
  let isDynamic = isComponent;
  const dynamic = onceFn(() => {
    isDynamic = true;
  });

  ast.tree.push(
    createElementNode({
      ref: node,
      tagName,
      isVoid,
      isSVG: !!isSVGChild,
      isCE: tagName.includes('-'),
      hasChildren,
      isComponent: isComponent,
      dynamic: () => isDynamic,
    }),
  );

  const attributes = isSelfClosing ? node.attributes : node.openingElement.attributes;
  parseElementAttrs(attributes, ast, { parent: meta, dynamic });
  ast.tree.push(createStructuralNode(StructuralNodeType.AttributesEnd));

  if (hasChildren) {
    ast.tree.push(createStructuralNode(StructuralNodeType.ChildrenStart));
    for (const child of filteredChildren) {
      parseNode(child, ast, {
        parent: meta,
        isSVGChild,
        dynamic,
      });
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

    const rawName = attr.name.escapedText as string;
    const rawNameParts = rawName.split(':');

    const hasValidNamespace = isValidNamespace(rawNameParts[0]);
    const namespace = hasValidNamespace ? (rawNameParts[0] as JSXNamespace) : null;
    const name = hasValidNamespace ? rawNameParts[1] : rawName;

    const valueNode: t.StringLiteral | t.Expression = (literal ?? expression)!;

    const isStaticExpr = !literal && expression && isStaticExpression(expression);
    const isStatic = literal || isStaticExpr;
    const staticValue = isStatic ? trimQuotes(valueNode.getText()) : undefined;

    const isRef = name === '$ref';
    const isEvent = namespace?.startsWith('$on');
    const onlySupportsExpression = hasValidNamespace || isRef || isEvent;

    if (expression && !isStaticExpr) {
      if (isRef) {
        ast.tree.push(createRefNode({ ref: attr, value: expression }));
        meta.dynamic?.();
      } else if (namespace === '$use') {
        ast.tree.push(createDirectiveNode({ ref: attr, name, value: expression }));
        meta.dynamic?.();
      } else if (isEvent) {
        const eventNamespace = namespace && isValidEventNamespace(namespace) ? namespace : null;
        const shouldDelegate = DELEGATED_EVENT_TYPE.has(name);
        ast.tree.push(
          createEventNode({
            ref: attr,
            namespace: eventNamespace,
            type: name,
            value: expression,
            delegate: shouldDelegate,
          }),
        );
        meta.dynamic?.();
      } else if (!namespace || isValidAttrNamespace(namespace)) {
        ast.tree.push(
          createAttributeNode({
            ref: attr,
            namespace,
            name,
            value: expression,
            observable: containsCallExpression(expression),
          }),
        );
        meta.dynamic?.();
      }
    } else {
      if (CHILD_PROP.has(name) || hasValidNamespace || onlySupportsExpression) {
        ast.tree.push(
          createAttributeNode({
            ref: attr,
            namespace: isValidAttrNamespace(namespace) ? namespace : null,
            name,
            value: (staticValue || expression)!,
            observable: !staticValue && expression && containsCallExpression(expression),
          }),
        );

        meta.dynamic?.();
      } else if (staticValue) {
        ast.tree.push(
          createAttributeNode({
            ref: attr,
            namespace: null,
            name: !meta.isSVGChild ? name.toLowerCase() : name,
            value: staticValue,
          }),
        );
      }
    }
  }
}

function parseFragment(fragment: t.JsxFragment, ast: AST, meta: JSXNodeMeta) {
  const filteredChildren = filterEmptyJSXChildNodes(Array.from(fragment.children));

  ast.tree.push(createStructuralNode(StructuralNodeType.FragmentStart));
  for (const child of filteredChildren) parseNode(child, ast, { parent: meta });
  ast.tree.push(createStructuralNode(StructuralNodeType.FragmentEnd));
}

function parseExpression(node: t.JsxExpression, ast: AST, meta: JSXNodeMeta) {
  const expression = node.expression!;

  let observable: true | undefined;
  let children: AST[] | undefined;

  const parse = (node: t.Node) => {
    if (t.isCallExpression(node)) {
      observable = true;
    } else if (isJSXElementNode(node) || t.isJsxFragment(node)) {
      if (!children) children = [];
      children!.push(buildAST(node));
      return;
    }

    t.forEachChild(node, parse);
  };

  t.forEachChild(node, parse);

  const isStatic = !observable && !children && isStaticExpression(expression);

  ast.tree.push(
    createExpressionNode({
      ref: node,
      children,
      observable,
      root: !meta.parent,
      value: isStatic ? trimQuotes(expression.getText()) : expression,
    }),
  );

  if (!isStatic) meta.dynamic?.();
}
