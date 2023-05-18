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

export const DOM_ELEMENT_REGISTRY = Symbol(__DEV__ ? 'MAVERICK_REGISTRY' : 0);

export const serverElementRegistry = __SERVER__
  ? new Map<string, ComponentConstructor>()
  : undefined;

export function register(Component: ComponentConstructor, init?: HTMLCustomElementInit) {
  const tagName = Component.el.tagName;

  if (__SERVER__) {
    serverElementRegistry!.set(tagName, Component);
    return;
  }

  if (!window.customElements.get(tagName)) {
    if (!window[DOM_ELEMENT_REGISTRY]) window[DOM_ELEMENT_REGISTRY] = new Map();
    window[DOM_ELEMENT_REGISTRY].set(tagName, Component);
    window.customElements.define(tagName, createHTMLElement(Component, init));
  }
}
