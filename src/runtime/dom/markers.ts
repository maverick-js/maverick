import type { JSX } from '../jsx';
import { effect } from '@maverick-js/observables';
import { createFragment, insert, isDOMNode } from './utils';
import { isArray, isFunction, isNumber, isString } from '../../utils/unit';
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

// start markers (<!--$-->) are reserved for hydration.
export const createMarker = () => document.createComment('/$');

export function insertNodeAtMarker(start: StartMarker, value: JSX.Element, observable = false) {
  if (isFunction(value)) {
    effect(() => insertNodeAtMarker(start, value(), true));
    return;
  }

  let lastChild: Node = start,
    end = start[END_MARKER];

  if (isArray(value)) {
    // This won't exist yet when hydrating so nodes will stay intact.
    if (end) removeNodesBetweenMarkers(start, end);

    const flattened = value.flat();

    if (hydration) {
      lastChild = getLastNode(start, flattened.length);
    } else {
      const fragment = createFragment();
      for (let i = 0; i < flattened.length; i++) {
        const child = flattened[i];
        if (isFunction(child) || isArray(child)) {
          insert(fragment, child);
        } else if (child) {
          fragment.append(child as string);
        }
      }
      lastChild = fragment.lastChild || lastChild;
      start.after(fragment);
    }
  } else if (isDOMNode(value)) {
    // This won't exist yet when hydrating so nodes will stay intact.
    if (end) removeNodesBetweenMarkers(start, end);

    // Fragment
    if (value.nodeType === 11) {
      lastChild = !hydration
        ? value.lastChild || lastChild
        : getLastNode(start, value.childNodes.length);
    } else {
      lastChild = !hydration ? value : start.nextSibling!;
    }

    if (!hydration) start.after(value);
  } else if (isString(value) || isNumber(value)) {
    if (start[TEXT]) {
      start[TEXT].data = value + '';
    } else {
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

  start[TEXT] = null;
}

function getLastNode(start: StartMarker, nodesCount: number) {
  return start.parentElement!.childNodes[getNodeIndex(start) + nodesCount];
}

export type MarkerWalker = TreeWalker;

export const createMarkerWalker = (root: Node): MarkerWalker =>
  // @ts-expect-error - filter accepts `boolean` but not typed.
  document.createTreeWalker(root, NodeFilter.SHOW_COMMENT, (node) => node.nodeValue === '$');
