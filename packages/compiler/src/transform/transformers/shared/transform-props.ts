import type ts from 'typescript';

import { type AstNode, type AttributeNode, isElementNode } from '../../../parse/ast';
import { type Visitors, walk } from '../../../parse/walk';

const visitors: Visitors<TransformState> = {
  Element(el, { state, walk }) {
    transformAttrs(el, state, el.spreads);
    transformAttrs(el, state, filterDynamic(el.attrs));
    transformAttrs(el, state, filterDynamic(el.props));
    transformAttrs(el, state, filterDynamic(el.classes));
    transformAttrs(el, state, filterDynamic(el.styles));
    transformAttrs(el, state, filterDynamic(el.vars));
    transformAttrs(el, state, el.events);
    if (el.ref?.initializer) transformAttrs(el, state, [el.ref]);
    if (el.content?.dynamic) transformAttrs(el, state, [el.content]);
    walk.children();
  },
  Component(component, { state }) {
    transformAttrs(component, state, component.spreads);
    transformAttrs(component, state, filterDynamic(component.props));
    if (component.class?.dynamic) transformAttrs(component, state, [component.class]);
    transformAttrs(component, state, filterDynamic(component.classes));
    transformAttrs(component, state, filterDynamic(component.vars));
    transformAttrs(
      component,
      state,
      component.events?.filter((e) => !e.forward),
    );
    if (component.ref?.initializer) transformAttrs(component, state, [component.ref]);
  },
  Fragment(node, { walk }) {
    const parentElement = walk.path.at(-1),
      hasParentElement = Boolean(parentElement && isElementNode(parentElement));
    if (hasParentElement) walk.children();
  },
};

/**
 * Walk through the AST and transform dynamic JSX attribute initializers (i.e., values).
 * For example, this can be used to map the values to identifiers which can then be hoisted up
 * to the root call expression.
 */
export function transformProps(node: AstNode, transform: PropTransform) {
  walk({
    node,
    visitors,
    state: {
      transform,
    },
  });
}

interface TransformState {
  transform: PropTransform;
}

interface PropTransform {
  (node: AstNode, value: ts.Expression): ts.Expression;
}

function transformAttrs(
  node: AstNode,
  state: TransformState,
  attrs?: { initializer: ts.Expression }[],
) {
  if (!attrs) return;
  for (const attr of attrs) {
    attr.initializer = state.transform(node, attr.initializer);
  }
}

function filterDynamic(nodes?: AttributeNode[]) {
  return nodes?.filter((node) => node.dynamic);
}
