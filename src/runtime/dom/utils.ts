import { effect } from '@maverick-js/observables';
import type { MaverickHost } from '../../element/types';
import { isFunction } from '../../utils/unit';
import type { JSX } from '../jsx';
import { onDispose } from '../reactivity';
import { insertExpression } from './expression';

export function isDOMNode(node: any): node is Node {
  return node instanceof Node;
}

export function isDOMElement(node: any): node is Element {
  return isDOMNode(node) && node.nodeType === 1;
}

export function isDOMFragment(node: any): node is DocumentFragment {
  return isDOMNode(node) && node.nodeType === 11;
}

export function createFragment() {
  return document.createDocumentFragment();
}

export function createComment(data: string) {
  return document.createComment(data);
}

export function insert(
  parent: Node | DocumentFragment,
  value: JSX.Element,
  before: Node | null = null,
) {
  const marker = createComment('$$');
  if (before === null) parent.appendChild(marker);
  else parent.insertBefore(marker, before);
  insertExpression(marker, value);
}

/**
 * Adds an event listener for the given `type`.
 *
 * This function is safe to use on the server.
 */
export function listen<Target extends EventTarget | MaverickHost, EventType extends string>(
  target: Target,
  type: EventType,
  handler: EventType extends keyof JSX.GlobalEventRecord
    ? JSX.EventHandler<
        JSX.TargetedEvent<
          Target extends MaverickHost ? Target['$el'] & EventTarget : Target,
          JSX.GlobalEventRecord[EventType]
        >
      >
    : JSX.EventHandler,
  options?: AddEventListenerOptions | boolean,
) {
  if (__SERVER__) return;
  target.addEventListener(type, handler, options);
  onDispose(() => {
    target.removeEventListener(type, handler, options);
  });
}

/**
 * Sets or removes the given attribute `value`. Falsy values except `''` and `0` will remove
 * the attribute. If the given `value` is a function/observable, the attribute will be updated as
 * the value updates.
 *
 * This function is safe to use on the server.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Glossary/Falsy}
 */
export function setAttribute(host: Element | MaverickHost, name: string, value: unknown) {
  observe(value, ($value) => {
    if (!$value && $value !== '' && $value !== 0) {
      host.removeAttribute(name);
    } else {
      const attrValue = $value + '';
      if (host.getAttribute(name) !== attrValue) {
        host.setAttribute(name, attrValue);
      }
    }
  });
}

/**
 * Sets or removes the given style `value`. Falsy values will remove the style. If the
 * given `value` is a function/observable, the style will be updated as the value updates.
 *
 * This function is safe to use on the server.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Glossary/Falsy}
 */
export function setStyle(host: HTMLElement | MaverickHost, property: string, value: unknown) {
  observe(value, ($value) => {
    if (!$value && $value !== 0) {
      host.style.removeProperty(property);
    } else {
      host.style.setProperty(property, $value + '');
    }
  });
}

/**
 * Toggles the given class `name`. Falsy values will remove the class from the list. If the
 * given `value` is a function/observable, the class will be toggled as the value updates.
 *
 * This function is safe to use on the server.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Glossary/Falsy}
 */
export function toggleClass(host: Element | MaverickHost, name: string, value: unknown) {
  observe(value, ($value) => {
    host.classList[$value ? 'add' : 'remove'](name);
  });
}

/**
 * Observes the given `value`. This utility is useful when a side effect needs to run on both
 * the client and server.
 *
 *- If the given `value` is a function/observable it will be run in an effect and observed. The
 * observed value will be passed to the given `callback`.
 *- If the given `value` is _not_ a function/observable, it'll simply be passed to the given
 * `callback`.
 * - In a server environment the given `value` will be unwrapped if needed but no effect will be
 * created.
 */
export function observe<T>(value: T, onUpdate: (value: T) => void) {
  if (__SERVER__) {
    onUpdate(isFunction(value) ? value() : value);
    return;
  }

  if (isFunction(value)) {
    effect(() => onUpdate(value()));
  } else {
    onUpdate(value);
  }
}

export function mergeProperties<A, B>(...sources: [A, B]): Omit<A, keyof B> & B;

export function mergeProperties<A, B, C>(
  ...sources: [A, B, C]
): Omit<A, keyof B | keyof C> & Omit<B, keyof C> & C;

export function mergeProperties<A, B, C, D>(
  ...sources: [A, B, C, D]
): Omit<A, keyof B | keyof C | keyof D> & Omit<B, keyof C | keyof D> & Omit<C, keyof D> & D;

export function mergeProperties<A, B, C, D, E>(
  ...sources: [A, B, C, D, E]
): Omit<A, keyof B | keyof C | keyof D | keyof E> &
  Omit<B, keyof C | keyof D | keyof E> &
  Omit<C, keyof D | keyof E> &
  Omit<D, keyof E> &
  E;

/**
 * Merges properties of the given `sources` together into a single object. All enumerable properties
 * are merged including values, getters, setters, and methods.
 */
export function mergeProperties(...sources: any[]) {
  const target = {} as any;

  for (let i = 0; i < sources.length; i++) {
    const source = sources[i];
    if (source) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    }
  }

  return target;
}
