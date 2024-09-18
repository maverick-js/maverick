/**
 * Converts a camelCase string to kebab-case.
 *
 * @example `myProperty -> my-property`
 */
export function camelToKebabCase(str: string) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Converts a camelCase string to Title Case.
 *
 * @example `myProperty -> Title Case`
 */
export function camelToTitleCase(str: string) {
  return uppercaseFirstChar(str.replace(/([A-Z])/g, ' $1'));
}

/**
 * Converts a kebab-case string to camelCase.
 *
 * @example `my-property -> myProperty`
 */
export function kebabToCamelCase(str: string) {
  return str.replace(/-./g, (x) => x[1].toUpperCase());
}

/**
 * Converts a kebab-case string to PascalCase.
 *
 * @example `myProperty -> MyProperty`
 */
export function kebabToPascalCase(str: string) {
  return kebabToTitleCase(str).replace(/\s/g, '');
}

/**
 * Converts a kebab-case string to Title Case.
 *
 * @example `myProperty -> My Property`
 */
export function kebabToTitleCase(str: string) {
  return uppercaseFirstChar(str.replace(/-./g, (x) => ' ' + x[1].toUpperCase()));
}

export function uppercaseFirstChar(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function lowercaseFirstLetter(str: string) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

const trailingSemicolon = /;\s*$/;
export function trimTrailingSemicolon(text: string) {
  return text.replace(trailingSemicolon, '');
}

const trimQuoteStartRE = /^('|"|`)/,
  trimQuoteEndRE = /('|"|`)$/;

export function trimQuotes(text: string) {
  return text.replace(trimQuoteStartRE, '').replace(trimQuoteEndRE, '');
}

const carriageReturnRE = /\r/g,
  newLineRE = /\n/g,
  spacesRE = /\s+/g;

export function trimWhitespace(text: string) {
  text = text.replace(carriageReturnRE, '');

  if (newLineRE.test(text)) {
    text = text
      .split('\n')
      .map((t, i) => (i ? t.replace(/^\s*/g, '') : t))
      .filter((s) => !/^\s*$/.test(s))
      .join(' ');
  }

  return text.replace(spacesRE, ' ');
}

const doubleQuotesRe = /^"+|"+$/g,
  singleQuotesRE = /^'+|'+$/g;

export const escapeQuotes = (str: string): string =>
  str.replace(doubleQuotesRe, '').replace(singleQuotesRE, '');

export const normalizeLineBreaks = (str: string): string => str.replace(/\\r/g, '\n');

export function splitLineBreaks(str: string): string[] {
  if (typeof str !== 'string') return [];
  return normalizeLineBreaks(str).split('\n');
}

export function escapeDoubleQuotes(value: string) {
  return value.replace(/"/g, '\\"');
}

export function escapeBackticks(value: string) {
  return value.replace(/`/g, '\\`');
}

export function replaceRange(str: string, start: number, end: number, substitute: string) {
  return str.substring(0, start) + substitute + str.substring(end);
}
