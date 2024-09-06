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
