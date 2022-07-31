import { onDispose } from '@maverick-js/observables';
import type { JSX } from '../jsx';

export function isNode(node: any): node is Node {
  return node instanceof Node;
}

export function isCommentNode(node: unknown): node is Comment {
  return isNode(node) && node.nodeType === 8;
}

export function isElementNode(node: unknown): node is Element {
  return isNode(node) && node.nodeType === 1;
}

export function isFragmentNode(node: unknown): node is DocumentFragment {
  return isNode(node) && node.nodeType === 11;
}

export function insert(parent: Element, value: JSX.Element, before?: Element) {
  // if no before just append -> parent.appendChild()
  // if it has before -> parent.insertBefore(before, value)
}

export function listen<Target extends EventTarget, EventType extends string>(
  target: Target,
  type: EventType,
  handler: EventType extends keyof JSX.GlobalOnAttributes
    ? JSX.EventHandler<JSX.TargetedEvent<Target, JSX.GlobalOnAttributes[EventType]>>
    : JSX.EventHandler,
  options?: AddEventListenerOptions | boolean,
) {
  target.addEventListener(type as string, handler as JSX.EventHandler, options);
  onDispose(() => {
    target.removeEventListener(type as string, handler as JSX.EventHandler, options);
  });
}

/**
 * Sets or removes the given attribute `value`. Falsy values except `''` and `0` will remove
 * the attribute.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Glossary/Falsy}
 */
export function setAttribute(element: Element, name: string, value: unknown) {
  if (!value && value !== '' && value !== 0) {
    element.removeAttribute(name);
  } else {
    const attrValue = `${value}`;
    if (element.getAttribute(name) !== attrValue) {
      element.setAttribute(name, attrValue);
    }
  }
}

/**
 * Sets or removes the given style `value`. Falsy values except `''` and `0` will remove
 * the style.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Glossary/Falsy}
 */
export function setStyle(element: HTMLElement, property: string, value: unknown) {
  if (!value && value !== '' && value !== 0) {
    element.style.removeProperty(property);
  } else {
    element.style.setProperty(property, `${value}`);
  }
}

/**
 * Toggles the given class `name`. Falsy values will remove the class from the list.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Glossary/Falsy}
 */
export function toggleClass(element: Element, name: string, value: unknown) {
  element.classList[value ? 'add' : 'remove'](name);
}
