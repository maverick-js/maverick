import { isArray, isFunction, isNumber, isObject, isString } from '../../utils/unit';
import { escape } from '../../utils/html';
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
