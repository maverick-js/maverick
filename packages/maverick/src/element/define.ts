export function defineCustomElement(element: CustomElementConstructor, throws = false) {
  if (__SERVER__) return;

  if (throws || !window.customElements.get(element.tagName)) {
    window.customElements.define(element.tagName, element);
  }
}

export interface CustomElementConstructor {
  readonly tagName: string;
  new (): HTMLElement;
}
