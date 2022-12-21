import { createComment, isDOMNode } from '../../std/dom';
import { unwrapDeep } from '../../std/signal';
import { isArray, isFunction, isNumber, isString } from '../../std/unit';
import type { JSX } from '../jsx';
import { effect } from '../reactivity';
import { reconcile } from './reconcile';
import { hydration } from './render';

const QUICK_CLEAR = Symbol(),
  ARRAY_END_MARKER = '/[]';

export function insert(
  parent: Node | DocumentFragment,
  value: JSX.Element,
  before: Node | null = null,
) {
  const marker = createComment('~');
  parent.insertBefore(marker, before);
  insertExpression(marker, value);
}

export function insertExpression(
  marker: Comment,
  value: JSX.Element,
  current?: JSX.Element,
  isSignal = false,
): JSX.Element {
  if (isFunction(value)) {
    let current;
    effect(() => void (current = insertExpression(marker, unwrapDeep(value), current, true)));
    return;
  } else if (hydration && !isSignal) {
    marker.remove();
    return;
  }

  if (value === current) {
    // no-op
  } else if (isDOMNode(value)) {
    current = hydration ? value : updateDOM(marker, current, value);
  } else if (isString(value) || isNumber(value)) {
    if (isDOMNode(current) && current.nodeType === 3) {
      current.textContent = value + '';
    } else if (!hydration) {
      current = updateDOM(marker, current, document.createTextNode(value + ''));
    } else {
      current = marker.nextSibling!;
    }
  } else if (isArray(value)) {
    const newNodes: Node[] = [],
      currentNodes = hydration
        ? claimArray(marker)
        : current && isArray(current)
        ? (current as Node[])
        : [];

    if (resolveArray(newNodes, value, currentNodes, isSignal)) {
      effect(() => void (current = insertExpression(marker, newNodes, currentNodes, true)));
      return () => current;
    }

    if (hydration) return currentNodes;

    if (newNodes.length === 0) {
      updateDOM(marker, current);
    } else if (currentNodes.length) {
      reconcile(marker.parentElement!, currentNodes, newNodes);
    } else {
      current && updateDOM(marker, current);
      appendArray(marker, newNodes);
    }

    current = newNodes;
  } else if (current) {
    current = updateDOM(marker, current);
  }

  if (!isSignal) marker.remove();
  return current;
}

function appendArray(marker: Comment, nodes: Node[]) {
  const parent = marker.parentElement!,
    len = nodes.length,
    endMarker = createComment(ARRAY_END_MARKER);
  if (parent.childNodes.length === 1) {
    for (let i = 0; i < len; i++) parent.appendChild(nodes[i]);
    parent.appendChild(endMarker);
    marker[QUICK_CLEAR] = true;
  } else {
    marker.after(endMarker);
    for (let i = 0; i < len; i++) parent.insertBefore(nodes[i], endMarker);
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

function claimArray(marker: Comment): Node[] {
  let node: Node | null = marker.nextSibling,
    nodes: Node[] = [];

  while (node) {
    if (node.nodeType !== 8) {
      nodes.push(node);
    } else if (node.nodeValue === ARRAY_END_MARKER) {
      if (node.parentNode!.lastChild === node) marker[QUICK_CLEAR] = true;
      nodes.push(node);
      break;
    }

    node = node.nextSibling;
  }

  return nodes;
}

// adapted from: https://github.com/ryansolid/dom-expressions/blob/main/packages/dom-expressions/src/client.js#L485
function updateDOM(marker: Comment, current: JSX.Element, replace?: Node) {
  const parent = marker.parentElement!,
    node = replace || createComment('~');

  if (isArray(current) && current.length) {
    if (marker[QUICK_CLEAR]) {
      parent.textContent = '';
      parent.appendChild(marker);
      return null;
    }

    let el: Node,
      inserted = false,
      isParent = false;

    for (let i = current.length - 1; i >= 0; i--) {
      el = current[i] as Node;
      if (el !== node) {
        isParent = el.parentNode === parent;
        if (!inserted && !i) isParent ? parent.replaceChild(node, el) : marker.after(node);
        else isParent && parent.removeChild(el);
      } else inserted = true;
    }
  } else if (isDOMNode(current)) {
    parent.replaceChild(node, current);
  } else {
    marker.after(node);
  }

  return node;
}

export type MarkerWalker = TreeWalker;

export const createMarkerWalker = (root: Node): MarkerWalker =>
  // @ts-expect-error - filter accepts `boolean` but not typed.
  document.createTreeWalker(root, NodeFilter.SHOW_COMMENT, (node) => node.nodeValue === '$');
