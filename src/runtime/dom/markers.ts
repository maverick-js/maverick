import type { JSX } from '../jsx';
import { $effect } from '@maverick-js/observables';
import { isDOMNode } from './utils';
import { isFunction, isNumber, isString } from '../../utils/unit';
import { hydration } from './render';

const END_MARKER = Symbol();

// <!--$-->
export type StartMarker = Comment & {
  /** Matching end marker. */
  [END_MARKER]?: EndMarker;
};

// <!--/$-->
export type EndMarker = Comment;

// start markers (<!--$-->) are reserved for hydration.
export const createMarker = () => document.createComment('/$');

export function insertNodeAtMarker(start: StartMarker, value: JSX.Element, observable = false) {
  if (isFunction(value)) {
    $effect(() => insertNodeAtMarker(start, value(), true));
    return;
  }

  let lastChild: Node = start,
    end = start[END_MARKER];

  if (isDOMNode(value)) {
    // This won't exist yet when hydrating so nodes will stay intact.
    if (end) removeNodesBetweenMarkers(start, end);

    // Fragment
    if (value.nodeType === 11) {
      lastChild = !hydration
        ? value.lastChild || lastChild
        : start.parentElement!.childNodes[getNodeIndex(start) + value.childElementCount];
    } else {
      lastChild = !hydration ? value : start.nextSibling!;
    }

    if (!hydration) start.after(value);
  } else if (isString(value) || isNumber(value)) {
    if (!hydration) {
      const current = start.nextSibling;
      if (current && current.nodeType === 3) {
        (current as Text).data = `${value}`;
      } else {
        lastChild = document.createTextNode(`${value}`);
        start.after(lastChild);
      }
    } else {
      lastChild = start.nextSibling!;
    }
  } else if (end) {
    removeNodesBetweenMarkers(start, end);
  }

  if (!end && observable) {
    const marker = createMarker();
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
}

export type MarkerWalker = TreeWalker;

export const createMarkerWalker = (root: Node): MarkerWalker =>
  // @ts-expect-error - filter accepts `boolean` but not typed.
  document.createTreeWalker(root, NodeFilter.SHOW_COMMENT, (node) => node.nodeValue === '$');
