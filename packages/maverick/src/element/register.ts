import { hydrate, render } from '../runtime/dom/render';
import { hydrateLite, renderLite } from '../runtime/dom/render-lite';
import { createHTMLElement } from './create-html-element';
import { adoptCSS } from './css';
import type { CustomElementDefinition } from './types';

export function registerCustomElement(definition: CustomElementDefinition) {
  if (__SERVER__) return;
  if (!window.customElements.get(definition.tagName)) {
    window.customElements.define(
      definition.tagName,
      createHTMLElement(definition, {
        render,
        hydrate,
        adoptCSS,
      }),
    );
  }
}

export function registerLiteCustomElement(definition: CustomElementDefinition) {
  if (__SERVER__) return;
  if (!window.customElements.get(definition.tagName)) {
    window.customElements.define(
      definition.tagName,
      createHTMLElement(definition, {
        render: renderLite,
        hydrate: hydrateLite,
      }),
    );
  }
}

export function registerHeadlessCustomElement(definition: CustomElementDefinition) {
  if (__SERVER__) return;
  if (!window.customElements.get(definition.tagName)) {
    window.customElements.define(definition.tagName, createHTMLElement(definition));
  }
}
