import { $, replaceTsNodes, type TsNodeMap } from '@maverick-js/ts';
import ts from 'typescript';

import {
  type AstNode,
  type AttributeNode,
  type ComponentNode,
  type ElementNode,
  type EventNode,
  type InferTsNode,
  isExpressionNode,
  type RefNode,
} from '../../parse/ast';
import { getAttributeNodeFullName, getEventNodeFullName } from '../../parse/utils';
import type { NextState } from '../../parse/walk';
import type { Transform } from './transformer';

export function createComponentProps(node: ComponentNode) {
  if (!node.props?.length) return;
  return $.createObjectLiteralExpression(createAttributePropertyAssignmentList(node.props), true);
}

export function createComponentHostProps(node: ComponentNode, { ssr = false } = {}) {
  const props: ts.PropertyAssignment[] = [];

  if (node.class) {
    props.push($.createPropertyAssignment('class', node.class.initializer));
  }

  props.push(
    ...createAttributePropertyAssignmentList(node.classes),
    ...createAttributePropertyAssignmentList(node.vars),
  );

  if (!ssr) {
    props.push(...createEventPropertyAssignmentList(node.events));
  }

  if (!props.length) return;

  return $.createObjectLiteralExpression(props, true);
}

export function createComponentSlotsObject<State>(
  component: ComponentNode,
  transform: Transform<State>,
  nextState: NextState<State>,
) {
  if (!component.slots) return;

  const { slots } = component;

  return $.createObjectLiteralExpression(
    Object.keys(slots).map((slotName) => {
      const slot = slots[slotName],
        name = $.string(slotName),
        state = nextState(slot),
        result = transform(slot, state) ?? $.createNull();

      return $.createPropertyAssignment(
        name,
        isExpressionNode(slot) && ts.isArrowFunction(slot.expression)
          ? result
          : $.arrowFn([], result),
      );
    }),
    true,
  );
}

/**
 * Wrap expressions with child elements in a function to ensure hydration is in the correct order.
 */
export function isHigherOrderExpression(node: AstNode, state: any) {
  return (
    isExpressionNode(node) &&
    state.hydratable &&
    node.children &&
    !ts.isArrowFunction(node.expression)
  );
}

export function createElementProps(node: ElementNode, { ssr = false } = {}) {
  const props: ts.PropertyAssignment[] = [];

  props.push(
    ...createAttributePropertyAssignmentList(node.attrs),
    ...createAttributePropertyAssignmentList(node.classes),
    ...createAttributePropertyAssignmentList(node.styles),
    ...createAttributePropertyAssignmentList(node.vars),
  );

  if (!ssr) {
    props.push(...createAttributePropertyAssignmentList(node.props));
    props.push(...createEventPropertyAssignmentList(node.events));
    if (node.ref) {
      props.push(createRefPropertyAssignment(node.ref));
    }
  }

  return props.length > 0 ? $.createObjectLiteralExpression(props, true) : undefined;
}

export function createAttributePropertyAssignmentList(attrs?: AttributeNode[]) {
  return (attrs ?? []).map((attr) => createAttributePropertyAssignment(attr));
}

export function createAttributePropertyAssignment(attr: AttributeNode) {
  const name = getAttributeNodeFullName(attr);
  return $.createPropertyAssignment($.string(name), attr.initializer);
}

export function createEventPropertyAssignmentList(events?: EventNode[]) {
  return (events ?? []).map(createEventPropertyAssignment);
}
export function createEventPropertyAssignment(event: EventNode) {
  return $.createPropertyAssignment($.string(getEventNodeFullName(event)), event.initializer);
}

export function createRefPropertyAssignment(node: RefNode) {
  return $.createPropertyAssignment($.id('ref'), node.initializer);
}

export function transformAstNodeChildren<Node extends AstNode, State>(
  node: Node,
  transform: Transform<State>,
  nextState: NextState<State>,
): InferTsNode<Node> {
  const map: TsNodeMap = new WeakMap();

  if ('children' in node && node.children) {
    for (const child of node.children) {
      map.set(child.node, transform(child, nextState(child)));
    }
  }

  return replaceTsNodes(
    isExpressionNode(node) ? node.expression : node.node,
    map,
  ) as InferTsNode<Node>;
}
