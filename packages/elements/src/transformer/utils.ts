import * as t from 'typescript';

export function containsCallExpression(node: t.Node) {
  if (t.isCallExpression(node)) return true;

  let found = false;

  const visit = (node: t.Node) => {
    if (t.isCallExpression(node)) return (found = true);
    return t.forEachChild(node, visit);
  };

  t.forEachChild(node, visit);
  return found;
}

export function escapeBackticks(value: string) {
  return value.replace(/`/g, '\\`');
}

export function replaceRange(str: string, start: number, end: number, substitute: string) {
  return str.substring(0, start) + substitute + str.substring(end);
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

export function createFunctionCall(id: string, params: string[] = []) {
  return `${id}(${params.join(', ')})`;
}

export function createStringArray(values: string[]) {
  return `[${values.map((e) => `"${e}"`).join(', ')}]`;
}

export function createStringLiteral(value: string) {
  return `"${value}"`;
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

export function escapeHTML(value: string, isAttribute = false) {
  if (typeof value !== 'string') return value;

  const delimeter = isAttribute ? '"' : '<';
  const escDelimeter = isAttribute ? '&quot;' : '&lt;';

  let delimeterIndex = value.indexOf(delimeter);
  let ampersandIndex = value.indexOf('&');

  if (delimeterIndex < 0 && ampersandIndex < 0) return value;

  let left = 0,
    out = '';

  while (delimeterIndex >= 0 && ampersandIndex >= 0) {
    if (delimeterIndex < ampersandIndex) {
      if (left < delimeterIndex) out += value.substring(left, delimeterIndex);
      out += escDelimeter;
      left = delimeterIndex + 1;
      delimeterIndex = value.indexOf(delimeter, left);
    } else {
      if (left < ampersandIndex) out += value.substring(left, ampersandIndex);
      out += '&amp;';
      left = ampersandIndex + 1;
      ampersandIndex = value.indexOf('&', left);
    }
  }

  if (delimeterIndex >= 0) {
    do {
      if (left < delimeterIndex) out += value.substring(left, delimeterIndex);
      out += escDelimeter;
      left = delimeterIndex + 1;
      delimeterIndex = value.indexOf(delimeter, left);
    } while (delimeterIndex >= 0);
  } else {
    while (ampersandIndex >= 0) {
      if (left < ampersandIndex) out += value.substring(left, ampersandIndex);
      out += '&amp;';
      left = ampersandIndex + 1;
      ampersandIndex = value.indexOf('&', left);
    }
  }

  return left < value.length ? out + value.substring(left) : out;
}

export function onceFn<T>(fn: () => T): () => T {
  let result: T;
  return () => result ?? (result = fn());
}

export type ScopedDeclarations = {
  all: ReadonlyMap<string, string>;
  create(id: string, value?: string): string;
  update(id: string, value: string): void;
  has(id: string): boolean;
  serialize(): string;
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
    serialize: () => {
      let values: string[] = [];
      for (const [id, value] of all) values.push(`${id} = ${value}`);
      return `const ${values.join(', ')};`;
    },
  };
}
