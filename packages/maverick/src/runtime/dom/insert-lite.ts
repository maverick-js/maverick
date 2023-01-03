import { flattenArray } from '../../std/array';
import { createComment, createFragment, isDOMNode } from '../../std/dom';
import { unwrapDeep } from '../../std/signal';
import { isArray, isNumber, isString } from '../../std/unit';
import type { JSX } from '../jsx';
import { effect, isFunction } from '../reactivity';
import { $$CHILDREN } from './internal';
import { hydration } from './render';

const CONNECTED = /* #__PURE__ */ Symbol(__DEV__ ? 'CONNECTED' : 0),
  INSERT_MARKER_NODE = createComment('$$'),
  END_MARKER = /* #__PURE__ */ Symbol(__DEV__ ? 'END_MARKER' : 0),
  END_MARKER_NODE = /* #__PURE__ */ createComment('/$'),
  ARRAY_END_MARKER_VALUE = /* #__PURE__ */ '/[]';

export function insertLite(
  parent: Node | DocumentFragment,
  value: JSX.Element,
  before?: Node | null,
) {
  let isSignal = isFunction(value);

  if (isSignal && (value as Function)[$$CHILDREN]) {
    value = (value as () => JSX.Element)();
    isSignal = isFunction(value);
  }

  if (isSignal) {
    insertEffect(parent, value, before);
  } else if (!hydration && (value || value === 0)) {
    addChild(
      parent,
      isArray(value)
        ? resolveArray(value)
        : isDOMNode(value)
        ? value
        : document.createTextNode(value + ''),
      before,
    );
  }
}

function addChild(parent: Node, node: Node | DocumentFragment | null, before?: Node | null) {
  if (!node) return;
  if (before) parent.insertBefore(node, before);
  else parent.appendChild(node);
}

function insertEffect(parent: Node, value: JSX.Element, before?: Node | null) {
  const marker = INSERT_MARKER_NODE.cloneNode() as Comment;
  addChild(parent, marker, before);
  effect(() => void insertExpression(marker, unwrapDeep(value)));
}

function insertExpression(start: Comment, value: JSX.Element) {
  const end = start[END_MARKER];

  if (isArray(value)) {
    if (hydration) {
      start[END_MARKER] = findArrayEndMarker(start);
    } else {
      // This won't exist yet when hydrating so nodes will stay intact.
      if (end) removeOldNodes(start, end);
      const fragment = resolveArray(value);
      if (!fragment) return;
      if (!end) fragment.appendChild(createEndMarker(start));
      start.after(fragment);
    }
  } else if (isDOMNode(value)) {
    if (end) removeOldNodes(start, end);
    if (!hydration) start.after(value);
    if (!end) (value as ChildNode).after(createEndMarker(start));
  } else if (isString(value) || isNumber(value)) {
    if (start[CONNECTED]) {
      (start.nextSibling! as Text).data = value + '';
      return;
    }

    if (end) removeOldNodes(start, end);

    let text: ChildNode;

    if (!hydration) {
      text = document.createTextNode(value + '');
      start.after(text);
    } else {
      text = start.nextSibling!;
    }

    start[CONNECTED] = true;
    if (!end) text.after(createEndMarker(start));
  } else if (end) {
    removeOldNodes(start, end);
  }
}

function createEndMarker(start: Comment) {
  return (start[END_MARKER] = END_MARKER_NODE.cloneNode());
}

function findArrayEndMarker(node: Node | null): Node | undefined {
  while (node) {
    if (node.nodeType === 8 && node.nodeValue === ARRAY_END_MARKER_VALUE) return node;
    node = node.nextSibling;
  }
}

function removeOldNodes(start: Node, end: Node) {
  while (start.nextSibling !== end) start.nextSibling!.remove();
  start[CONNECTED] = false;
}

function resolveArray(value: JSX.Node[]): DocumentFragment | null {
  const flattened = flattenArray(value);
  if (!flattened.length) return null;

  const fragment = createFragment();

  for (let i = 0; i < flattened.length; i++) {
    const child = flattened[i];
    if (isFunction(child)) {
      insertEffect(fragment, child);
    } else {
      fragment.append(child as Node | string);
    }
  }

  return fragment;
}
