import type { Writable } from 'type-fest';

import { renderToString, scoped, tick } from '../runtime';
import { parseClassAttr, parseStyleAttr } from '../runtime/ssr';
import { setAttribute, setStyle } from '../std/dom';
import { escape } from '../std/html';
import { unwrapDeep } from '../std/signal';
import { camelToKebabCase } from '../std/string';
import { isBoolean } from '../std/unit';
import { ATTACH, HOST, PROPS, RENDER, SCOPE } from './internal';
import type {
  AnyCustomElement,
  CustomElementDefinition,
  CustomElementHost,
  CustomElementInstance,
  CustomElementPropDefinitions,
  HostElement,
  InferCustomElementProps,
} from './types';

const registry = new WeakMap<CustomElementDefinition, any>();

export function createServerElement<T extends AnyCustomElement>(
  definition: CustomElementDefinition<T>,
) {
  if (registry.has(definition)) {
    return registry.get(definition) as typeof ServerCustomElement;
  }

  type Props = InferCustomElementProps<T>;

  const propDefs = (definition.props ?? {}) as CustomElementPropDefinitions<Props>;
  const reflectedProps = new Map<string, string>();

  for (const propName of Object.keys(propDefs)) {
    const def = propDefs[propName];
    if (!def.reflect || def.attribute === false) continue;
    reflectedProps.set(def.attribute ?? camelToKebabCase(propName), propName);
  }

  class ServerCustomElement implements ServerHTMLElement, HostElement {
    /** @internal */
    [HOST] = true;

    /** @internal */
    _instance: CustomElementInstance | null = null;
    /** @internal */
    _ssr?: string;
    /** @internal */
    _rendered = false;

    readonly attributes = new Attributes();
    readonly style = new Style();
    readonly classList = new ClassList();

    get instance() {
      return this._instance;
    }

    attachComponent(instance: CustomElementInstance) {
      this.setAttribute('mk-h', '');
      this.setAttribute('mk-d', '');

      if (this.hasAttribute('class')) {
        parseClassAttr(this.classList.tokens, this.getAttribute('class')!);
      }

      if (this.hasAttribute('style')) {
        parseStyleAttr(this.style.tokens, this.getAttribute('style')!);
      }

      const { $attrs, $styles } = instance.host[PROPS];
      for (const name of Object.keys($attrs!)) setAttribute(this, name, unwrapDeep($attrs![name]));
      for (const name of Object.keys($styles!)) setStyle(this, name, unwrapDeep($styles![name]));

      instance.host[PROPS].$attrs = null;
      instance.host[PROPS].$styles = null;

      (instance.host as Writable<CustomElementHost<T>>).el = this as any;
      this._instance = instance;

      for (const attachCallback of instance[ATTACH]) {
        scoped(attachCallback, instance[SCOPE]);
      }

      // prop reflection.
      for (const propName of reflectedProps.keys()) {
        const convert = propDefs[propName]!.type?.to;
        const attrName = reflectedProps.get(propName)!;
        const propValue = instance.props['$' + propName]();
        const attrValue = convert ? convert(propValue) : propValue;
        setAttribute(
          this,
          attrName,
          // @ts-expect-error
          unwrapDeep(attrValue),
        );
      }

      tick();

      const $render = instance[RENDER];
      this._rendered = !!$render;
      this._ssr = $render ? renderToString($render).code : '';

      if (this.classList.length > 0) {
        this.setAttribute('class', this.classList.toString());
      }

      if (this.style.length > 0) {
        this.setAttribute('style', this.style.toString());
      }

      instance.destroy();
    }

    render(): string {
      if (typeof this._ssr !== 'string') {
        throw Error('[maverick] called `render` before attaching component');
      }

      const innerHTML = this.renderInnerHTML();

      return this._rendered || (definition.shadowRoot && definition.css)
        ? definition.shadowRoot
          ? `<template shadowroot="${this.getShadowRootMode()}">${innerHTML}</template>`
          : `<shadow-root>${innerHTML}</shadow-root>`
        : innerHTML;
    }

    renderInnerHTML() {
      if (typeof this._ssr !== 'string') {
        throw Error('[maverick] called `renderInnerHTML` before attaching component');
      }

      const styleTag =
        definition.shadowRoot && definition.css
          ? `<style>${definition.css.map((css) => css.text).join('')}</style>`
          : '';

      return styleTag + this._ssr;
    }

    getShadowRootMode() {
      return definition.shadowRoot
        ? isBoolean(definition.shadowRoot)
          ? 'open'
          : definition.shadowRoot.mode
        : 'open';
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
  }

  registry.set(definition, ServerCustomElement);
  return ServerCustomElement;
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
