import { createComment, isDOMNode } from '../../std/dom';
import { unwrapDeep } from '../../std/signal';
import { isArray, isFunction, isNumber, isString, isUndefined } from '../../std/unit';
import type { JSX } from '../jsx';
import { effect } from '../reactivity';
import { reconcile } from './reconcile';
import { hydration } from './render';

// adapted from: https://github.com/ryansolid/dom-expressions/blob/main/packages/dom-expressions/src/client.js#L373
export function insertExpression(
  parent: Node,
  value: JSX.Element,
  marker?: Node | Comment | null,
  current?: JSX.Element,
  isSignal = false,
): JSX.Element {
  if (isFunction(value)) {
    let current;
    effect(
      () => void (current = insertExpression(parent, unwrapDeep(value), marker, current, true)),
    );
    return;
  } else if (hydration && !isSignal) {
    (marker as Comment).remove();
    return;
  }

  if (value === current) {
    // no-op
  } else if (isDOMNode(value)) {
    if (hydration) {
      // no-op
    } else if (marker || isArray(current)) {
      if (!isUndefined(marker)) return (current = updateDOM(parent, current, marker, value));
      updateDOM(parent, current, null, value);
    } else if (!current || !parent.firstChild) {
      parent.appendChild(value);
    } else parent.replaceChild(value, parent.firstChild);

    current = value;
  } else if (isString(value) || isNumber(value)) {
    if (!isUndefined(marker)) {
      if (isDOMNode(current) && current.nodeType === 3) {
        (current as Text).data = value + '';
      } else if (!hydration) {
        current = updateDOM(parent, current, marker, document.createTextNode(value + ''));
      } else {
        current = (marker as Comment).nextSibling!;
      }
    } else if (current !== '' && isString(current)) {
      current = (parent.firstChild as Text).data = value + '';
    } else current = parent.textContent = value + '';
  } else if (isArray(value)) {
    const newNodes: Node[] = [],
      currentNodes = hydration
        ? claimArray(marker as Comment)
        : current && isArray(current)
        ? (current as Node[])
        : [];

    if (resolveArray(newNodes, value, currentNodes, isSignal)) {
      effect(() => void (current = insertExpression(parent, newNodes, marker, currentNodes, true)));
      return () => current;
    }

    if (hydration) return currentNodes;

    if (newNodes.length === 0) {
      updateDOM(parent, current);
    } else if (currentNodes.length) {
      reconcile(parent, currentNodes, newNodes);
    } else {
      current && updateDOM(parent, current, marker);
      appendArray(parent, newNodes, marker);
    }

    current = newNodes;
  } else {
    current = updateDOM(parent, current, marker);
  }

  return current;
}

function appendArray(parent: Node, nodes: Node[], marker?: Node | null) {
  const len = nodes.length;
  if (isUndefined(marker)) {
    for (let i = 0; i < len; i++) parent.appendChild(nodes[i]);
  } else {
    for (let i = 0; i < len; i++) parent.insertBefore(nodes[i], marker);
  }
}

function resolveArray(nodes: Node[], values: JSX.Nodes, current: Node[], unwrap: boolean): boolean {
  let value: JSX.Element,
    prev,
    effect = false;

  for (let i = 0; i < values.length; i++) {
    (value = values[i]), (prev = current[i]);

    if (isDOMNode(value)) {
      nodes.push(value);
    } else if (isArray(value)) {
      effect = resolveArray(nodes, value, (isArray(prev) ? prev : []) as Node[], unwrap) || effect;
    } else if (isFunction(value)) {
      if (unwrap) {
        value = unwrapDeep(value);
        effect =
          resolveArray(
            nodes,
            isArray(value) ? value : [value],
            (isArray(prev) ? prev : [prev]) as Node[],
            true,
          ) || effect;
      } else {
        // Pushing function here is fine as it'll be unwrapped in second pass inside effect.
        nodes.push(value as any);
        effect = true;
      }
    } else if (value || value === 0) {
      const text = value + '';
      if (prev && prev.nodeType === 3 && prev.data === text) {
        nodes.push(prev);
      } else {
        nodes.push(document.createTextNode(text));
      }
    }
  }

  return effect;
}

const ARRAY_END_MARKER = '/[]';

function claimArray(marker: Comment): Node[] {
  let node: Node | null = marker.nextSibling,
    nodes: Node[] = [];

  while (node) {
    if (node.nodeType !== 8) {
      nodes.push(node);
    } else if (node.nodeValue === ARRAY_END_MARKER) {
      (node as Comment).remove();
      break;
    }

    node = node.nextSibling;
  }

  return nodes;
}

// adapted from: https://github.com/ryansolid/dom-expressions/blob/main/packages/dom-expressions/src/client.js#L485
function updateDOM(parent: Node, current: JSX.Element, marker?: Node | null, replace?: Node) {
  if (isUndefined(marker)) {
    parent.textContent = '';
    return;
  }

  const node = replace || createComment('~');

  if (isArray(current) && current.length) {
    let el: Node,
      inserted = false,
      isParent = false;

    for (let i = current.length - 1; i >= 0; i--) {
      el = current[i] as Node;
      if (el !== node) {
        isParent = el.parentNode === parent;
        if (!inserted && !i)
          isParent ? parent.replaceChild(node, el) : parent.insertBefore(node, marker);
        else isParent && parent.removeChild(el);
      } else inserted = true;
    }
  } else if (isDOMNode(current)) {
    parent.replaceChild(node, current);
  } else {
    parent.insertBefore(node, marker);
  }

  return node;
}

export type MarkerWalker = TreeWalker;

export const createMarkerWalker = (root: Node): MarkerWalker =>
  // @ts-expect-error - filter accepts `boolean` but not typed.
  document.createTreeWalker(root, NodeFilter.SHOW_COMMENT, (node) => node.nodeValue === '$');
