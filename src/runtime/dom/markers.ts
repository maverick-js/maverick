import type { JSX } from '../jsx';
import { $effect } from '@maverick-js/observables';
import { isNode } from './utils';
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

export const createEndMarker = () => document.createComment('/$');

export function insertNodeAtMarker(start: StartMarker, value: JSX.Element) {
  if (isFunction(value)) {
    $effect(() => insertNodeAtMarker(start, value()));
    return;
  }

  let lastChild: Node = start,
    end = start[END_MARKER];

  if (isNode(value)) {
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

  if (!end) {
    const marker = createEndMarker();
    start[END_MARKER] = marker;
    (lastChild as Element).after(marker);
  }
}

function getNodeIndex(node: Node) {
  // @ts-expect-error
  return [].indexOf.call(node.parentNode!.childNodes, node);
}

function removeNodesBetweenMarkers(start: StartMarker, end: EndMarker) {
  let next = start.nextSibling;
  while (next && next !== end) {
    next.remove();
    next = next.nextSibling;
  }
}

export type MarkerWalker = TreeWalker;

export const createMarkerWalker = (root: Node): MarkerWalker =>
  // @ts-expect-error - filter accepts `boolean` but not typed.
  document.createTreeWalker(root, NodeFilter.SHOW_COMMENT, (node) => node.nodeValue === '$');
