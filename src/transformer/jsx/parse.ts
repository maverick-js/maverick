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

  const filteredChildren = !supportsChildren
    ? filterEmptyJSXChildNodes(Array.from(node.children))
    : [];

  const hasChildren = filteredChildren.length > 0;

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
      element.children = buildAST(node, { isSVGChild, dynamic }, true);
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
    const isStatic = !!literal || isStaticExpr;

    const isRef = name === '$ref';
    const isEvent = namespace?.startsWith('$on');
    const onlySupportsExpression = hasValidNamespace || isRef || isEvent;

    if (expression && !isStaticExpr) {
      if (isRef) {
        ast.tree.push(createRefNode({ ref: expression, value: expression.getText() }));
        meta.dynamic?.();
      } else if (namespace === '$use') {
        ast.tree.push(createDirectiveNode({ ref: expression, name, value: expression.getText() }));
        meta.dynamic?.();
      } else if (isEvent) {
        const eventNamespace = namespace && isValidEventNamespace(namespace) ? namespace : null;
        const shouldDelegate = DELEGATED_EVENT_TYPE.has(name);
        ast.tree.push(
          createEventNode({
            ref: expression,
            namespace: eventNamespace,
            type: name,
            value: expression.getText(),
            delegate: shouldDelegate,
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
            dynamic: !isStatic,
            observable: containsCallExpression(expression),
          }),
        );
        meta.dynamic?.();
      }
    } else {
      if (CHILD_PROP.has(name) || hasValidNamespace || onlySupportsExpression) {
        ast.tree.push(
          createAttributeNode({
            ref: (literal || expression)!,
            namespace: isValidAttrNamespace(namespace) ? namespace : null,
            name,
            value: value!.getText(),
            dynamic: !isStatic,
            observable: !isStatic && expression && containsCallExpression(expression),
          }),
        );

        meta.dynamic?.();
      } else {
        ast.tree.push(
          createAttributeNode({
            ref: (literal || expression)!,
            namespace: null,
            name: !meta.isSVGChild ? name.toLowerCase() : name,
            value: value.getText(),
          }),
        );
      }
    }
  }
}

function parseFragment(fragment: t.JsxFragment, ast: AST, meta: JSXNodeMeta) {
  parseChildren(fragment, ast, meta);
}

function parseChildren(root: t.JsxElement | t.JsxFragment, ast: AST, meta: JSXNodeMeta) {
  const filteredChildren = filterEmptyJSXChildNodes(Array.from(root.children));
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
      dynamic: !isStatic,
      value: expression.getText(),
    }),
  );

  if (!isStatic) meta.dynamic?.();
}
