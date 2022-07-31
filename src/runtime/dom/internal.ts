import { $effect, $peek } from '@maverick-js/observables';
import { isArray, isFunction } from '../../utils/unit';
import type { JSX } from '../jsx';
import {
  createMarkerWalker,
  insertNodeAtMarker,
  type MarkerWalker,
  type StartMarker,
} from './markers';
import { hydration } from './render';
import { insert, listen, setAttribute, setStyle, toggleClass } from './utils';

/** @internal */
export function $$_create_template(html: string) {
  const template = document.createElement('template');
  template.innerHTML = html;
  return template.content;
}

/** @internal */
export function $$_clone(fragment: DocumentFragment, type = 0) {
  const clone = fragment.cloneNode(true) as DocumentFragment;
  // type = 0 (FRAGMENT), type = 1 (ELEMENT)
  return !type ? clone : clone.firstElementChild;
}

/** @internal */
export function $$_create_markers_walker(root: Node) {
  return hydration?.m ?? createMarkerWalker(root);
}

export function $$_next_element(walker: MarkerWalker) {
  return walker.nextNode()!.nextSibling;
}

export function $$_insert(parent: Element, value: JSX.Element, before?: Element) {
  insert(parent, value, before);
}

/** @internal */
export function $$_insert_at_marker(marker: StartMarker, value: JSX.Element) {
  insertNodeAtMarker(marker, value);
}

/** @internal */
export function $$_create_component<T = any>(
  component: (props?: T) => Node | null | undefined,
  props?: T,
) {
  return $peek(() => component(props));
}

/** @internal */
export function $$_ref(element: Element, ref: JSX.Ref) {
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
  observe_or_run(value, (value) => setAttribute(element, name, value));
}

/** @internal */
export function $$_prop(element: Element, name: string, value: unknown) {
  observe_or_run(value, (value) => {
    element[name] = value;
  });
}

/** @internal */
export function $$_inner_html(element: Element, value: unknown) {
  observe_or_run(value, (value) => {
    if (!hydration) element.innerHTML = value as string;
  });
}

/** @internal */
export function $$_class(element: Element, name: string, value: unknown) {
  observe_or_run(value, (value) => toggleClass(element, name, value));
}

/** @internal */
export function $$_style(element: HTMLElement, name: string, value: unknown) {
  observe_or_run(value, (value) => setStyle(element, name, value));
}

/** @internal */
export function $$_cssvar(element: HTMLElement, name: string, value: unknown) {
  const prop = `--${name}`;
  observe_or_run(value, (value) => setStyle(element, prop, value));
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
    listen(target, type, handler as JSX.EventHandler, { capture });
  }
}

function observe_or_run<T>(value: T, callback: (value: T) => void) {
  if (isFunction(value)) {
    $effect(() => callback(value()));
  } else {
    callback(value);
  }
}
