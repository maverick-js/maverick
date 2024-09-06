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
