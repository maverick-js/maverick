import {
  $$_current_slots,
  $$_set_current_slots,
  type AnyComponent,
  ATTACH_SYMBOL,
  type ComponentConstructor,
  computed,
  createComponent,
  CUSTOM_ELEMENT_SYMBOL,
  effect,
  type FunctionComponent,
  isComponentConstructor,
  type JSX,
  listenEvent,
  type MaverickCustomElement,
  peek,
  type ReadSignal,
  scoped,
  SETUP_SYMBOL,
  type SlotRecord,
} from '@maverick-js/core';
import {
  isArray,
  isFunction,
  isHTMLElement,
  isString,
  isUndefined,
  setAttribute,
  setStyle,
  toggleClass,
} from '@maverick-js/std';

import { Host } from './components/host';
import { insert } from './insert';
import { hydration } from './render';
import { createMarkerWalker } from './walker';

export { hydration as $$_hydrating } from './render';

/** @internal */
export function $$_create_template(html: string, shouldImportNodes: boolean) {
  const template = document.createElement('template');
  template.innerHTML = html;
  const fragment = template.content;
  if (shouldImportNodes) {
    return $$_import_node.bind(fragment);
  } else {
    return $$_clone_node.bind(fragment);
  }
}

/** @internal */
export function $$_create_walker(template: () => Node): [root: Node, walker: TreeWalker] {
  try {
    const el = $$_next_element(hydration!.w);
    return [el, hydration!.w];
  } catch (e) {
    const root = template();
    return [root, createMarkerWalker(root)];
  }
}

/** @internal */
export let $$_current_class_component: AnyComponent | null = null;

/** @internal */
export let $$_current_host_element: HTMLElement | null = null;

/** @internal */
export let $$_rendering_custom_element = false;

/** @internal */
export const $$_class_component_stack: Array<AnyComponent | null> = [];

/** @internal */
export const $$_slot_stack: Array<SlotRecord | null> = [];

/** @internal */
export function $$_create_component(
  Component: FunctionComponent | ComponentConstructor,
  props: Record<string, any> | null = null,
  listen: ((target: EventTarget) => void) | null = null,
  slots: SlotRecord | null = null,
  onAttach: ((host: HTMLElement) => void) | null = null,
) {
  return peek(() => {
    try {
      $$_slot_stack.push($$_current_slots);
      $$_set_current_slots(slots ?? {});

      if (isComponentConstructor(Component)) {
        try {
          $$_class_component_stack.push($$_current_class_component);

          const customElement = createCustomElement(Component),
            component = customElement?.$ ?? createComponent(Component, { props });

          listen?.(component);

          $$_current_class_component = component;
          $$_current_host_element = customElement;

          if (onAttach) component.$$[ATTACH_SYMBOL].push(onAttach);

          if (customElement) {
            $$_rendering_custom_element = true;
            // Setup, attach, and render are called internally.
            customElement[SETUP_SYMBOL]();
            $$_rendering_custom_element = false;
            return customElement;
          } else {
            component.$$.setup();
            return component.render ? scoped(() => component!.render!(), component.$$.scope) : null;
          }
        } finally {
          $$_current_host_element = null;
          $$_current_class_component = $$_class_component_stack.pop()!;
        }
      } else if (Component === Host) {
        if (__DEV__ && !$$_current_class_component) {
          throw Error(
            `[maverick]: <Host> can only be called at the top of a class component render function [@\`${Component.name}\`]`,
          );
        }

        const host = Component(props ?? {}) as unknown as HTMLElement;

        listen?.(host);

        // Custom element will call attach and connect internally.
        if ($$_current_host_element) {
          onAttach?.(host);
        } else {
          onAttach?.(host);
          $$_current_class_component!.$$.attach(host);
          connectToHost.bind($$_current_class_component!);
        }

        return host;
      } else {
        return Component(props ?? {});
      }
    } finally {
      $$_set_current_slots($$_slot_stack.pop()!);
    }
  });
}

function connectToHost(this: AnyComponent) {
  requestAnimationFrame(() => this.$$.connect());
}

function createCustomElement(Component: ComponentConstructor) {
  if (!isCustomElement(Component)) return null;

  const el = hydration
    ? $$_next_element<MaverickCustomElement>(hydration.w)
    : Component[CUSTOM_ELEMENT_SYMBOL]!();

  el.keepAlive = true;

  return el;
}

function isCustomElement(Component: object) {
  return CUSTOM_ELEMENT_SYMBOL in Component;
}

/** @internal */
export function $$_next_element<T extends Element>(walker: TreeWalker): T {
  return walker.nextNode()!.nextSibling as T;
}

export function $$_child(parent: Element, index: number) {
  return parent.childNodes[index];
}

/** @internal */
export const $$_insert = insert;

/** @internal */
export function $$_insert_at_marker(marker: Comment, value: JSX.Element) {
  insert(marker.parentElement!, value, marker);
}

/** @internal */
export const $$_listen = listenEvent as (
  target: EventTarget,
  type: string,
  handler: (event: any) => any,
  capture?: boolean,
) => void;

/** @internal */
export function $$_listen_callback(props: Record<string, any>) {
  const events: [type: string, handler: () => void, capture: boolean][] = [];

  for (const prop of Object.keys(props)) {
    if (!prop.startsWith('on:') || !isFunction(props[prop])) continue;
    const [namespace, type] = prop.split(':');
    events.push([type, props[prop], namespace === 'on_capture']);
  }

  if (!events.length) return null;

  return (target: EventTarget) => {
    for (const args of events) {
      $$_listen(target, ...args);
    }
  };
}

const DELEGATED_EVENTS_SYMBOL = /* #__PURE__ */ Symbol.for('maverick.delegated_events');

/** @internal */
export function $$_delegate_events(types: string[]) {
  if (typeof document === 'undefined') return;

  let events = document[DELEGATED_EVENTS_SYMBOL];

  if (!events) {
    events = document[DELEGATED_EVENTS_SYMBOL] = new Set();
  }

  for (let i = 0, len = types.length; i < len; i++) {
    const type = types[i];
    if (!events.has(type)) {
      events.add(type);
      document.addEventListener(type, delegated_event_handler);
    }
  }
}

/** @internal */
function delegated_event_handler(event: Event) {
  const eventKey = `$$${event.type}`,
    dataKey = `$$${event.type}Data`;

  let node = ((event.composedPath && event.composedPath()[0]) || event.target) as any;

  // Reverse Shadow DOM re-targeting.
  if (event.target !== node) {
    Object.defineProperty(event, 'target', {
      configurable: true,
      value: node,
    });
  }

  Object.defineProperty(event, 'currentTarget', {
    configurable: true,
    get() {
      return node || document;
    },
  });

  let handler, data;
  while (node) {
    handler = node[eventKey];

    if (handler && !node.disabled && isFunction(handler)) {
      data = node[dataKey];
      !isUndefined(data) ? handler.call(node, data, event) : handler.call(node, event);
    }

    node = node.parentNode || node.host;
  }
}

/** @internal */
function $$_clone_node(this: DocumentFragment): Element {
  return (this.cloneNode(true) as DocumentFragment).firstElementChild!;
}

/** @internal */
function $$_import_node(this: DocumentFragment): Element {
  return (document.importNode(this, true) as DocumentFragment).firstElementChild!;
}

/** @internal */
export function $$_ref<T>(instance: T, value: JSX.Ref<T> | JSX.RefArray<T>) {
  if (isArray(value)) {
    for (const callback of value) callback(instance);
  } else {
    value(instance);
  }
}

/** @internal */
export function $$_prop<T extends object, P extends keyof T>(
  obj: T,
  prop: P,
  value: T[P] | ReadSignal<T[P]>,
) {
  if (isFunction(value)) {
    effect(() => void (obj[prop] = value()));
  } else {
    obj[prop] = value;
  }
}

/** @internal */
export function $$_content(
  el: HTMLElement,
  name: 'innerHTML' | 'innerText' | 'textContent',
  value: string | ReadSignal<string>,
) {
  if (isFunction(value)) {
    effect(() => {
      const text = value();
      if (!hydration) el[name] = text;
    });
  } else if (!hydration) {
    el[name] = value;
  }
}

/** @internal */
export function $$_attr(
  el: HTMLElement,
  name: string,
  value: JSX.AttrValue | ReadSignal<JSX.AttrValue>,
) {
  if (isFunction(value)) {
    effect(() => setAttribute(el, name, value()));
  } else if (!hydration) {
    setAttribute(el, name, value);
  }
}

/** @internal */
export function $$_class(el: HTMLElement, name: string, value: boolean | ReadSignal<boolean>) {
  if (isFunction(value)) {
    effect(() => toggleClass(el, name, value()));
  } else if (!hydration) {
    toggleClass(el, name, value);
  }
}

/** @internal */
export function $$_class_tokens(el: HTMLElement, tokens: string | ReadSignal<string>) {
  if (isFunction(tokens)) {
    effect(() => {
      const list = tokens();
      $$_append_class(el, list);
      return () => $$_remove_class(el, list);
    });
  } else if (!hydration) {
    $$_append_class(el, tokens);
  }
}

/** @internal */
export function $$_append_class(el: HTMLElement, tokens: string) {
  el.classList.add(...$$_split_class_tokens(tokens));
}

/** @internal */
export function $$_remove_class(el: HTMLElement, tokens: string) {
  el.classList.remove(...$$_split_class_tokens(tokens));
}

const classTokensRE = /* #__PURE__ */ /\s+/g;

/** @internal */
export function $$_split_class_tokens(tokens: string) {
  return tokens.split(classTokensRE);
}

/** @internal */
export function $$_style(
  el: HTMLElement,
  prop: keyof JSX.CSSStyleProperties | `--${string}`,
  value: JSX.CSSValue | ReadSignal<JSX.CSSValue>,
) {
  if (isFunction(value)) {
    effect(() => setStyle(el, prop, value()));
  } else if (!hydration) {
    setStyle(el, prop, value);
  }
}

/** @internal */
export function $$_style_tokens(el: HTMLElement, tokens: string | ReadSignal<string>) {
  if (isFunction(tokens)) {
    effect(() => {
      const list = tokens();
      $$_append_styles(el, list);
      return () => $$_remove_styles(el, list);
    });
  } else if (!hydration) {
    $$_append_styles(el, tokens);
  }
}

const styleTokensRE = /* #__PURE__ */ /\s*;\s*/g;

/** @internal */
export function $$_split_style_tokens(styles: string) {
  return styles.split(styleTokensRE);
}

const styleRE = /* #__PURE__ */ /:\s+/;

/** @internal */
export function $$_append_styles(el: HTMLElement, styles: string) {
  const tokens = $$_split_style_tokens(styles);
  for (const token of tokens) {
    const [prop, value] = token.split(styleRE);
    if (prop && value) el.style.setProperty(prop, value);
  }
}

/** @internal */
export function $$_remove_styles(el: HTMLElement, styles: string) {
  const tokens = $$_split_style_tokens(styles);
  for (const token of tokens) {
    const [prop] = token.split(styleRE);
    el.style.removeProperty(prop);
  }
}

/** @internal */
export const $$_signal_name_re = /* #__PURE__ */ /^\$/;

/** @internal */
export function $$_spread<T extends HTMLElement>(el: T, props: Record<keyof T, any>) {
  let colonIndex = -1;

  for (let name of Object.keys(props)) {
    const value = props[name];

    name = name.replace($$_signal_name_re, '');
    colonIndex = name.indexOf(':');

    if (colonIndex > 0) {
      const namespace = name.slice(0, colonIndex),
        prop = name.slice(colonIndex + 1, name.length);
      if (namespace === 'class') {
        $$_class(el, prop, value);
      } else if (namespace.startsWith('on')) {
        $$_listen(el, prop, value, namespace === 'on_capture');
      } else if (namespace === 'var') {
        $$_style(el, `--${prop}`, value);
      } else if (namespace === 'style') {
        $$_style(el, prop, value);
      } else if (namespace === 'prop') {
        $$_prop(el, prop as keyof T, value);
      }
    } else if (name === 'ref') {
      $$_ref(el, value);
    } else if (name === 'class') {
      $$_class_tokens(el, value);
    } else if (name === 'style') {
      $$_style_tokens(el, value);
    } else {
      $$_attr(el, name, props[name]);
    }
  }
}

/** @internal */
export function $$_host_spread<T extends HTMLElement>(el: T, props: Record<keyof T, any>) {
  let colonIndex = -1;

  for (let name of Object.keys(props)) {
    const value = props[name];

    name = name.replace($$_signal_name_re, '');
    colonIndex = name.indexOf(':');

    if (colonIndex > 0) {
      const namespace = name.slice(0, colonIndex),
        prop = name.slice(colonIndex + 1, name.length);
      if (namespace === 'class') {
        $$_class(el, prop, value);
      } else if (namespace === 'var') {
        $$_style(el, `--${prop}`, value);
      }
    } else if (name === 'class' && isString(value)) {
      $$_append_class(el, value);
    }
  }
}

/** @internal */
export function $$_merge_props(...sources: Record<string, any>[]) {
  const target = sources[0] || {};

  for (let i = 1; i < sources.length; i++) {
    const source = sources[i];
    if (source) Object.assign(target, source);
  }

  return target;
}

/** @internal */
export const $$_computed = computed;

/** @internal */
export const $$_effect = effect;

/** @internal */
export const $$_peek = peek;

/** @internal */
export const $$_scoped = scoped;
