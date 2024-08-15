import { escape } from '../../../../std/src/html';
import { noop } from '../../../../std/src/unit';
import { type AnyComponent } from '../../core/component';
import { scoped } from '../../core/signals';
import { SETUP } from '../symbols';
import { parseClassAttr, parseStyleAttr } from './server-utils';

export class MaverickServerElement<T extends AnyComponent = AnyComponent> implements ServerElement {
  keepAlive = false;
  forwardKeepAlive = true;

  readonly $: T;
  readonly attributes = new ServerAttributes();
  readonly style = new ServerStyle();
  readonly classList = new ServerClassList();

  get $props() {
    return this.$.$$.props;
  }

  get $state() {
    return this.$.$$.$state;
  }

  get state() {
    return this.$.state;
  }

  constructor(component: T) {
    this.$ = component;
  }

  setup() {
    const instance = this.$.$$;
    scoped(() => {
      if (this.hasAttribute('class')) {
        parseClassAttr(this.classList.tokens, this.getAttribute('class')!);
      }

      if (this.hasAttribute('style')) {
        parseStyleAttr(this.style.tokens, this.getAttribute('style')!);
      }

      instance.setup();
      instance.attach(this);

      if (this.classList.length > 0) {
        this.setAttribute('class', this.classList.toString());
      }

      if (this.style.length > 0) {
        this.setAttribute('style', this.style.toString());
      }

      if (this.keepAlive) {
        this.setAttribute('keep-alive', '');
      }
    }, instance.scope);
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
  #tokens = new Map<string, string>();
  get length() {
    return this.#tokens.size;
  }
  get tokens() {
    return this.#tokens;
  }
  getAttribute(name: string): string | null {
    return this.#tokens.get(name) ?? null;
  }
  hasAttribute(name: string) {
    return this.#tokens.has(name);
  }
  setAttribute(name: string, value: string) {
    this.#tokens.set(name, value + '');
  }
  removeAttribute(name: string) {
    this.#tokens.delete(name);
  }
  toString() {
    if (this.#tokens.size === 0) return '';
    let result = '';
    for (const [name, value] of this.#tokens) {
      result += ` ${name}="${escape(value, true)}"`;
    }
    return result;
  }
}

export class ServerStyle {
  #tokens = new Map<string, string>();
  get length() {
    return this.#tokens.size;
  }
  get tokens() {
    return this.#tokens;
  }
  getPropertyValue(prop: string): string {
    return this.#tokens.get(prop) ?? '';
  }
  setProperty(prop: string, value: string | null) {
    this.#tokens.set(prop, value ?? '');
  }
  removeProperty(prop: string): string {
    const value = this.#tokens.get(prop);
    this.#tokens.delete(prop);
    return value ?? '';
  }
  toString() {
    if (this.#tokens.size === 0) return '';
    let result = '';
    for (const [name, value] of this.#tokens) {
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
  #tokens = new Set<string>();
  get length() {
    return this.#tokens.size;
  }
  get tokens() {
    return this.#tokens;
  }
  add(...tokens: string[]): void {
    for (const token of tokens) {
      this.#tokens.add(token);
    }
  }
  contains(token: string): boolean {
    return this.#tokens.has(token);
  }
  remove(token: string) {
    this.#tokens.delete(token);
  }
  replace(token: string, newToken: string): boolean {
    if (!this.#tokens.has(token)) return false;
    this.#tokens.delete(token);
    this.#tokens.add(newToken);
    return true;
  }
  toggle(token: string, force?: boolean): boolean {
    if (force !== true && (this.#tokens.has(token) || force === false)) {
      this.#tokens.delete(token);
      return false;
    } else {
      this.#tokens.add(token);
      return true;
    }
  }
  toString() {
    return Array.from(this.#tokens).join(' ');
  }
}
