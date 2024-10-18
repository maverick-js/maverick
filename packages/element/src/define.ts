import type { MaverickCustomElementConstructor } from 'maverick.js';

export function defineCustomElement(tagName: string, element: MaverickCustomElementConstructor) {
  if (__SERVER__) return;
  window.customElements.define(tagName, element);
}
