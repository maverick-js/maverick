import { hydrate, render } from '../runtime/dom/render';
import { hydrateLite, renderLite } from '../runtime/dom/render-lite';
import type { ComponentConstructor } from './component';
import { createHTMLElement, type HTMLCustomElementInit } from './create-html-element';
import { adoptCSS } from './css';

export interface CustomElementRegistrar {
  (Component: ComponentConstructor): void;
}

export function registerCustomElement(Component: ComponentConstructor) {
  register(Component, {
    render,
    hydrate,
    adoptCSS,
  });
}

export function registerLiteCustomElement(Component: ComponentConstructor) {
  register(Component, {
    render: renderLite,
    hydrate: hydrateLite,
  });
}

export function registerHeadlessCustomElement(Component: ComponentConstructor) {
  register(Component);
}

function register(Component: ComponentConstructor, init?: HTMLCustomElementInit) {
  if (__SERVER__ || customElements.get(Component.el.tagName)) return;
  customElements.define(Component.el.tagName, createHTMLElement(Component, init));
}
