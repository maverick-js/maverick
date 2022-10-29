import { computed, effect, onDispose, peek } from '../reactivity';
import { isArray, isFunction } from '../../utils/unit';
import type { JSX } from '../jsx';
import { createMarkerWalker, insertExpression, type StartMarker } from './expression';
import { hydration } from './render';
import { createFragment, insert, listen, setAttribute, setStyle, toggleClass } from './utils';
import { defineCustomElement, type MaverickElement, type ElementDefinition } from '../../element';
import { attachDeclarativeShadowDOM, supportsDeclarativeShadowDOM } from '../../utils/dom';

/** @internal */
export function $$_create_template(html: string) {
  const template = document.createElement('template');
  template.innerHTML = html;
  return template.content;
}

/** @internal */
export function $$_create_fragment() {
  return createFragment();
}

/** @internal */
export function $$_create_walker(
  fragment: DocumentFragment,
  walker = hydration?.w,
): [root: Node, walker: TreeWalker] {
  try {
    return [$$_next_element(walker!), walker!];
  } catch (e) {
    return $$_create_walker(fragment, createMarkerWalker(fragment.cloneNode(true)));
  }
}

/** @internal */
export function $$_next_template(fragment: DocumentFragment) {
  return $$_create_walker(fragment)[0];
}

/** @internal */
export function $$_next_element(walker: TreeWalker): Node {
  return walker.nextNode()!.nextSibling!;
}

/** @internal */
export function $$_next_custom_element(definition: ElementDefinition, walker = hydration?.w): Node {
  defineCustomElement(definition);
  const { tagName } = definition;
  if (walker) {
    const next = walker.nextNode() as Node;
    if ((next.nextSibling as Element)?.localName !== tagName) {
      const element = $$_create_element(tagName);
      insertExpression(next as Comment, element);
      return element;
    } else {
      return next;
    }
  } else {
    return $$_create_element(tagName);
  }
}

/** @internal */
export function $$_clone(fragment: DocumentFragment): Element {
  const clone = fragment.cloneNode(true) as DocumentFragment;
  return clone.firstElementChild!;
}

/** @internal */
export function $$_create_element(tagName: string) {
  return document.createElement(tagName);
}

/** @internal */
export function $$_setup_custom_element(
  element: MaverickElement,
  definition: ElementDefinition,
  props?: Record<string, any>,
) {
  if (hydration && definition.shadowRoot && !supportsDeclarativeShadowDOM()) {
    attachDeclarativeShadowDOM(element);
  }

  const children = computed(() => props?.innerHTML || props?.$children);
  onDispose(element.$setup({ props, children }));

  if (!hydration) {
    if (props?.innerHTML) {
      observeOrRun(props.innerHTML, (innerHTML) => {
        element.innerHTML += innerHTML;
      });
    } else {
      $$_insert(element, children);
    }
  } else {
    children();
  }
}

/** @internal */
export function $$_insert(parent: Element, value: JSX.Element, before?: Element) {
  insert(parent, value, before);
}

/** @internal */
export function $$_insert_at_marker(marker: StartMarker, value: JSX.Element) {
  insertExpression(marker, value);
}

/** @internal */
export function $$_create_component<T = any>(
  component: (props: T) => Node | null | undefined,
  props: T = {} as any,
) {
  return peek(() => component(props));
}

/** @internal */
export function $$_ref(element: Element, ref: JSX.Ref | JSX.RefArray) {
  if (isArray(ref)) {
    ref.filter(isFunction).forEach((ref) => ref(element));
  } else if (isFunction(ref)) {
    ref(element);
  }
}

/** @internal */
export function $$_directive(element: Element, directive: JSX.Directive, args: unknown[]) {
  if (isFunction(directive)) {
    directive(element, ...args);
  }
}

/** @internal */
export function $$_attr(element: Element, name: string, value: unknown) {
  observeOrRun(value, (value) => setAttribute(element, name, value));
}

/** @internal */
export function $$_prop(element: Element, name: string, value: unknown) {
  observeOrRun(value, (value) => {
    element[name] = value;
  });
}

/** @internal */
export function $$_inner_html(element: Element, value: unknown) {
  observeOrRun(value, (value) => {
    if (!hydration) element.innerHTML = value as string;
  });
}

/** @internal */
export function $$_class(element: Element, name: string, value: unknown) {
  observeOrRun(value, (value) => toggleClass(element, name, value));
}

/** @internal */
export function $$_style(element: HTMLElement, name: string, value: unknown) {
  observeOrRun(value, (value) => setStyle(element, name, value));
}

/** @internal */
export function $$_cssvar(element: HTMLElement, name: string, value: unknown) {
  const prop = `--${name}`;
  observeOrRun(value, (value) => setStyle(element, prop, value));
}

/** @internal */
export function $$_spread(element: Element, props: Record<string, unknown>) {
  const keys = Object.keys(props);
  for (let i = 0; i < keys.length; i++) {
    const prop = keys[i];
    if (prop in element) {
      $$_prop(element, prop, props[prop]);
    } else {
      $$_attr(element, prop, props[prop]);
    }
  }
}

/** @internal */
export function $$_merge_props(...sources: Record<string, unknown>[]) {
  const target = {};

  for (let i = 0; i < sources.length; i++) {
    const source = sources[i];
    if (source) Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
  }

  return target;
}

/** @internal */
export function $$_listen(target: EventTarget, type: string, handler: unknown, capture = false) {
  if (isFunction(handler)) {
    listen(target, type, handler as any, { capture });
  }
}

function observeOrRun<T>(value: T, callback: (value: T) => void) {
  if (__NODE__) {
    callback(value);
    return;
  }

  if (isFunction(value)) {
    effect(() => callback(value()));
  } else {
    callback(value);
  }
}
