import { scoped } from '../runtime';
import { parseClassAttr, parseStyleAttr, renderToString } from '../runtime/ssr';
import { setAttribute, setStyle } from '../std/dom';
import { escape } from '../std/html';
import { unwrapDeep } from '../std/signal';
import { isBoolean, noop } from '../std/unit';
import type { AnyComponent, ComponentConstructor } from './component';
import type { HostElement } from './host';
import type { ComponentLifecycleCallback } from './instance';

const registry = new WeakMap<ComponentConstructor, typeof ServerCustomElement>();

export function createServerElement<Component extends AnyComponent>(
  Component: ComponentConstructor<Component>,
): typeof ServerCustomElement<Component> {
  if (registry.has(Component)) return registry.get(Component)!;

  class MaverickElement extends ServerCustomElement<Component> {
    static override get _component() {
      return Component;
    }
  }

  registry.set(Component, MaverickElement as any);
  return MaverickElement;
}

export interface ServerHTMLElement
  extends Pick<
    HTMLElement,
    | 'getAttribute'
    | 'setAttribute'
    | 'hasAttribute'
    | 'removeAttribute'
    | 'dispatchEvent'
    | 'addEventListener'
    | 'removeEventListener'
  > {
  readonly classList: Pick<
    HTMLElement['classList'],
    'length' | 'add' | 'contains' | 'remove' | 'replace' | 'toggle' | 'toString'
  >;
  readonly style: Pick<
    HTMLElement['style'],
    'length' | 'getPropertyValue' | 'removeProperty' | 'setProperty'
  > & { toString(): string };
}

class ServerCustomElement<Component extends AnyComponent = AnyComponent>
  implements ServerHTMLElement, HostElement<Component>
{
  keepAlive = false;

  static _component: ComponentConstructor;

  private _component: Component | null = null;
  private _ssr?: string;
  private _rendered = false;
  private _attachCallbacks: Set<ComponentLifecycleCallback> | null = new Set();

  readonly attributes = new Attributes();
  readonly style = new Style();
  readonly classList = new ClassList();

  get component() {
    return this._component;
  }

  get state() {
    return {};
  }

  attachComponent(component: Component) {
    this.setAttribute('mk-h', '');
    this.setAttribute('mk-d', '');

    if (this.hasAttribute('class')) {
      parseClassAttr(this.classList.tokens, this.getAttribute('class')!);
    }

    if (this.hasAttribute('style')) {
      parseStyleAttr(this.style.tokens, this.getAttribute('style')!);
    }

    const instance = component.instance;

    instance._el = this as any;
    this._component = component;

    for (const callback of [...instance._attachCallbacks, ...this._attachCallbacks!]) {
      scoped(() => callback(this as any), instance._scope);
    }

    this._attachCallbacks = null;

    const $attrs = instance._attrs,
      $styles = instance._styles;

    if ($attrs) {
      for (const name of Object.keys($attrs)) setAttribute(this, name, unwrapDeep($attrs[name]));
    }

    if ($styles) {
      for (const name of Object.keys($styles)) setStyle(this, name, unwrapDeep($styles[name]));
    }

    this._rendered = !!instance._renderer;
    this._ssr = instance._renderer ? renderToString(() => instance._render()).code : '';

    if (this.classList.length > 0) {
      this.setAttribute('class', this.classList.toString());
    }

    if (this.style.length > 0) {
      this.setAttribute('style', this.style.toString());
    }
  }

  render(): string {
    if (typeof this._ssr !== 'string') {
      throw Error('[maverick] called `render` before attaching component');
    }

    const innerHTML = this.renderInnerHTML(),
      def = (this.constructor as typeof ServerCustomElement)._component.el;

    return this._rendered || (def.shadowRoot && def.css)
      ? def.shadowRoot
        ? `<template shadowroot="${this.getShadowRootMode()}">${innerHTML}</template>`
        : `<shadow-root>${innerHTML}</shadow-root>`
      : innerHTML;
  }

  renderInnerHTML() {
    if (typeof this._ssr !== 'string') {
      throw Error('[maverick] called `renderInnerHTML` before attaching component');
    }

    const def = (this.constructor as typeof ServerCustomElement)._component.el,
      styleTag =
        def.shadowRoot && def.css
          ? `<style>${def.css.map((css) => css.text).join('')}</style>`
          : '';

    return styleTag + this._ssr;
  }

  getShadowRootMode() {
    const def = (this.constructor as typeof ServerCustomElement)._component.el;
    return def.shadowRoot ? (isBoolean(def.shadowRoot) ? 'open' : def.shadowRoot.mode) : 'open';
  }

  getAttribute(name: string): string | null {
    return this.attributes.getAttribute(name);
  }

  setAttribute(name: string, value: string): void {
    this.attributes.setAttribute(name, value);
  }

  hasAttribute(name: string): boolean {
    return this.attributes.hasAttribute(name);
  }

  removeAttribute(name: string): void {
    return this.attributes.removeAttribute(name);
  }

  dispatchEvent() {
    return false;
  }

  onEventDispatch() {}
  addEventListener() {}
  removeEventListener() {}

  subscribe() {
    return noop;
  }

  onAttach(callback: ComponentLifecycleCallback) {
    if (this._component) {
      callback(this as any);
      return noop;
    } else {
      this._attachCallbacks!.add(callback);
      return () => this._attachCallbacks?.delete(callback);
    }
  }

  destroy() {
    this._component?.destroy();
  }
}

class Attributes {
  protected _tokens = new Map<string, string>();
  get length() {
    return this._tokens.size;
  }
  get tokens() {
    return this._tokens;
  }
  getAttribute(name: string): string | null {
    return this._tokens.get(name) ?? null;
  }
  hasAttribute(name: string) {
    return this._tokens.has(name);
  }
  setAttribute(name: string, value: string) {
    this._tokens.set(name, value + '');
  }
  removeAttribute(name: string) {
    this._tokens.delete(name);
  }
  toString() {
    if (this._tokens.size === 0) return '';
    let result = '';
    for (const [name, value] of this._tokens) {
      result += ` ${name}="${escape(value, true)}"`;
    }
    return result;
  }
}

class Style {
  protected _tokens = new Map<string, string>();
  get length() {
    return this._tokens.size;
  }
  get tokens() {
    return this._tokens;
  }
  getPropertyValue(prop: string): string {
    return this._tokens.get(prop) ?? '';
  }
  setProperty(prop: string, value: string | null) {
    this._tokens.set(prop, value ?? '');
  }
  removeProperty(prop: string): string {
    const value = this._tokens.get(prop);
    this._tokens.delete(prop);
    return value ?? '';
  }
  toString() {
    if (this._tokens.size === 0) return '';
    let result = '';
    for (const [name, value] of this._tokens) {
      result += `${name}: ${value};`;
    }
    return result;
  }
}

class ClassList {
  protected _tokens = new Set<string>();
  get length() {
    return this._tokens.size;
  }
  get tokens() {
    return this._tokens;
  }
  add(...tokens: string[]): void {
    for (const token of tokens) {
      this._tokens.add(token);
    }
  }
  contains(token: string): boolean {
    return this._tokens.has(token);
  }
  remove(token: string) {
    this._tokens.delete(token);
  }
  replace(token: string, newToken: string): boolean {
    if (!this._tokens.has(token)) return false;
    this._tokens.delete(token);
    this._tokens.add(newToken);
    return true;
  }
  toggle(token: string, force?: boolean): boolean {
    if (force !== true && (this._tokens.has(token) || force === false)) {
      this._tokens.delete(token);
      return false;
    } else {
      this._tokens.add(token);
      return true;
    }
  }
  toString() {
    return Array.from(this._tokens).join(' ');
  }
}
