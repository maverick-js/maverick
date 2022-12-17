import {
  type AnyCustomElement,
  type AnyCustomElementDefinition,
  getCustomElementInstance,
  registerCustomElement,
  RENDER,
} from '../../element';
import { createElementInstance } from '../../element/instance';
import { attachDeclarativeShadowDOM } from '../../std/dom';
import { createComment, createFragment, setAttribute, setStyle, toggleClass } from '../../std/dom';
import { listenEvent } from '../../std/event';
import { mergeProperties } from '../../std/object';
import { observe } from '../../std/signal';
import { isArray, isFunction } from '../../std/unit';
import type { JSX } from '../jsx';
import { onDispose, peek, SCOPE, scoped } from '../reactivity';
import { createMarkerWalker, insert, insertExpression, type StartMarker } from './insert';
import { hydration } from './render';

/** @internal */
export function $$_create_template(html: string) {
  const template = document.createElement('template');
  template.innerHTML = html;
  return template.content;
}

/** @internal */
export const $$_create_fragment = createFragment;

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
export function $$_host_element() {
  return getCustomElementInstance()!.host.el!;
}

/** @internal */
export function $$_next_custom_element(
  definition: AnyCustomElementDefinition,
  walker = hydration?.w,
): Node {
  const { tagName } = definition;
  registerCustomElement(definition);

  let next: Comment | undefined;

  if (walker) {
    next = walker.nextNode() as Comment;
    const element = next.nextSibling as Element | null;
    if (element && element.localName === tagName) return element;
  }

  const element = $$_create_element(tagName);
  element.setAttribute('mk-d', '');
  if (next) insertExpression(next, element);
  return element;
}

/** @internal */
export function $$_setup_custom_element(
  element: AnyCustomElement,
  definition: AnyCustomElementDefinition,
  props?: Record<string, any>,
) {
  if (definition.shadowRoot) $$_attach_declarative_shadow_dom(element);

  const instance = createElementInstance(definition, { props });
  element.attachComponent(instance);
  onDispose(() => instance.destroy());

  if (!props) return;
  if (props.innerHTML) return $$_inner_html(element, props.innerHTML);

  const marker = createComment('$$');

  if (instance[RENDER] && !definition.shadowRoot) {
    element.firstChild!.after(marker);
  } else {
    element.prepend(marker);
  }

  scoped(() => insertExpression(marker, props.$children), instance[SCOPE]);
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
export function $$_attach_declarative_shadow_dom(element: AnyCustomElement) {
  if (element.firstChild?.nodeName === 'TEMPLATE') {
    if ((element.firstChild as HTMLTemplateElement).hasAttribute('shadowroot')) {
      attachDeclarativeShadowDOM(element);
    } else {
      element.firstChild.remove();
    }
  }
}

/** @internal */
export const $$_insert = insert;

/** @internal */
export const $$_insert_at_marker = insertExpression;

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
  if (isFunction(directive)) directive(element, ...args);
}

/** @internal */
export const $$_attr = setAttribute;

/** @internal */
export function $$_prop(element: Element, name: string, value: unknown) {
  observe(value, (value) => {
    element[name] = value;
  });
}

/** @internal */
export function $$_inner_html(element: Element, value: unknown) {
  observe(value, (value) => {
    if (!hydration) element.innerHTML = value + '';
  });
}

/** @internal */
export const $$_class = toggleClass;

/** @internal */
export const $$_style = setStyle;

/** @internal */
export function $$_cssvar(element: HTMLElement, name: string, value: unknown) {
  setStyle(element, `--${name}`, value);
}

/** @internal */
export function $$_next_expression(value: any) {
  if (hydration) insertExpression(hydration.w.nextNode() as StartMarker, value);
  return value;
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
export const $$_merge_props = mergeProperties;

/** @internal */
export function $$_listen(target: EventTarget, type: string, handler: unknown, capture = false) {
  if (isFunction(handler)) listenEvent(target, type as any, handler as any, { capture });
}

export const $$_peek = peek;
