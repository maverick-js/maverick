import { getScheduler, renderToString, setAttribute, setStyle } from '../runtime';
import { parseClassAttr, parseStyleAttr } from '../runtime/ssr';
import { runAll } from '../utils/fn';
import { escape } from '../utils/html';
import { camelToKebabCase } from '../utils/str';
import { isBoolean, isFunction } from '../utils/unit';
import { ATTACH, HOST, PROPS, RENDER } from './internal';
import type {
  AnyElementDefinition,
  ElementCSSVarRecord,
  ElementDefinition,
  ElementEventRecord,
  ElementInstance,
  ElementMembers,
  ElementPropDefinitions,
  ElementPropRecord,
  HostElement,
} from './types';

const scheduler = getScheduler(),
  registry = new WeakMap<AnyElementDefinition, any>();

export function createServerElement<
  Props extends ElementPropRecord,
  Events extends ElementEventRecord,
  CSSVars extends ElementCSSVarRecord,
  Members extends ElementMembers,
>(definition: ElementDefinition<Props, Events, CSSVars, Members>) {
  if (registry.has(definition)) {
    return registry.get(definition) as typeof MaverickServerElement;
  }

  const propDefs = (definition.props ?? {}) as ElementPropDefinitions<Props>;
  const propToAttr = new Map<string, string>();
  const reflectedProps = new Map<string, string>();

  for (const propName of Object.keys(propDefs)) {
    const def = propDefs[propName];
    const converter = propDefs[propName].converter?.from;
    if (def.attribute !== false && converter) {
      const attrName = def.attribute ?? camelToKebabCase(propName);
      propToAttr.set(propName, attrName);
    }
  }

  for (const propName of Object.keys(propDefs)) {
    const def = propDefs[propName];
    if (!def.reflect || def.attribute === false) continue;
    reflectedProps.set(def.attribute ?? camelToKebabCase(propName), propName);
  }

  class MaverickServerElement implements ServerHTMLElement, HostElement<Props, Events> {
    /** @internal */
    [HOST] = true;

    /** @internal */
    _instance: ElementInstance<Props, Events> | null = null;
    /** @internal */
    _ssr?: string;

    readonly attributes = new Attributes();
    readonly style = new Style();
    readonly classList = new ClassList();

    get instance() {
      return this._instance;
    }

    attachComponent(instance: ElementInstance<Props, Events>) {
      this.setAttribute('mk-h', '');
      this.setAttribute('mk-d', '');

      if (this.hasAttribute('class')) {
        parseClassAttr(this.classList.tokens, this.getAttribute('class')!);
      }

      if (this.hasAttribute('style')) {
        parseStyleAttr(this.style.tokens, this.getAttribute('style')!);
      }

      for (const propName of propToAttr.keys()) {
        const attrName = propToAttr.get(propName)!;
        if (this.hasAttribute(attrName)) {
          const convert = propDefs[propName].converter!.from! as (value: string | null) => any;
          const attrValue = this.getAttribute(attrName);
          instance[PROPS][propName]!.set(convert(attrValue));
        }
      }

      if (definition.cssvars) {
        const vars = isFunction(definition.cssvars)
          ? definition.cssvars(instance.props)
          : definition.cssvars;
        for (const name of Object.keys(vars)) {
          if (isFunction(vars[name]) || !this.style.tokens.has(name)) {
            setStyle(this, `--${name}`, vars[name]);
          }
        }
      }

      instance.host.el = this as any;
      this._instance = instance;
      runAll(instance[ATTACH]);

      // prop reflection.
      for (const propName of reflectedProps.keys()) {
        const convert = propDefs[propName]!.converter?.to;
        const attrName = reflectedProps.get(propName)!;
        const propValue = instance.props[propName];
        setAttribute(this as any, attrName, convert ? convert(propValue) : propValue + '');
      }

      scheduler.flushSync();
      this._ssr = renderToString(instance[RENDER]!).code;

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

      return definition.shadowRoot
        ? `<template shadowroot="${this.getShadowRootMode()}">${innerHTML}</template>`
        : `<shadow-root>${innerHTML}</shadow-root>`;
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

  registry.set(definition, MaverickServerElement);
  return MaverickServerElement;
}

export type ServerHTMLElement = Pick<
  HTMLElement,
  | 'getAttribute'
  | 'setAttribute'
  | 'hasAttribute'
  | 'removeAttribute'
  | 'dispatchEvent'
  | 'addEventListener'
  | 'removeEventListener'
> & {
  readonly classList: Pick<
    HTMLElement['classList'],
    'length' | 'add' | 'contains' | 'remove' | 'replace' | 'toggle' | 'toString'
  >;
  readonly style: Pick<
    HTMLElement['style'],
    'length' | 'getPropertyValue' | 'removeProperty' | 'setProperty'
  > & { toString(): string };
};

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
