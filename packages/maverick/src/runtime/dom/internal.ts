import {
  type AnyCustomElement,
  type CustomElementDefinition,
  getCustomElementInstance,
  registerCustomElement,
  RENDER,
} from '../../element';
import { createElementInstance } from '../../element/instance';
import { SCOPE } from '../../element/internal';
import { attachDeclarativeShadowDOM } from '../../std/dom';
import { createFragment, setAttribute, setStyle, toggleClass } from '../../std/dom';
import { listenEvent } from '../../std/event';
import { isArray, isFunction, isUndefined } from '../../std/unit';
import type { JSX } from '../jsx';
import { computed, effect, onDispose, peek, scoped } from '../reactivity';
import { insert } from './insert';
import { hydration } from './render';
import { createMarkerWalker } from './walker';

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
  return walker.nextNode()!.nextSibling as Element;
}

/** @internal */
export function $$_host_element() {
  return getCustomElementInstance()!.host.el!;
}

/** @internal */
export function $$_next_custom_element(
  definition: CustomElementDefinition,
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
  if (next) insert(next.parentElement!, element, next);

  return element;
}

/** @internal */
export function $$_setup_custom_element(
  element: AnyCustomElement,
  definition: CustomElementDefinition,
  props?: Record<string, any>,
) {
  if (definition.shadowRoot) $$_attach_declarative_shadow_dom(element);

  const instance = createElementInstance(definition, { props });
  element.attachComponent(instance);
  onDispose(() => instance.destroy());

  if (!props) return;
  if (props.innerHTML) return $$_inner_html(element, props.innerHTML);

  if ((!instance[RENDER] || definition.shadowRoot) && props.$children) {
    scoped(() => insert(element, props.$children), instance[SCOPE]);
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
export function $$_insert_at_marker(marker: Comment, value: JSX.Element) {
  insert(marker.parentElement!, value, marker);
}

/** @internal */
export function $$_create_component<T = any>(
  component: (props: T) => Node | null | undefined,
  props: T = {} as any,
) {
  return peek(() => component(props));
}

export const $$CHILDREN = /* #__PURE__ */ Symbol(__DEV__ ? '$$CHILDREN' : 0);

/** @internal */
export function $$_children(fn: () => JSX.Element) {
  fn[$$CHILDREN] = true;
  return fn;
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
export function $$_inner_html(element: Element, value: unknown) {
  if (isFunction(value)) {
    effect(() => {
      if (!hydration) element.innerHTML = value() + '';
    });
  } else if (!hydration) {
    element.innerHTML = value + '';
  }
}

/** @internal */
export const $$_class = toggleClass;

/** @internal */
export const $$_style = setStyle;

/** @internal */
export function $$_spread(element: Element, props: Record<string, unknown>) {
  const keys = Object.keys(props);
  for (let i = 0; i < keys.length; i++) {
    const prop = keys[i];
    if (prop in element) {
      if (isFunction(props[prop])) {
        effect(() => void (element[prop] = (props[prop] as Function)()));
      } else {
        element[prop] = props[prop];
      }
    } else if (isFunction(props[prop])) {
      effect(() => void $$_attr(element, prop, (props[prop] as Function)()));
    } else {
      $$_attr(element, prop, props[prop]);
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
export function $$_listen(target: EventTarget, type: string, handler: unknown, capture = false) {
  if (isFunction(handler)) listenEvent(target, type as any, handler as any, { capture });
}

const DELEGATED_EVENTS = /* #__PURE__ */ Symbol(__DEV__ ? 'DELEGATED_EVENTS' : 0);

export function $$_delegate_events(
  types: (keyof GlobalEventHandlersEventMap)[],
  document = window.document,
) {
  const events = (document[DELEGATED_EVENTS] ??= new Set());
  for (let i = 0, len = types.length; i < len; i++) {
    const type = types[i];
    if (!events.has(type)) {
      events.add(type);
      document.addEventListener(type, delegated_event_handler);
    }
  }
}

function delegated_event_handler(event: Event) {
  const eventKey = `$$${event.type}`,
    dataKey = `$$${event.type}Data`;

  let node = ((event.composedPath && event.composedPath()[0]) || event.target) as any;

  // Reverse Shadow DOM re-targetting.
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

export const $$_peek = peek;
export const $$_effect = effect;
export const $$_computed = computed;
