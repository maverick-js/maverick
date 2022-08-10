import { trimTrailingSemicolon } from '../../utils/print';
import { isFunction, isString } from '../../utils/unit';
import { escape } from '../../utils/html';
import { unwrapDeep } from '../../utils/obs';
import { resolve, SSR_TEMPLATE } from './render';

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

/** @internal */
export function $$_classes(base: unknown, classes: Record<string, unknown>) {
  let baseValue = unwrapDeep(base),
    result = isString(baseValue) ? baseValue : '';

  if (Object.keys(classes).length > 0) {
    const classList = new Set<string>(parseClassAttr(result));
    resolveClasses(classList, classes);
    result = Array.from(classList).join(' ');
  }

  result = result.trim();
  return result.length ? ` class="${escape(result, true)}"` : '';
}

const classSplitRE = /\s+/;
function parseClassAttr(value: string): string[] {
  return value.trim().split(classSplitRE);
}

function resolveClasses(classList: Set<string>, classes: Record<string, unknown>) {
  for (const name of Object.keys(classes)) {
    if (unwrapDeep(classes[name])) {
      classList.add(name);
    } else {
      classList.delete(name);
    }
  }
}

/** @internal */
export function $$_styles(base: unknown, styles: Record<string, unknown>) {
  let baseValue = unwrapDeep(base),
    result = isString(baseValue) ? trimTrailingSemicolon(baseValue) : '';

  if (Object.keys(styles).length > 0) {
    const styleMap = new Map<string, string>();
    parseStyleAttr(styleMap, result);
    resolveStyles(styleMap, styles);
    result = '';
    for (const [name, value] of styleMap) result += `${name}: ${value};`;
  }

  result = result.trim();
  return result.length ? ` style="${escape(result, true)}"` : result;
}

const styleSplitRE = /\s*:\s*/;
const stylesDelimeterRE = /\s*;\s*/;
function parseStyleAttr(styleMap: Map<string, string>, value: string) {
  const styles = value.trim().split(stylesDelimeterRE);
  for (let i = 0; i < styles.length; i++) {
    if (styles[i] === '') continue;
    const [name, value] = styles[i].split(styleSplitRE);
    styleMap.set(name, value);
  }
}

function resolveStyles(styleMap: Map<string, string>, styles: Record<string, unknown>) {
  for (const name of Object.keys(styles)) {
    const value = unwrapDeep(styles[name]);
    if (!value && value !== 0) {
      styleMap.delete(name);
    } else {
      styleMap.set(name, value + '');
    }
  }
}

const propNameRE = /[A-Z]/;
/** @internal */
export function $$_spread(props: Record<string, unknown>[]) {
  let attrsMap = new Map<string, string>(),
    classList = new Set<string>(),
    stylesMap = new Map<string, string>(),
    result = '';

  for (let i = 0; i < props.length; i++) {
    // $$classes and $$styles are dynamics
    const { $$classes, $$styles, class: $classBase, style: $styleBase, ...attributes } = props[i];

    const attrNames = Object.keys(attributes);
    for (let j = 0; j < attrNames.length; j++) {
      const attrName = attrNames[j];
      if (!propNameRE.test(attrName)) {
        const attrValue = resolveAtrr(attributes[attrName]);
        if (isString(attrValue)) {
          attrsMap.set(attrName, attrValue);
        } else {
          attrsMap.delete(attrName);
        }
      }
    }

    if ($classBase || 'class' in props[i]) {
      const base = unwrapDeep($classBase);
      if (!isString(base)) {
        classList.clear();
      } else if (base.length) {
        for (const name of parseClassAttr(base + '')) classList.add(name);
      }
    }

    if ($$classes) resolveClasses(classList, $$classes as Record<string, unknown>);

    if ($styleBase || 'style' in props[i]) {
      const base = unwrapDeep($styleBase);
      if (!isString(base)) {
        stylesMap.clear();
      } else if (base.length) {
        parseStyleAttr(stylesMap, base);
      }
    }

    if ($$styles) resolveStyles(stylesMap, $$styles as Record<string, unknown>);
  }

  if (classList.size > 0) {
    let classes = Array.from(classList).join(' ');
    result += `class="${escape(classes.trim(), true)}"`;
  }

  for (const [name, value] of attrsMap) {
    result += ` ${name}="${escape(value, true)}"`;
  }

  if (stylesMap.size > 0) {
    let styles = '';
    for (const [name, value] of stylesMap) styles += `${name}: ${value};`;
    result += ` style="${escape(styles.trim(), true)}"`;
  }

  return result.trim();
}

export { $$_merge_props, $$_create_component } from '../dom';
