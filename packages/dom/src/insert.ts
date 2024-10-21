import { effect, type JSX } from '@maverick-js/core';
import {
  createComment,
  isArray,
  isDOMNode,
  isFunction,
  isNumber,
  isString,
  isUndefined,
  unwrapDeep,
} from '@maverick-js/std';

import { reconcile } from './reconcile';
import { hydration } from './render';

export function insert(parent: Node, value: JSX.Element, marker?: Node | null): void {
  if (isFunction(value)) {
    let current;
    effect(() => {
      current = insertExpression(parent, unwrapDeep(value()), marker, current, true);
    });
  } else if (hydration) {
    (marker as Comment).remove();
  } else {
    insertExpression(parent, value, marker);
  }
}

// adapted from: https://github.com/ryansolid/dom-expressions/blob/main/packages/dom-expressions/src/client.js#L447
function insertExpression(
  parent: Node,
  newValue: JSX.Element,
  marker?: Node | null,
  oldValue?: JSX.Element,
  isSignal = false,
): JSX.Element {
  if (newValue === oldValue) return oldValue;

  if (isArray(newValue)) {
    const newNodes: Node[] = [],
      currentNodes =
        hydration && marker
          ? claimArray(marker as Comment)
          : oldValue && isArray(oldValue)
            ? (oldValue as Node[])
            : [];

    if (newValue.length && resolveArray(newNodes, newValue, currentNodes, isSignal)) {
      effect(
        () => void (oldValue = insertExpression(parent, newNodes, marker, currentNodes, true)),
      );
      return () => oldValue;
    }

    if (hydration && marker) return currentNodes;

    if (newNodes.length === 0) {
      updateDOM(parent, oldValue);
    } else if (currentNodes.length) {
      reconcile(parent, currentNodes, newNodes);
    } else {
      oldValue && updateDOM(parent, oldValue, marker);
      appendArray(parent, newNodes, marker);
    }

    return newNodes;
  } else if (isString(newValue) || isNumber(newValue)) {
    if (!isUndefined(marker)) {
      if (isDOMNode(oldValue) && oldValue.nodeType === 3) {
        (oldValue as Text).data = newValue + '';
      } else if (!hydration) {
        return updateDOM(parent, oldValue, marker, document.createTextNode(newValue + ''));
      } else {
        return (marker as Comment).nextSibling!;
      }
    } else if (oldValue !== '' && isString(oldValue)) {
      return ((parent.firstChild as Text).data = newValue + '');
    } else {
      return (parent.textContent = newValue + '');
    }
  } else if (isDOMNode(newValue)) {
    if (hydration) {
      // no-op
    } else if (marker || isArray(oldValue)) {
      if (!isUndefined(marker)) {
        return updateDOM(parent, oldValue, marker, newValue);
      }

      updateDOM(parent, oldValue, null, newValue);
    } else if (!oldValue || !parent.firstChild) {
      parent.appendChild(newValue);
    } else {
      parent.replaceChild(newValue, parent.firstChild);
    }

    return newValue;
  } else {
    // no known value, this should result in cleaning up.
    return updateDOM(parent, oldValue, marker);
  }

  return oldValue;
}

function appendArray(parent: Node, nodes: Node[], marker?: Node | null) {
  if (isUndefined(marker)) {
    for (let i = 0; i < nodes.length; i++) parent.appendChild(nodes[i]);
  } else {
    for (let i = 0; i < nodes.length; i++) parent.insertBefore(nodes[i], marker);
  }
}

function resolveArray(
  currentNodes: Node[],
  newNodes: JSX.Nodes,
  oldNodes: Node[],
  computed: boolean,
): boolean {
  let value: JSX.Element,
    old,
    effect = false;

  for (let i = 0; i < newNodes.length; i++) {
    (value = newNodes[i]), (old = oldNodes[i]);
    if (isDOMNode(value)) {
      currentNodes.push(value);
    } else if (isArray(value)) {
      effect =
        resolveArray(currentNodes, value, (isArray(old) ? old : []) as Node[], computed) || effect;
    } else if (isFunction(value)) {
      if (computed) {
        value = value();
        effect =
          resolveArray(
            currentNodes,
            isArray(value) ? value : [value],
            (isArray(old) ? old : [old]) as Node[],
            true,
          ) || effect;
      } else {
        // Pushing function here is fine as it'll be unwrapped in second pass inside effect.
        currentNodes.push(value as any);
        effect = true;
      }
    } else if (value || value === 0) {
      const text = value + '';
      if (old && old.nodeType === 3 && old.data === text) {
        currentNodes.push(old);
      } else {
        currentNodes.push(document.createTextNode(text));
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
function updateDOM(parent: Node, value: JSX.Element, marker?: Node | null, replace?: Node) {
  if (isUndefined(marker)) {
    parent.textContent = '';
    return;
  }

  const location = replace || createComment('~');

  if (isArray(value) && value.length) {
    let el: Node,
      inserted = false,
      isParent = false;

    for (let i = value.length - 1; i >= 0; i--) {
      el = value[i] as Node;
      if (el !== location) {
        isParent = el.parentNode === parent;
        if (!inserted && !i)
          isParent ? parent.replaceChild(location, el) : parent.insertBefore(location, marker);
        else isParent && parent.removeChild(el);
      } else inserted = true;
    }
  } else if (isDOMNode(value)) {
    parent.replaceChild(location, value);
  } else {
    parent.insertBefore(location, marker);
  }

  return [location];
}
