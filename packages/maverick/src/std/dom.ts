import type { ServerHTMLElement } from '../element/create-server-element';

export function isDOMNode(node: any): node is Node {
  return node instanceof Node;
}

export function isDOMElement(node: any): node is Element {
  return isDOMNode(node) && node.nodeType === 1;
}

export function isDOMFragment(node: any): node is DocumentFragment {
  return isDOMNode(node) && node.nodeType === 11;
}

export function createFragment(): DocumentFragment {
  return document.createDocumentFragment();
}

export function createComment(data: string): Comment {
  if (__SERVER__) return data as unknown as Comment;
  return document.createComment(data);
}

/**
 * Sets or removes the given attribute `value`. Falsy values except `''` and `0` will remove
 * the attribute. If the given `value` is a function/signal, the attribute will be updated as
 * the value updates.
 *
 * This function is safe to use on the server.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Glossary/Falsy}
 */
export function setAttribute(host: Element | ServerHTMLElement, name: string, value: unknown) {
  if (!value && value !== '' && value !== 0) {
    host.removeAttribute(name);
  } else {
    const attrValue = value + '';
    if (host.getAttribute(name) !== attrValue) {
      host.setAttribute(name, attrValue);
    }
  }
}

/**
 * Sets or removes the given style `value`. Falsy values will remove the style. If the
 * given `value` is a function/signal, the style will be updated as the value updates.
 *
 * This function is safe to use on the server.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Glossary/Falsy}
 */
export function setStyle(host: HTMLElement | ServerHTMLElement, property: string, value: unknown) {
  if (!value && value !== 0) {
    host.style.removeProperty(property);
  } else {
    host.style.setProperty(property, value + '');
  }
}

/**
 * Toggles the given class `name`. Falsy values will remove the class from the list. If the
 * given `value` is a function/signal, the class will be toggled as the value updates.
 *
 * This function is safe to use on the server.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Glossary/Falsy}
 */
export function toggleClass(host: Element | ServerHTMLElement, name: string, value: unknown) {
  host.classList[value ? 'add' : 'remove'](name);
}

/**
 * Returns elements assigned to the given slot in the shadow root. Filters out all nodes
 * which are not an element.
 *
 * @param el - The element containing the slot.
 * @param name - The name of the slot (optional).
 */
export function getSlottedChildren(el: HTMLElement, name?: string): Element[] {
  const selector = name ? `slot[name="${name}"]` : 'slot:not([name])';
  const slot = el.shadowRoot?.querySelector(selector) as HTMLSlotElement | null;
  const childNodes = slot?.assignedNodes({ flatten: true }) ?? [];
  return Array.prototype.filter.call(childNodes, (node) => node.nodeType == 1);
}

export function attachDeclarativeShadowDOM(element: HTMLElement) {
  const template = element.firstChild as HTMLTemplateElement;
  const mode = template.getAttribute('shadowroot')! as 'open' | 'closed';
  const shadowRoot = (template.parentNode as HTMLElement).attachShadow({ mode });
  shadowRoot.appendChild(template.content);
  template.remove();
}
