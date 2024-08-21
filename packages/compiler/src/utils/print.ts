export function escapeDoubleQuotes(value: string) {
  return value.replace(/"/g, '\\"');
}

export function escapeBackticks(value: string) {
  return value.replace(/`/g, '\\`');
}

export function replaceRange(str: string, start: number, end: number, substitute: string) {
  return str.substring(0, start) + substitute + str.substring(end);
}

export const escapeQuotes = (str: string): string =>
  str.replace(/^"+|"+$/g, '').replace(/^'+|'+$/g, '');

export const normalizeLineBreaks = (str: string): string => str.replace(/\\r/g, '\n');

export function splitLineBreaks(str: string): string[] {
  if (typeof str !== 'string') return [];
  return normalizeLineBreaks(str).split('\n');
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

const trailingSemicolon = /;\s*$/;
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
