import { createFromBuffer } from '@dprint/formatter';
import { getBuffer } from '@dprint/typescript';

const formatter = createFromBuffer(getBuffer());

export function format(filename: string, contents: string) {
  return formatter.formatText(filename, contents);
}

export function createImportDeclaration(
  defaultSpecifier: string | null,
  namedSpecifiers: string[],
  moduleId: string,
) {
  let _default = defaultSpecifier ? `${defaultSpecifier}, ` : '';
  let _named = namedSpecifiers.length > 0 ? `{ ${namedSpecifiers.join(', ')} }` : '';
  return `import ${_default}${_named} from "${moduleId}";`;
}

export function escapeBackticks(value: string) {
  return value.replace(/`/g, '\\`');
}

export function replaceRange(str: string, start: number, end: number, substitute: string) {
  return str.substring(0, start) + substitute + str.substring(end);
}

export const normalizeLineBreaks = (str: string): string => str.replace(/\\r/g, '\n');

export function splitLineBreaks(str: string): string[] {
  if (typeof str !== 'string') return [];
  return normalizeLineBreaks(str).split('\n');
}

export function createFunctionCall(id: string, params: string[] = []) {
  return `${id}(${params.join(', ')})`;
}

export function createStringArray(values: string[]) {
  return `[${values.map((e) => `"${e}"`).join(', ')}]`;
}

export function createStringLiteral(value: string) {
  return !value.startsWith('"') ? `"${value}"` : value;
}

export function newLineStart(str: string) {
  return `\n${str}`;
}

export function newLineEnd(str: string) {
  return `${str}\n`;
}

export function newLinesAround(str: string) {
  return newLineStart(newLineEnd(str));
}

const trimQuoteStartRE = /^('|"|`)/;
const trimQuoteEndRE = /('|"|`)$/;
export function trimQuotes(text: string) {
  return text.replace(trimQuoteStartRE, '').replace(trimQuoteEndRE, '');
}

export function trimBraces(text: string) {
  return text.replace(/^\{/, '').replace(/\}$/, '');
}

const trailingSemicolon = /;$/;
export function trimTrailingSemicolon(text: string) {
  return text.replace(trailingSemicolon, '');
}

export function trimWhitespace(text: string) {
  text = text.replace(/\r/g, '');

  if (/\n/g.test(text)) {
    text = text
      .split('\n')
      .map((t, i) => (i ? t.replace(/^\s*/g, '') : t))
      .filter((s) => !/^\s*$/.test(s))
      .join(' ');
  }

  return text.replace(/\s+/g, ' ');
}

export class Declarations {
  protected _all = new Map<string, string>();
  protected _count: Record<string, number> = {};

  get size() {
    return this._all.size;
  }

  create(id: string, value = '') {
    const newId = this._count[id] ? `${id}_${(this._count[id] = this._count[id] + 1)}` : id;
    if (!this._count[id]) this._count[id] = 1;
    this._all.set(newId, value);
    return newId;
  }

  update(id: string, value: string) {
    if (this._all.has(id)) {
      this._all.set(id, value);
    }
  }

  has(id: string) {
    return !!this._count[id];
  }

  serialize(pure = false) {
    if (this._all.size === 0) return '';

    let values: string[] = [];

    for (const [id, value] of this._all) {
      values.push(`${id} = ${pure ? '/* #__PURE__ */ ' : ''}${value}`);
    }

    return `const ${values.join(`,\n  `)};\n`;
  }
}
