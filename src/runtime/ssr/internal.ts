import { trimTrailingSemicolon } from '../../utils/print';
import { isFunction, isString } from '../../utils/unit';
import { escape, resolve, SSR_TEMPLATE } from './render';

/** @internal */
export function $$_ssr(template: string[], ...parts: unknown[]) {
  let result = '';

  for (let i = 0; i < template.length; i++) {
    result += template[i];
    result += resolve(escape(parts[i]));
  }

  return { [SSR_TEMPLATE]: result };
}

/** @internal */
export function $$_attr(name: string, value: unknown) {
  const attrValue = resolveAtrr(value);
  return isString(attrValue) ? ` ${name}="${escape(attrValue, true)}"` : '';
}

function resolveAtrr(value: unknown) {
  if (isFunction(value)) return resolveAtrr(value());
  if (!value && value !== '' && value !== 0) {
    return null;
  } else {
    return value + '';
  }
}

const classSplitRE = /\s+/;

/** @internal */
export function $$_classes(base: unknown, ...classes: [string, unknown][]) {
  let baseValue = resolveClass(base),
    result = baseValue ? baseValue + '' : '';

  if (classes.length > 0) {
    const classList = new Set<string>(result.trim().split(classSplitRE));

    for (let i = 0; i < classes.length; i++) {
      const [name, value] = classes[i];
      if (resolveClass(value)) {
        classList.add(name);
      } else {
        classList.delete(name);
      }
    }

    result = Array.from(classList).join(' ');
  }

  return ` class="${escape(result, true)}"`;
}

function resolveClass(value: unknown) {
  if (isFunction(value)) return resolveClass(value());
  return value;
}

/** @internal */
export function $$_styles(base: unknown, ...styles: [string, unknown][]) {
  let baseValue = resolveStyle(base),
    result = baseValue ? trimTrailingSemicolon(baseValue + '') + ';' : '';

  for (let i = 0; i < styles.length; i++) {
    const [name, value] = styles[i];
    const attrValue = resolveStyle(value);
    if (attrValue) result += `${name}: ${attrValue};`;
  }

  return ` style="${escape(result, true)}"`;
}

function resolveStyle(value: unknown) {
  if (isFunction(value)) return resolveStyle(value());
  if (!value && value !== '' && value !== 0) {
    return null;
  } else {
    return value + '';
  }
}

const uppercaseRE = /[A-Z]/;
/** @internal */
export function $$_spread(props: Record<string, unknown>) {
  let result = '';

  const keys = Object.keys(props);
  for (let i = 0; i < keys.length; i++) {
    const name = keys[i];
    if (!uppercaseRE.test(name)) {
      const value = resolveAtrr(props[name]);
      if (isString(value)) result += ` ${name}="${escape(value, true)}"`;
    }
  }

  return result;
}

export { $$_merge_props, $$_create_component } from '../dom';
