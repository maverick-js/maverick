export function isDOMNode(node: any): node is Node {
  return node instanceof Node;
}

export function isDOMElement(node: any): node is Element {
  return isDOMNode(node) && node.nodeType === 1;
}

export function isDOMFragment(node: any): node is DocumentFragment {
  return isDOMNode(node) && node.nodeType === 11;
}

export function isHTMLElement(node: any): node is HTMLElement {
  return node && node instanceof HTMLElement;
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
 * the attribute.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Glossary/Falsy}
 */
export function setAttribute(host: Element | undefined, name: string, value: unknown) {
  if (!host) {
    // no-op
  } else if (!value && value !== '' && value !== 0) {
    host.removeAttribute(name);
  } else {
    const attrValue = value === true ? '' : value + '';
    if (host.getAttribute(name) !== attrValue) {
      host.setAttribute(name, attrValue);
    }
  }
}

export type CSSStyleProperty =
  | Exclude<
      keyof CSSStyleDeclaration,
      | 'item'
      | 'setProperty'
      | 'removeProperty'
      | 'getPropertyValue'
      | 'getPropertyPriority'
      | 'length'
      | 'parentRule'
    >
  | `--${string}`
  | (string & {});

/**
 * Sets or removes the given style with the given `value`. Falsy values will remove it.
 *
 * This function supports CSS variables as props and appropriately updates them using
 * `style.setProperty` and `style.removeProperty`.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Glossary/Falsy}
 */
export function setStyle(host: HTMLElement | undefined, prop: CSSStyleProperty, value: unknown) {
  if (!host) {
    return;
  } else if (!value && value !== 0) {
    if (prop[0] === '-') {
      host.style.removeProperty(prop as string);
    } else {
      host.style[prop] = '';
    }
  } else if (prop[0] === '-') {
    host.style.setProperty(prop as string, value + '');
  } else {
    host.style[prop] = value + '';
  }
}

/**
 * Toggles the given class `name`. Falsy values will remove the class from the list.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Glossary/Falsy}
 */
export function toggleClass(host: Element, name: string, value: unknown) {
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
