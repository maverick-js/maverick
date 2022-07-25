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

export type ScopedDeclarations = {
  all: ReadonlyMap<string, string>;
  create(id: string, value?: string): string;
  update(id: string, value: string): void;
  has(id: string): boolean;
  serialize(pure?: boolean): string;
};

export function createScopedDeclarations(): ScopedDeclarations {
  const all = new Map<string, string>();
  const count: Record<string, number> = {};
  return {
    all,
    create: (id: string, value = '') => {
      const newId = count[id] ? `${id}_${(count[id] = count[id] + 1)}` : id;
      if (!count[id]) count[id] = 1;
      all.set(newId, value);
      return newId;
    },
    update: (id: string, value: string) => {
      if (all.has(id)) all.set(id, value);
    },
    has: (id) => {
      return !!count[id];
    },
    serialize: (pure) => {
      if (all.size === 0) return '';

      let values: string[] = [];
      for (const [id, value] of all) {
        values.push(`${id} = ${pure ? '/* #__PURE__ */ ' : ''}${value}`);
      }
      return `const ${values.join(', ')};`;
    },
  };
}
