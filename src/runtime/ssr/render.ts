import { isArray, isFunction, isNumber, isObject, isString } from '../../utils/unit';
import { root as $root } from '../reactivity';

export function renderToString<T>(root: () => T) {
  const result = $root((dispose) => {
    const value = root();
    dispose();
    return value;
  });

  return { code: resolve(escape(result)) };
}

/** @internal */
export const SSR_TEMPLATE = Symbol();

export function resolve(node: unknown): string {
  if (isFunction(node)) {
    return resolve(node());
  } else if (isArray(node)) {
    let result = '';
    const flattened = node.flat(10);
    for (let i = 0; i < flattened.length; i++) {
      result += resolve(escape(flattened[i]));
    }
    return result;
  } else if (isString(node) || isNumber(node)) {
    return node + '';
  } else if (isObject(node) && node[SSR_TEMPLATE]) {
    return node[SSR_TEMPLATE];
  }

  return '';
}

export function escape(value: any, isAttr = false) {
  const type = typeof value;

  if (type !== 'string') {
    if (!isAttr && type === 'function') return escape(value());
    if (isAttr && type === 'boolean') return value + '';
    return value;
  }

  const delimeter = isAttr ? '"' : '<',
    escapeDelimeter = isAttr ? '&quot;' : '&lt;';

  let iDelimeter = value.indexOf(delimeter),
    isAmpersand = value.indexOf('&');

  if (iDelimeter < 0 && isAmpersand < 0) return value;

  let left = 0,
    out = '';

  while (iDelimeter >= 0 && isAmpersand >= 0) {
    if (iDelimeter < isAmpersand) {
      if (left < iDelimeter) out += value.substring(left, iDelimeter);
      out += escapeDelimeter;
      left = iDelimeter + 1;
      iDelimeter = value.indexOf(delimeter, left);
    } else {
      if (left < isAmpersand) out += value.substring(left, isAmpersand);
      out += '&amp;';
      left = isAmpersand + 1;
      isAmpersand = value.indexOf('&', left);
    }
  }

  if (iDelimeter >= 0) {
    do {
      if (left < iDelimeter) out += value.substring(left, iDelimeter);
      out += escapeDelimeter;
      left = iDelimeter + 1;
      iDelimeter = value.indexOf(delimeter, left);
    } while (iDelimeter >= 0);
  } else
    while (isAmpersand >= 0) {
      if (left < isAmpersand) out += value.substring(left, isAmpersand);
      out += '&amp;';
      left = isAmpersand + 1;
      isAmpersand = value.indexOf('&', left);
    }

  return left < value.length ? out + value.substring(left) : out;
}
