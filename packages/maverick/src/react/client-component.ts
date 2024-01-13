import * as React from 'react';

import { Component, type ComponentConstructor, createComponent, type Scope, tick } from '../core';
import { ON_DISPATCH } from '../core/symbols';
import { camelToKebabCase, kebabToPascalCase } from '../std/string';
import { isFunction, isUndefined } from '../std/unit';
import { ReactScopeContext, WithScope } from './scope';
import type { ReactBridgeProps } from './types';
import { setRef } from './utils';

export interface CreateReactClientComponentOptions {
  props: Set<string>;
  events: Set<string>;
  eventsRE?: RegExp;
  domEvents?: Set<string>;
  domEventsRE?: RegExp;
}

export function createClientComponent<T extends Component>(
  Component: ComponentConstructor<T>,
  options: CreateReactClientComponentOptions,
) {
  const forwardComponent = React.forwardRef<T, ReactBridgeProps<T>>((props, forwardRef) => {
    let parentScopeRef = React.useContext(ReactScopeContext),
      scopeRef = React.useRef<Scope | null>(null),
      stateRef = React.useRef<InternalState<T>>();

    if (!stateRef.current) {
      const state = createInternalState<T>(),
        component = initComponent(Component, state, props, parentScopeRef.current);

      state._component = component;

      stateRef.current = state;
      scopeRef.current = component.scope;
    }

    function onAttach() {
      let state = stateRef.current!,
        scope = parentScopeRef.current;

      window.cancelAnimationFrame(state._destroyId);
      state._destroyId = -1;

      if (state._component!.$$._destroyed) {
        const component = initComponent(Component, state, props, scope);
        state._component = component;
        state._attached = false;
        state._forwardedRef = false;
        scopeRef.current = component.scope;
      }

      if (state._el) {
        attachToHost(state, state._el);
      }

      if (!state._forwardedRef) {
        setRef(forwardRef, state._component);
        state._forwardedRef = true;
      }

      return () => detachFromHost(state);
    }

    function onRefChange(el: HTMLElement | null) {
      const state = stateRef.current!;

      if (!state._forwardedRef) {
        state._el = el;
        return;
      }

      window.cancelAnimationFrame(state._refChangeId);
      state._refChangeId = window.requestAnimationFrame(() => {
        const state = stateRef.current!;
        state._refChangeId = -1;

        if (state._el === el) return;

        detachFromHost(state);
        if (el) attachToHost(state, el);

        state._el = el;
      });
    }

    React.useEffect(() => {
      const state = stateRef.current!;

      window.cancelAnimationFrame(state._destroyId);
      state._destroyId = -1;

      return function onDestroy() {
        // Headless components will be destroyed by parent scope.
        if (!isFunction(props.children)) return;

        window.cancelAnimationFrame(state._refChangeId);
        state._refChangeId = -1;

        window.cancelAnimationFrame(state._connectId);
        state._connectId = -1;

        window.cancelAnimationFrame(state._destroyId);
        state._destroyId = window.requestAnimationFrame(() => {
          state._destroyId = -1;

          detachFromHost(state);

          state._component!.$$._destroy();
          state._component!.$$[ON_DISPATCH] = null;

          state._callbacks = {};
          state._domCallbacks = {};

          scopeRef.current = null;
        });
      };
    }, []);

    React.useEffect(tick);

    let state = stateRef.current,
      { children, ...__props } = props,
      attrs = {},
      prevPropNames = state._prevProps,
      newPropNames = Object.keys(__props);

    state._callbacks = {};

    for (const name of [...prevPropNames, ...newPropNames]) {
      if (options.props.has(name)) {
        state._component!.$props[name].set(
          // If the prop was removed we'll use the default value provided on Component creation.
          !newPropNames.includes(name) ? Component.props?.[name] : __props[name],
        );
      } else if (options.events?.has(name) || options.eventsRE?.test(name)) {
        state._callbacks[name] = __props[name];
      } else if (options.domEvents?.has(name) || options.domEventsRE?.test(name)) {
        let type = camelToKebabCase(name.slice(2));
        state._domCallbacks[type] = __props[name];
        if (!newPropNames.includes(name)) {
          state._el?.removeEventListener(type, state._onDOMEvent);
          state._listening?.delete(type);
        } else if (state._el && !state._listening?.has(type)) {
          if (!state._listening) state._listening = new Set();
          state._listening.add(type);
          state._el.addEventListener(type, state._onDOMEvent);
        }
      } else {
        attrs[name] = __props[name];
      }
    }

    state._prevProps = newPropNames;

    return WithScope(
      scopeRef,
      React.createElement(AttachEffect, {
        effect: onAttach,
      }),
      isFunction(children)
        ? children?.(
            {
              ...attrs,
              suppressHydrationWarning: true,
              ref: onRefChange,
            },
            state._component,
          )
        : children,
    );
  });

  forwardComponent.displayName = Component.name + 'Bridge';
  return forwardComponent;
}

// Run effects in top-down order.
function AttachEffect({ effect }) {
  React.useEffect(effect, []);
  return null;
}

export interface InternalState<T> {
  _prevProps: string[];
  _el: HTMLElement | null;
  _component: T;
  _attached: boolean;
  _connectId: number;
  _refChangeId: number;
  _destroyId: number;
  _callbacks: Record<string, (...args: any[]) => void>;
  _domCallbacks: Record<string, (...args: any[]) => void>;
  _listening: Set<string> | null;
  _forwardedRef: boolean;
  _onDOMEvent(event: Event): void;
}

const eventTypeToCallbackName = new Map<string, string>();

function createInternalState<T extends Component>(): InternalState<T> {
  const state: Omit<InternalState<T>, '_component'> = {
    _el: null,
    _prevProps: [],
    _callbacks: {},
    _domCallbacks: {},
    _refChangeId: -1,
    _connectId: -1,
    _destroyId: -1,
    _attached: false,
    _forwardedRef: false,
    _listening: null,
    _onDOMEvent(event) {
      const args = !isUndefined((event as CustomEvent).detail)
        ? [(event as CustomEvent).detail, event]
        : [event];

      state._domCallbacks[event.type]?.(...args);
    },
  };

  return state as InternalState<T>;
}

function attachToHost<T extends Component>(state: InternalState<T>, el: HTMLElement) {
  if (state._el === el && state._attached) return;
  else if (state._attached) detachFromHost(state);

  if (state._domCallbacks) {
    if (!state._listening) state._listening = new Set();
    for (const type of Object.keys(state._domCallbacks)) {
      if (state._listening.has(type)) continue;
      el.addEventListener(type, state._onDOMEvent);
      state._listening.add(type);
    }
  }

  state._component.$$._attach(el);

  state._connectId = window.requestAnimationFrame(() => {
    state._component.$$._connect();
    state._connectId = -1;
  });

  state._attached = true;
}

function detachFromHost<T extends Component>(state: InternalState<T>) {
  if (!state._attached) return;

  window.cancelAnimationFrame(state._connectId);

  state._connectId = -1;
  state._component.$$._detach();
  state._attached = false;

  if (state._el && state._listening) {
    for (const type of state._listening) {
      state._el.removeEventListener(type, state._onDOMEvent);
    }

    state._listening.clear();
  }
}

function onDispatch<T extends Component>(this: InternalState<T>, event: Event) {
  let callbackProp = eventTypeToCallbackName.get(event.type),
    args = !isUndefined((event as CustomEvent).detail)
      ? [(event as CustomEvent).detail, event]
      : [event];

  if (!callbackProp) {
    eventTypeToCallbackName.set(event.type, (callbackProp = `on${kebabToPascalCase(event.type)}`));
  }

  this._callbacks[callbackProp]?.(...args);
}

function initComponent<T extends Component>(
  Component: ComponentConstructor<T>,
  state: InternalState<T>,
  props: ReactBridgeProps<T>,
  scope: Scope | null,
): T {
  const component = createComponent(Component, { props, scope });
  component.$$[ON_DISPATCH] = onDispatch.bind(state);
  component.$$._setup();
  return component;
}
