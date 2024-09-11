import { LogLevel, reportDiagnosticByNode } from '@maverick-js/logger';
import { isUndefined, trimQuotes } from '@maverick-js/std';
import {
  $,
  createJsxFragment,
  filterEmptyJsxChildNodes,
  getJsxAttribute,
  getJsxAttributes,
  getJsxChildren,
  getTagName,
  isComponentTagName,
  isEmptyNode,
  isJsxElementNode,
  isStaticLiteralNode,
  type JsxElementNode,
  type JsxRootNode,
} from '@maverick-js/ts';
import ts, { type JsxChild } from 'typescript';

import {
  type AstNode,
  type AttributeNode,
  type ComponentAttributes,
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
  INNER_CONTENT_PROP,
  SVG_ELEMENT_TAGNAME,
  VOID_ELEMENT_TAGNAME,
} from './constants';
import { type JsxAttrNamespace, type JsxNamespace } from './jsx';
import { getExpressionChildren, isValidNamespace } from './utils';

export function createAstNode(root: JsxRootNode): AstNode {
  return parseNode(root);
}

function parseNode(node: ts.Node): AstNode {
  if (isJsxElementNode(node)) {
    const tagName = getTagName(node);
    return isComponentTagName(tagName)
      ? parseComponent(node, tagName)
      : parseElement(node, tagName);
  } else if (ts.isJsxFragment(node)) {
    return parseFragment(node);
  } else if (ts.isJsxText(node) && !isEmptyNode(node)) {
    return createTextNode({ node: node });
  } else if (ts.isJsxExpression(node) && node.expression && !isEmptyNode(node)) {
    return parseExpression(node);
  } else {
    return createNoopNode(node);
  }
}

function parseElement(node: JsxElementNode, tagName: string): ElementNode {
  let isCustomElement = tagName.includes('-'),
    isVoid = VOID_ELEMENT_TAGNAME.has(tagName),
    isSVG = tagName === 'svg' || SVG_ELEMENT_TAGNAME.has(tagName),
    isDynamic = isCustomElement,
    isHost = tagName === 'host',
    attrs = parseAttrs(getJsxAttributes(node), isCustomElement, () => (isDynamic = true)),
    asAttr = isHost ? attrs.attrs?.find((attr) => attr.name === 'as')?.initializer : undefined,
    as = asAttr ? trimQuotes(asAttr.getText()) : undefined;

  if (asAttr && !ts.isStringLiteral(asAttr)) {
    reportAttributeNotStaticStringLiteral('as', node);
  }

  if (asAttr) {
    attrs.attrs = attrs.attrs!.filter((attr) => attr.name !== 'as');
  }

  return createElementNode({
    node: node,
    name: tagName,
    as,
    isVoid,
    isSVG,
    isCustomElement,
    children: !isVoid ? getJsxChildren(node)?.map(parseNode) : undefined,
    isDynamic: () => isDynamic,
    ...attrs,
  });
}

function parseComponent(node: JsxElementNode, tagName: string): ComponentNode {
  return createComponentNode({
    node,
    name: tagName,
    ...parseAttrs(getJsxAttributes(node), true),
    slots: getComponentSlots(getJsxChildren(node)),
  });
}

function getComponentSlots(jsxChildren?: ts.JsxChild[]) {
  if (!jsxChildren) return;

  const slots: Record<string, AstNode> = {},
    defaultSlots: ts.JsxChild[] = [];

  function addSlot(name: string, nodes: ts.NodeArray<JsxChild>) {
    const children = filterEmptyJsxChildNodes(Array.from(nodes));
    if (children.length === 1) {
      slots[name] = parseNode(children[0]);
    } else {
      slots[name] = parseNode(createJsxFragment($.createNodeArray(children)));
    }
  }

  for (const jsxChild of jsxChildren) {
    if (ts.isJsxElement(jsxChild) || ts.isJsxSelfClosingElement(jsxChild)) {
      const slotAttrInit = getJsxAttribute(jsxChild, 'slot')?.initializer;

      if (slotAttrInit) {
        if (!ts.isStringLiteral(slotAttrInit)) {
          reportAttributeNotStaticStringLiteral('slot', slotAttrInit);
        } else {
          const slotName = slotAttrInit.text;
          addSlot(slotName, $.createNodeArray([jsxChild]));
        }

        continue;
      }

      if (getTagName(jsxChild).includes('.Slot')) {
        const nameAttrInit = getJsxAttribute(jsxChild, 'name')?.initializer,
          slotName = nameAttrInit && ts.isStringLiteral(nameAttrInit) ? nameAttrInit.text : null;

        if (nameAttrInit && !ts.isStringLiteral(nameAttrInit)) {
          reportAttributeNotStaticStringLiteral('name', nameAttrInit);
        }

        const children = (jsxChild as ts.JsxElement).children ?? [];
        if (children.length) {
          if (!slotName) {
            defaultSlots.push(...children);
          } else {
            addSlot(slotName, children);
          }
        }

        continue;
      }
    }

    defaultSlots.push(jsxChild);
  }

  if (defaultSlots.length > 0) {
    addSlot('default', $.createNodeArray(defaultSlots));
  }

  return Object.keys(slots).length ? slots : undefined;
}

function parseAttrs(
  root: ts.JsxAttributes,
  isComponent: boolean,
  onDynamic?: () => void,
): ElementAttributes {
  let attrs: ElementAttributes = {},
    jsxAttrs = Array.from(root.properties) as (ts.JsxAttribute | ts.JsxSpreadAttribute)[];

  for (const jsxAttr of jsxAttrs) {
    if (ts.isJsxSpreadAttribute(jsxAttr)) {
      (attrs.spreads ??= []).push(
        createSpreadNode({
          node: jsxAttr,
          initializer: jsxAttr.expression,
        }),
      );
      onDynamic?.();
      continue;
    }

    const initializer = jsxAttr.initializer,
      stringLiteral = initializer && ts.isStringLiteral(initializer) ? initializer : undefined,
      expression =
        initializer && ts.isJsxExpression(initializer) ? initializer.expression : undefined;

    if (initializer && isEmptyNode((stringLiteral || expression)!)) continue;

    let attrText = jsxAttr.name.getText() || '',
      nameParts = attrText.includes(':') ? attrText.split(':') : [],
      hasValidNamespace = isValidNamespace(nameParts[0]),
      namespace = hasValidNamespace ? (nameParts[0] as JsxNamespace) : undefined,
      name = (hasValidNamespace ? nameParts[1] : attrText).replace(/^\$/, ''),
      isStaticExpression = !!expression && isStaticLiteralNode(expression),
      isStaticValue = !initializer || isStaticLiteralNode(initializer) || isStaticExpression;

    const signal = attrText.startsWith('$');

    const dynamic =
      signal ||
      !isStaticValue ||
      (namespace && DYNAMIC_NAMESPACE.has(namespace)) ||
      INNER_CONTENT_PROP.has(name) ||
      name === 'ref';

    const init = expression ?? stringLiteral ?? ts.factory.createTrue();

    if (dynamic) onDynamic?.();

    const attr: AttributeNode = {
      node: jsxAttr,
      initializer: init,
      name,
      namespace: namespace as JsxAttrNamespace,
      dynamic,
      signal,
    };

    if (INNER_CONTENT_PROP.has(name)) {
      attrs.content = attr;
    } else if (namespace) {
      if (namespace === 'on' || namespace === 'on_capture') {
        const isForwardedEvent = isUndefined(expression);
        (attrs.events ??= []).push({
          node: jsxAttr,
          initializer: init,
          namespace,
          type: name,
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
    } else if (name === 'slot') {
      attrs.slot = attr;
    } else if (name === 'ref') {
      if (expression) {
        attrs.ref = {
          node: jsxAttr,
          initializer: expression,
        };
      }
    } else if (isComponent) {
      if (name === 'class') {
        (attrs as ComponentAttributes).class = attr;
      } else {
        (attrs.props ??= []).push(attr);
      }
    } else {
      (attrs.attrs ??= []).push(attr);
    }
  }

  return attrs;
}

function parseFragment(node: ts.JsxFragment): FragmentNode {
  const children: AstNode[] = [],
    jsxChildren = filterEmptyJsxChildNodes(Array.from(node.children));

  for (const child of jsxChildren) {
    if (ts.isJsxText(child)) {
      children.push(createTextNode({ node: child }));
    } else if (ts.isJsxExpression(child)) {
      children.push(parseExpression(child));
    } else {
      const node = createAstNode(child);
      if (node) children.push(node);
    }
  }

  return createFragmentNode({ node, children });
}

function parseExpression(node: ts.JsxExpression): ExpressionNode {
  const expression = ts.isJsxExpression(node) ? node.expression! : node,
    children = getExpressionChildren(expression),
    isStatic = !children && isStaticLiteralNode(expression);
  return createExpressionNode({
    node,
    expression,
    children,
    dynamic: !isStatic,
  });
}

function reportAttributeNotStaticStringLiteral(name: string, node: ts.Node) {
  reportDiagnosticByNode(
    {
      message: `The \`${name}\` attribute must be a static string literal.`,
      node,
    },
    LogLevel.Error,
  );
}
