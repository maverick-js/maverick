import { type AnyComponent } from '../../core/component';
import { scoped } from '../../core/signals';
import { escape } from '../../std/html';
import { noop } from '../../std/unit';
import { SETUP } from '../symbols';
import { parseClassAttr, parseStyleAttr } from './server-utils';

export class MaverickServerElement<T extends AnyComponent = AnyComponent> implements ServerElement {
  keepAlive = false;

  readonly $: T;
  readonly attributes = new ServerAttributes();
  readonly style = new ServerStyle();
  readonly classList = new ServerClassList();

  get $props() {
    return this.$.$$._props;
  }

  get $state() {
    return this.$.$$._$state;
  }

  get state() {
    return this.$.state;
  }

  constructor(component: T) {
    this.$ = component;
  }

  attach() {
    const instance = this.$.$$;
    scoped(() => {
      if (this.hasAttribute('class')) {
        parseClassAttr(this.classList.tokens, this.getAttribute('class')!);
      }

      if (this.hasAttribute('style')) {
        parseStyleAttr(this.style.tokens, this.getAttribute('style')!);
      }

      instance._attach(this);

      if (this.classList.length > 0) {
        this.setAttribute('class', this.classList.toString());
      }

      if (this.style.length > 0) {
        this.setAttribute('style', this.style.toString());
      }

      if (this.keepAlive) {
        this.setAttribute('keep-alive', '');
      }
    }, instance._scope);
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

  [SETUP]() {}
  addEventListener() {}
  removeEventListener() {}

  dispatchEvent() {
    return false;
  }

  subscribe() {
    return noop;
  }

  destroy() {
    this.$.destroy();
  }
}

export class ServerAttributes {
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

export class ServerStyle {
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

export interface ServerElement
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

export class ServerClassList {
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
