import { createComment, createFragment, isDOMNode } from '../../std/dom';
import { unwrapDeep } from '../../std/signal';
import { isArray, isFunction, isNumber, isString } from '../../std/unit';
import type { JSX } from '../jsx';
import { effect } from '../reactivity';
import { hydration } from './render';

const TEXT = Symbol();
const END_MARKER = Symbol();

// <!--$-->
export type StartMarker = Comment & {
  [TEXT]?: Text | null;
  /** Matching end marker. */
  [END_MARKER]?: EndMarker;
};

// <!--/$-->
export type EndMarker = Comment;

export function insert(
  parent: Node | DocumentFragment,
  value: JSX.Element,
  before: Node | null = null,
) {
  const marker = createComment('$$');
  if (before === null) parent.appendChild(marker);
  else parent.insertBefore(marker, before);
  insertExpression(marker, value);
}

export function insertExpression(start: StartMarker, value: JSX.Element, isSignal = false) {
  if (isFunction(value)) {
    effect(() => void insertExpression(start, unwrapDeep(value), true));
    return;
  } else if (hydration && !isSignal) {
    start.remove();
    return;
  }

  let lastChild: Node = start,
    end = start[END_MARKER];

  if (isArray(value)) {
    // This won't exist yet when hydrating so nodes will stay intact.
    if (end) removeNodesBetweenMarkers(start, end);

    const flattened = value.flat(10).filter((v) => v || v === '' || v === 0);
    const hasChildren = flattened.length > 0;

    if (hydration && hasChildren) {
      lastChild = resolveLastNode(start, flattened.length);
    } else if (hasChildren) {
      const fragment = createFragment();
      for (let i = 0; i < flattened.length; i++) {
        const child = flattened[i];
        if (isFunction(child) || isArray(child)) {
          insert(fragment, child);
        } else if (child) {
          fragment.append(child as any);
        }
      }
      lastChild = fragment.lastChild!;
      start.after(fragment);
    }
  } else if (isDOMNode(value)) {
    // This won't exist yet when hydrating so nodes will stay intact.
    if (end) removeNodesBetweenMarkers(start, end);
    lastChild = value;
    if (!hydration) start.after(value);
  } else if (isString(value) || isNumber(value)) {
    if (start[TEXT]) {
      start[TEXT].data = value + '';
    } else {
      if (end) removeNodesBetweenMarkers(start, end);
      if (!hydration) {
        lastChild = document.createTextNode(value + '');
        start.after(lastChild);
      } else {
        lastChild = start.nextSibling!;
      }
      start[TEXT] = lastChild as Text;
    }
  } else if (end) {
    removeNodesBetweenMarkers(start, end);
  }

  if (!isSignal) {
    start.remove();
    return;
  }

  if (!end) {
    const marker = createComment('/$');
    start[END_MARKER] = marker;
    (lastChild as Element).after(marker);
  }
}

function getNodeIndex(node: Node) {
  // @ts-expect-error
  return [].indexOf.call(node.parentNode!.childNodes, node);
}

function removeNodesBetweenMarkers(start: Node, end: Node) {
  let next = start.nextSibling,
    sibling;

  while (next && next !== end) {
    sibling = next.nextSibling;
    next.remove();
    next = sibling;
  }

  start[TEXT] = null;
}

function resolveLastNode(start: StartMarker, nodesCount: number) {
  let index = getNodeIndex(start),
    stop = nodesCount,
    childNodes = start.parentElement!.childNodes;

  while (index < stop && index < childNodes.length) {
    index++;
    if (childNodes[index].nodeType === 8) stop++;
  }

  let next = childNodes[index + 1];
  while (next?.nodeType === 8 && next.textContent === '/$') {
    index++;
    next = childNodes[index + 1];
  }

  return childNodes[index];
}

export type MarkerWalker = TreeWalker;

export const createMarkerWalker = (root: Node): MarkerWalker =>
  // @ts-expect-error - filter accepts `boolean` but not typed.
  document.createTreeWalker(root, NodeFilter.SHOW_COMMENT, (node) => node.nodeValue === '$');
