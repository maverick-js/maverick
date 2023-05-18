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

export const customElementRegistrations = new Map<string, ComponentConstructor>();

export function register(Component: ComponentConstructor, init?: HTMLCustomElementInit) {
  const tagName = Component.el.tagName;

  if (customElementRegistrations.has(tagName)) return;

  customElementRegistrations.set(tagName, Component);

  if (!__SERVER__ && !window.customElements.get(tagName)) {
    window.customElements.define(tagName, createHTMLElement(Component, init));
  }
}
