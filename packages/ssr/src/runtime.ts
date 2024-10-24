import {
  $$_current_slots,
  $$_set_current_slots,
  type AnyComponent,
  ATTACH_SYMBOL,
  type ComponentConstructor,
  createComponent,
  type FunctionComponent,
  isComponentConstructor,
  type JSX,
  scoped,
} from '@maverick-js/core';
import {
  camelToKebabCase,
  escapeHTML,
  isArray,
  isFunction,
  isNumber,
  isString,
  unwrap,
  unwrapDeep,
} from '@maverick-js/std';

import type { HostComponentAttrs } from './components/host';
import type { ServerElement } from './element/server-element';
import { ServerStyleDeclaration } from './element/server-style-declaration';
import { ServerTokenList } from './element/server-token-list';

/** @internal */
export function $$_ssr(template: string[], values: any[]) {
  let result = '';

  for (let i = 0; i < template.length; i++) {
    result += template[i];
    result += resolve(values[i]);
  }

  return result;
}

function resolve(node: unknown): string {
  if (isString(node) || isNumber(node)) {
    return node + '';
  } else if (isFunction(node)) {
    return resolve(node());
  } else if (isArray(node)) {
    return node.flat(10).map(resolve) + '<!/[]>';
  } else {
    return '';
  }
}

/** @internal */
export function $$_attrs(attrs: Record<string, unknown>) {
  let result = '';

  for (const name of Object.keys(attrs)) {
    const value = unwrap(attrs[name]);
    if (!value && value !== '' && value !== 0) continue;
    result += ' ' + name + attrs[name];
  }

  return result;
}

/** @internal */
export function $$_class(base: unknown, props: Record<string, unknown>) {
  const classList = new ServerTokenList();

  if (isString(base)) {
    classList.parse(base);
  }

  $$_class_props(classList, props);

  return classList.toString();
}

function $$_class_props(classList: ServerTokenList, props: Record<string, unknown>) {
  for (const name of Object.keys(props)) {
    const value = unwrapDeep(props[name]);
    classList[value ? 'add' : 'remove'](name);
  }
}

/** @internal */
export function $$_style(base: unknown, props: Record<string, unknown>) {
  const styles = new ServerStyleDeclaration();

  if (isString(base)) {
    styles.parse(base);
  }

  $$_style_props(styles, props);

  return styles.toString();
}

function $$_style_props(styles: ServerStyleDeclaration, props: Record<string, unknown>) {
  for (const prop of Object.keys(props)) {
    const value = unwrapDeep(props[prop]);
    if (!value && value !== 0) continue;
    styles.setProperty(prop, value + '');
  }
}

/** @internal */
export let $$_current_class_component: AnyComponent | null = null;

/** @internal */
export const $$_slot_stack: Array<Record<string, any> | null> = [];

/** @internal */
export function $$_create_component(
  Component: FunctionComponent | ComponentConstructor,
  props: Record<string, any> | null = null,
  slots: Record<string, any> | null = null,
  attrs: HostComponentAttrs | null = null,
) {
  try {
    $$_slot_stack.push($$_current_slots);
    $$_set_current_slots(slots ?? {});

    if (isComponentConstructor(Component)) {
      const component = createComponent(Component, { props });

      $$_current_class_component = component;

      component.$$.setup();

      if (attrs) {
        component.$$[ATTACH_SYMBOL].push((host) => {
          const $$host = host as unknown as ServerElement;

          if (attrs.class) {
            $$host.classList.parse(attrs.class);
          }

          if (attrs.$class) {
            $$_class_props($$host.classList, attrs.$class);
          }

          if (attrs.$var) {
            $$_style_props($$host.style, attrs.$var);
          }
        });
      }

      const result = component.render
        ? scoped(() => component!.render!(), component.$$.scope)
        : null;

      return result;
    } else {
      return Component(props ?? {});
    }
  } finally {
    $$_current_class_component = null;
    $$_set_current_slots($$_slot_stack.pop()!);
  }
}

/** @internal */
export function $$_merge_props(...sources: Record<string, unknown>[]) {
  const target = sources[0] || {};

  for (let i = 1; i < sources.length; i++) {
    const source = sources[i];
    if (source) Object.assign(target, source);
  }

  return target;
}

/** @internal */
export const $$_signal_name_re = /* #__PURE__ */ /^\$/;

/** @internal */
export function $$_merge_attrs(...sources: Record<string, unknown>[]) {
  let { class: _class, style, ...props } = $$_merge_props(...sources),
    $class: Record<string, unknown> | null = null,
    $style: Record<string, unknown> | null = null,
    attrs: Record<string, unknown> = {},
    colonIndex = -1;

  for (let name of Object.keys(props)) {
    const value = props[name];

    name = name.replace($$_signal_name_re, '');
    colonIndex = name.indexOf(':');

    if (colonIndex > 0) {
      const namespace = name.slice(0, colonIndex),
        prop = name.slice(colonIndex + 1, name.length);
      if (namespace === 'class') {
        ($class ??= {})[prop] = value;
      } else if (namespace === 'style') {
        ($style ??= {})[camelToKebabCase(name)] = value;
      } else if (namespace === 'var') {
        ($style ??= {})[`--${prop}`] = value;
      }
    } else {
      attrs[name] = value;
    }
  }

  attrs.class = $class ? $$_class(_class, $class) : _class;
  attrs.styles = $style ? $$_style(style, $style) : style;

  return $$_attrs(attrs);
}

/** @internal */
export function $$_merge_host_attrs(...sources: Record<string, unknown>[]) {
  let { class: _class, ...props } = $$_merge_props(...sources),
    attrs: {
      class?: unknown;
      $class: Record<string, unknown> | null;
      $var: Record<string, unknown> | null;
    } = { class: _class, $class: null, $var: null },
    colonIndex = -1;

  // Filter out component props so they're not rendered as element attributes.
  for (let name of Object.keys(props)) {
    const value = props[name];

    name = name.replace($$_signal_name_re, '');
    colonIndex = name.indexOf(':');

    if (colonIndex === -1) continue;

    const namespace = name.slice(0, colonIndex),
      prop = name.slice(colonIndex + 1, name.length);

    if (namespace === 'class') {
      (attrs.$class ??= {})[prop] = value;
    } else if (namespace === 'var') {
      (attrs.$var ??= {})[prop] = value;
    }
  }

  return attrs;
}

/** @internal */
export const $$_escape = escapeHTML;
