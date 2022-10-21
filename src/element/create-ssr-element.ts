import { escape } from '../utils/html';
import { parseClassAttr, parseStyleAttr, renderToString } from '../runtime/ssr';
import { noop } from '../utils/unit';
import { createSetupProps } from './define-element';
import type { ElementDefinition, ElementSetupContext, MaverickSSRHost } from './types';
import { camelToKebabCase } from '../utils/str';
import { setAttribute } from '../runtime/dom';

type SSR = (context: ElementSetupContext) => {
  attributes: string;
  innerHTML: string;
  code: string;
};

const cache = new WeakMap<ElementDefinition, SSR>();

export function createSSRElement(definition: ElementDefinition): SSR {
  if (definition.shadow) {
    throw Error('[maverick] shadow DOM SSR is not supported yet');
  }

  if (cache.has(definition)) {
    return cache.get(definition)!;
  }

  const tagName = definition.tagName;
  const propDefs = definition.props ?? {};

  const renderer: SSR = (context) => {
    const host = new SSRHost({
      tagName,
      children: !!context.children?.(),
    });

    if (context.class) {
      host.classList.add(...parseClassAttr(context.class));
    }

    if (context.style) {
      parseStyleAttr(host.style.tokens, context.style);
    }

    const ssr = renderToString(() => {
      const { $setupProps } = createSetupProps(propDefs, context.props);

      // prop reflection.
      for (const propName of Object.keys(propDefs)) {
        const def = propDefs[propName];
        if (!def.reflect || def.attribute === false) continue;
        const transform = propDefs[propName]!.transform?.to;
        if (transform) {
          const attrName = def.attribute ?? camelToKebabCase(propName);
          setAttribute(host as any, attrName, transform($setupProps[propName]()));
        }
      }

      const members = definition.setup({
        host: host as any,
        props: $setupProps,
        context: context.context,
        dispatch: () => false,
        ssr: true,
      });

      host.setAttribute('data-hydrate', '');
      host.setAttribute('data-delegate', '');

      return members.$render();
    }).code;

    const classes = host.classList.toString();
    if (classes.length > 0) host.setAttribute('class', classes);

    const styles = host.style.toString();
    if (styles.length > 0) host.setAttribute('style', styles);

    const attributes = host.attributes.toString();
    const innerHTML = `<!--#internal-->${ssr}<!--/#internal-->`;

    return {
      attributes,
      innerHTML,
      code: `<${tagName}${attributes}>${innerHTML}</${tagName}>`,
    };
  };

  cache.set(definition, renderer);
  return renderer;
}

class SSRHost implements MaverickSSRHost {
  $keepAlive = false;

  readonly $tagName: string;
  readonly $children: boolean;
  readonly $connected = false;
  readonly $mounted = false;

  readonly attributes: Attributes;
  readonly style: Style;
  readonly classList: ClassList;

  constructor(init: { tagName: string; children: boolean }) {
    this.$tagName = init.tagName;
    this.$children = init.children;
    this.attributes = new Attributes();
    this.style = new Style();
    this.classList = new ClassList();
  }

  $setup() {
    return noop;
  }
  $destroy() {
    // no-op
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
  addEventListener() {
    // no-op
  }
  removeEventListener() {
    // no-op
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
  getAttribute(name) {
    return this._tokens.get(name) ?? null;
  }
  hasAttribute(name) {
    return this._tokens.has(name);
  }
  setAttribute(name, value) {
    this._tokens.set(name, value + '');
  }
  removeAttribute(name) {
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
  getPropertyValue(prop) {
    return this._tokens.get(prop) ?? '';
  }
  setProperty(prop, value) {
    this._tokens.set(prop, value ?? '');
  }
  removeProperty(prop) {
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
  add(...tokens) {
    for (const token of tokens) {
      this._tokens.add(token);
    }
  }
  contains(token) {
    return this._tokens.has(token);
  }
  remove(token) {
    this._tokens.delete(token);
  }
  replace(token, newToken) {
    if (!this._tokens.has(token)) return false;
    this._tokens.delete(token);
    this._tokens.add(newToken);
    return true;
  }
  toggle(token, force) {
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
