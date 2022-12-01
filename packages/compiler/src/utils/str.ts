export function camelToKebabCase(str: string) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

export function kebabToCamelCase(str: string) {
  return str.replace(/-./g, (x) => x[1].toUpperCase());
}

export function kebabToPascalCase(str: string) {
  return kebabToCamelCase(uppercaseFirstChar(str));
}

export function uppercaseFirstChar(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const escapeQuotes = (str: string): string =>
  str.replace(/^"+|"+$/g, '').replace(/^'+|'+$/g, '');
