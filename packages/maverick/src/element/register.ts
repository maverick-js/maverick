import { hydrate, render } from '../runtime/dom/render';
import { hydrateLite, renderLite } from '../runtime/dom/render-lite';
import { createHTMLElement, type CustomHTMLElementInit } from './create-html-element';
import { adoptCSS } from './css';
import type { CustomElementDefinition } from './types';

export interface CustomElementRegistrar {
  (definition: CustomElementDefinition): void;
}

export function registerCustomElement(definition: CustomElementDefinition) {
  $registerCustomElement(definition, {
    render,
    hydrate,
    adoptCSS,
  });
}

export function registerLiteCustomElement(definition: CustomElementDefinition) {
  $registerCustomElement(definition, {
    render: renderLite,
    hydrate: hydrateLite,
  });
}

export function registerHeadlessCustomElement(definition: CustomElementDefinition) {
  $registerCustomElement(definition);
}

function $registerCustomElement(definition: CustomElementDefinition, init?: CustomHTMLElementInit) {
  if (__SERVER__ || customElements.get(definition.tagName)) return;
  customElements.define(definition.tagName, createHTMLElement(definition, init));
}
