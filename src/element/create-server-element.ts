import {
  type ContextMap,
  type JSX,
  renderToString,
  root,
  setAttribute,
  setStyle,
  type SubjectRecord,
} from '../runtime';
import { parseClassAttr, parseStyleAttr } from '../runtime/ssr';
import { escape } from '../utils/html';
import { camelToKebabCase } from '../utils/str';
import { isBoolean, isFunction, noop } from '../utils/unit';
import { setupElementProps } from './define-element';
import type {
  AnyElementDefinition,
  ElementCSSVarRecord,
  ElementDefinition,
  ElementEventRecord,
  ElementMembers,
  ElementPropDefinitions,
  ElementPropRecord,
  ElementSetupContext,
  MaverickHost,
} from './types';

const registry = new WeakMap<AnyElementDefinition, any>();

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

  class MaverickServerElement implements MaverickHost<Props> {
    /** @internal */
    _children = false;
    /** @internal */
    _props: SubjectRecord = {};
    /** @internal */
    _ssr?: string;

    $keepAlive = false;

    readonly $tagName = definition.tagName;
    readonly $el = null;
    readonly $connected = false;
    readonly $mounted = false;

    readonly attributes = new Attributes();
    readonly style = new Style();
    readonly classList = new ClassList();

    get $$props() {
      return this._props as any;
    }

    get $children() {
      return this._children;
    }

    $setup(ctx: ElementSetupContext<Props> = {}) {
      root((dispose) => {
        const { $$props, $$setupProps } = setupElementProps(definition.props);

        this._props = $$props;
        this._children = ctx.children?.() ?? false;

        this.setAttribute('mk-hydrate', '');
        this.setAttribute('mk-delegate', '');

        if (this.hasAttribute('class')) {
          parseClassAttr(this.classList.tokens, this.getAttribute('class')!);
        }

        if (this.hasAttribute('style')) {
          parseStyleAttr(this.style.tokens, this.getAttribute('style')!);
        }

        for (const propName of Object.keys(propDefs)) {
          const def = propDefs[propName];
          if (def.attribute !== false) {
            const attrName = def.attribute ?? camelToKebabCase(propName);
            const fromAttr = propDefs[propName].converter?.from;
            if (this.hasAttribute(attrName) && fromAttr) {
              const attrValue = this.getAttribute(attrName);
              this._props[propName]?.set(fromAttr(attrValue));
            }
          }
        }

        if (ctx.props) {
          for (const prop of Object.keys(ctx.props)) {
            $$props[prop]?.set(ctx.props[prop]);
          }
        }

        if (definition.cssvars) {
          const vars = isFunction(definition.cssvars)
            ? definition.cssvars($$setupProps)
            : definition.cssvars;
          for (const name of Object.keys(vars)) setStyle(this, `--${name}`, vars[name]);
        }

        const members = definition.setup({
          host: this,
          props: $$setupProps,
          context: ctx.context,
          dispatch: () => false,
        });

        // prop reflection.
        for (const propName of Object.keys(propDefs)) {
          const def = propDefs[propName];
          if (!def.reflect || def.attribute === false) continue;
          const convert = propDefs[propName]!.converter?.to;
          const attrName = def.attribute ?? camelToKebabCase(propName);
          const propValue = $$setupProps[propName];
          setAttribute(this as any, attrName, convert ? convert(propValue) : propValue + '');
        }

        this._ssr = renderToString(() => members.$render).code;
        dispose();
      });

      return noop;
    }

    $render(): string {
      if (typeof this._ssr !== 'string') {
        throw Error('[maverick] called `$render` before calling `$setup`');
      }

      const innerHTML = this.$renderInnerHTML();

      return definition.shadowRoot
        ? `<template shadowroot="${this.getShadowRootMode()}">${innerHTML}</template>`
        : `<shadow-root>${innerHTML}</shadow-root>`;
    }

    $renderInnerHTML() {
      if (typeof this._ssr !== 'string') {
        throw Error('[maverick] called `$renderInnerHTML` before calling `$setup`');
      }

      if (this.classList.length > 0) {
        this.setAttribute('class', this.classList.toString());
      }

      if (this.style.length > 0) {
        this.setAttribute('style', this.style.toString());
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

    addEventListener() {}
    removeEventListener() {}

    $destroy() {}
    $onMount() {}
    $onDestroy() {}
  }

  registry.set(definition, MaverickServerElement);
  return MaverickServerElement;
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
