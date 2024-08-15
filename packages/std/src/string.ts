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
