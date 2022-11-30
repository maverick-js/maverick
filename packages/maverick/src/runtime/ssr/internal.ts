import { type AnyElementDefinition, createServerElement } from '../../element';
import { createElementInstance } from '../../element/instance';
import { getElementInstance } from '../../element/internal';
import { escape } from '../../std/html';
import { unwrapDeep } from '../../std/observable';
import { trimTrailingSemicolon } from '../../std/string';
import { isFunction, isNull, isString } from '../../std/unit';
import { injectHTML, resolve, SSR_TEMPLATE } from './render';

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
export function $$_host_element(spreads?: Record<string, unknown>[]) {
  const host = getElementInstance()!.host.el!;

  if (spreads && spreads.length > 0) {
    const spread = $$_merge_spreads(spreads);

    for (const [key, value] of spread.attributes) {
      host.setAttribute(key, value);
    }

    for (const token of spread.classList) {
      host.classList.add(token);
    }

    for (const [key, value] of spread.styles) {
      host.style.setProperty(key, value);
    }
  }

  return '';
}

/** @internal */
export function $$_custom_element(
  definition: AnyElementDefinition,
  props?: Record<string, any>,
  spreads?: Record<string, unknown>[],
) {
  const host = new (createServerElement(definition))();

  if (spreads && spreads.length > 0) {
    const spread = $$_merge_spreads(spreads);

    for (const [key, value] of spread.attributes) {
      host.attributes.setAttribute(key, value);
    }

    for (const token of spread.classList) {
      host.classList.add(token);
    }

    for (const [key, value] of spread.styles) {
      host.style.setProperty(key, value);
    }
  }

  const hasInnerHTML = !!props?.innerHTML,
    innerHTML = hasInnerHTML ? resolve(props.innerHTML) : null,
    children = hasInnerHTML ? innerHTML! : resolve(props?.$children),
    hasChildElements = children.replace(/<!(.*?)>/g, '').length > 0,
    instance = createElementInstance(definition, {
      props,
      children: () => hasChildElements,
    });

  host.attachComponent(instance);

  return {
    [SSR_TEMPLATE]: `<${definition.tagName}${host.attributes}>${
      hasInnerHTML ? children : host.render() + children
    }</${definition.tagName}>`,
  };
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
export function $$_classes(base: unknown, tokens: Record<string, unknown>) {
  let baseValue = unwrapDeep(base),
    result = isString(baseValue) ? baseValue : '';

  if (Object.keys(tokens).length > 0) {
    const classList = new Set<string>();
    parseClassAttr(classList, result);
    resolveClasses(classList, tokens);
    result = Array.from(classList).join(' ');
  }

  result = result.trim();
  return result.length ? ` class="${escape(result, true)}"` : '';
}

const classSplitRE = /\s+/;
export function parseClassAttr(tokens: Set<string>, attrValue: string) {
  const classes = attrValue.trim().split(classSplitRE);
  for (const token of classes) tokens.add(token);
}

function resolveClasses(classList: Set<string>, tokens: Record<string, unknown>) {
  for (const name of Object.keys(tokens)) {
    if (unwrapDeep(tokens[name])) {
      classList.add(name);
    } else {
      classList.delete(name);
    }
  }
}

/** @internal */
export function $$_styles(base: unknown, tokens: Record<string, unknown>) {
  let baseValue = unwrapDeep(base),
    result = isString(baseValue) ? trimTrailingSemicolon(baseValue) : '';

  if (Object.keys(tokens).length > 0) {
    const styleMap = new Map<string, string>();
    parseStyleAttr(styleMap, result);
    resolveStyles(styleMap, tokens);
    result = '';
    for (const [name, value] of styleMap) result += `${name}: ${value};`;
  }

  result = result.trim();
  return result.length ? ` style="${escape(result, true)}"` : result;
}

const styleSplitRE = /\s*:\s*/;
const stylesDelimeterRE = /\s*;\s*/;
export function parseStyleAttr(tokens: Map<string, string>, attrValue: string) {
  const styles = attrValue.trim().split(stylesDelimeterRE);
  for (let i = 0; i < styles.length; i++) {
    if (styles[i] === '') continue;
    const [name, value] = styles[i].split(styleSplitRE);
    tokens.set(name, value);
  }
}

function resolveStyles(tokens: Map<string, string>, styles: Record<string, unknown>) {
  for (const name of Object.keys(styles)) {
    const value = unwrapDeep(styles[name]);
    if (!value && value !== 0) {
      tokens.delete(name);
    } else {
      tokens.set(name, value + '');
    }
  }
}

const propNameRE = /[A-Z]/;
export function $$_merge_spreads(spreads: Record<string, unknown>[]) {
  let attributes = new Map<string, string>(),
    classList = new Set<string>(),
    styles = new Map<string, string>();

  for (let i = 0; i < spreads.length; i++) {
    // $$class and $$style are dynamics
    const { $$class, $$style, class: classBase, style: styleBase, ...attrs } = spreads[i];

    const attrNames = Object.keys(attrs);
    for (let j = 0; j < attrNames.length; j++) {
      const attrName = attrNames[j];
      if (!propNameRE.test(attrName)) {
        const attrValue = resolveAtrr(attrs[attrName]);
        if (isString(attrValue)) {
          attributes.set(attrName, attrValue);
        } else {
          attributes.delete(attrName);
        }
      }
    }

    if ('class' in spreads[i]) {
      const base = unwrapDeep(classBase);
      if (isNull(base) || base === false) {
        classList.clear();
      } else if (isString(base) && base.length) {
        parseClassAttr(classList, base + '');
      }
    }

    if ($$class) resolveClasses(classList, $$class as Record<string, unknown>);

    if ('style' in spreads[i]) {
      const base = unwrapDeep(styleBase);
      if (isNull(base) || base === false) {
        styles.clear();
      } else if (isString(base) && base.length) {
        parseStyleAttr(styles, base);
      }
    }

    if ($$style) resolveStyles(styles, $$style as Record<string, unknown>);
  }

  return { attributes, classList, styles };
}

/** @internal */
export function $$_spread(spreads: Record<string, unknown>[]) {
  const { attributes, classList, styles } = $$_merge_spreads(spreads);

  let result = '';

  if (classList.size > 0) {
    let _class = Array.from(classList).join(' ');
    result += `class="${escape(_class.trim(), true)}"`;
  }

  for (const [name, value] of attributes) {
    result += ` ${name}="${escape(value, true)}"`;
  }

  if (styles.size > 0) {
    let _styles = '';
    for (const [name, value] of styles) _styles += `${name}: ${value};`;
    result += ` style="${escape(_styles.trim(), true)}"`;
  }

  return result.trim();
}

export function $$_inject_html(value: unknown): any {
  return injectHTML(resolve(value));
}

export { $$_merge_props, $$_create_component } from '../dom';
