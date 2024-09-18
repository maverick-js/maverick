import { $ } from '@maverick-js/ts';
import type ts from 'typescript';

import {
  type ComponentNode,
  type ElementNode,
  type ExpressionNode,
  isElementNode,
} from '../../../parse/ast';
import { findElementIndex } from '../../../parse/utils';
import type { Walker } from '../../../parse/walk';
import type { DomTransformState } from './state';

/**
 * Create (if needed) a variable that points to the current element node in the template. It will
 * uses parent and sibling elements to build the correct access expressions.
 *
 * @example
 * ```html
 * <button><div><span></span></div></button>
 * ```
 * ```ts
 * let root = $$_clone(template), // <button>
 *   element = root.firstChild,  // <div>
 *   element_2 = element.nextSibling; // <span>
 * ```
 */
export function getElementId(node: ElementNode, state: DomTransformState, walk: Walker<any>) {
  if (state.elements.has(node)) {
    return state.elements.get(node);
  }

  const positions = getChildElementPositions(node, walk);

  for (const { parent, child, childIndex } of positions) {
    if (state.elements.has(child)) continue;

    const parentId = state.elements.get(parent);
    assert(parentId);

    const expression =
      childIndex === 0
        ? $.prop(parentId, $.id('firstChild'))
        : state.runtime.child(parentId, childIndex);

    state.elements.set(child, state.vars.setup.element(expression));
  }

  return state.elements.get(node);
}

/**
 * Walk up the element tree and find the position of each node respective to it's parent. The
 * result can be used to build the correct element access expression as shown in `getElementId`
 * above.
 */
export function getChildElementPositions(node: ElementNode, walk: Walker<any>) {
  let current = node,
    path: { parent: ElementNode; child: ElementNode; childIndex: number }[] = [];

  for (let i = walk.path.length - 1; i >= 0; i--) {
    const parent = walk.path[i];

    if (!isElementNode(parent)) continue;

    path.push({
      parent,
      child: current,
      childIndex: findElementIndex(parent, current),
    });

    current = parent;
  }

  return path.reverse();
}

/**
 * This function is used to create (if needed) and get the identifier for the sibling element
 * that comes right after the expression in the template. This is done to ensure the
 * expression is inserted in the correct position. For hydration, a marker is used and this is not
 * required.
 */
export function getMarkerId(
  node: ComponentNode | ExpressionNode,
  state: DomTransformState,
  walk: Walker<any>,
) {
  const parentElement = [...walk.path].reverse().find(isElementNode);
  if (!parentElement?.children || parentElement.children.length === 1) return;

  const componentIndex = parentElement.children.indexOf(node),
    siblingElement = parentElement.children.slice(componentIndex + 1).find(isElementNode);

  if (siblingElement) {
    return getElementId(siblingElement, state, walk);
  }
}

export function insert(
  rootElement: ElementNode,
  value: ts.Expression,
  node: ComponentNode | ExpressionNode,
  state: DomTransformState,
  walk: Walker<any>,
) {
  if (state.hydratable) {
    state.html += '<!$>';
    assert(state.walker);
    const markerId = state.vars.setup.nextNode(state.walker);
    state.block.push(state.runtime.insertAtMarker(markerId, value));
  } else {
    const rootId = state.elements.get(rootElement);
    assert(rootId);
    const markerId = getMarkerId(node, state, walk);
    state.block.push(state.runtime.insert(rootId, value, markerId));
  }
}
