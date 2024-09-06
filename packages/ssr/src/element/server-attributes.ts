import { escapeHTML } from '@maverick-js/std';

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
      result += ` ${name}="${escapeHTML(value, true)}"`;
    }
    return result;
  }
}
