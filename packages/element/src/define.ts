import type { CustomElementConstructor } from 'maverick.js';

export function defineCustomElement(tagName: string, element: CustomElementConstructor) {
  if (__SERVER__) return;
  window.customElements.define(tagName, element);
}
