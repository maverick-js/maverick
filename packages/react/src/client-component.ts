import * as React from 'react';

import {
  Component,
  type ComponentConstructor,
  createComponent,
  type Scope,
  tick,
} from '../../maverick/src/core';
import { ON_DISPATCH } from '../../maverick/src/core/symbols';
import { camelToKebabCase, kebabToPascalCase } from '../../std/src/string';
import { isFunction, isUndefined } from '../../std/src/unit';
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

      state.component = component;

      stateRef.current = state;
      scopeRef.current = component.scope;
    }

    function onAttach() {
      let state = stateRef.current!,
        scope = parentScopeRef.current;

      window.cancelAnimationFrame(state.destroyId);
      state.destroyId = -1;

      if (state.component!.$$.destroyed) {
        const component = initComponent(Component, state, props, scope);
        state.component = component;
        state.attached = false;
        state.forwardRef = false;
        scopeRef.current = component.scope;
      }

      if (state.el) {
        attachToHost(state, state.el);
      }

      if (!state.forwardRef) {
        setRef(forwardRef, state.component);
        state.forwardRef = true;
      }

      return () => detachFromHost(state);
    }

    function onRefChange(el: HTMLElement | null) {
      const state = stateRef.current!;

      if (!state.forwardRef) {
        state.el = el;
        return;
      }

      window.cancelAnimationFrame(state.refChangeId);
      state.refChangeId = window.requestAnimationFrame(() => {
        const state = stateRef.current!;
        state.refChangeId = -1;

        if (state.el === el) return;

        detachFromHost(state);
        if (el) attachToHost(state, el);

        state.el = el;
      });
    }

    React.useEffect(() => {
      const state = stateRef.current!;

      window.cancelAnimationFrame(state.destroyId);
      state.destroyId = -1;

      return function onDestroy() {
        // Headless components will be destroyed by parent scope.
        if (!isFunction(props.children)) return;

        window.cancelAnimationFrame(state.refChangeId);
        state.refChangeId = -1;

        window.cancelAnimationFrame(state.connectId);
        state.connectId = -1;

        window.cancelAnimationFrame(state.destroyId);
        state.destroyId = window.requestAnimationFrame(() => {
          state.destroyId = -1;

          detachFromHost(state);

          state.component!.$$.destroy();
          state.component!.$$[ON_DISPATCH] = null;

          state.callbacks = {};
          state.domCallbacks = {};

          scopeRef.current = null;
        });
      };
    }, []);

    React.useEffect(tick);

    let state = stateRef.current,
      { children, ...renderProps } = props,
      attrs = {},
      prevPropNames = state.prevProps,
      newPropNames = Object.keys(renderProps);

    state.callbacks = {};

    for (const name of [...prevPropNames, ...newPropNames]) {
      if (options.props.has(name)) {
        state.component!.$props[name].set(
          // If the prop was removed we'll use the default value provided on Component creation.
          isUndefined(renderProps[name]) ? Component.props?.[name] : renderProps[name],
        );
      } else if (options.events?.has(name) || options.eventsRE?.test(name)) {
        state.callbacks[name] = renderProps[name];
      } else if (options.domEvents?.has(name) || options.domEventsRE?.test(name)) {
        let type = camelToKebabCase(name.slice(2));
        state.domCallbacks[type] = renderProps[name];
        if (!newPropNames.includes(name)) {
          state.el?.removeEventListener(type, state.onDOMEvent);
          state.listening?.delete(type);
        } else if (state.el && !state.listening?.has(type)) {
          if (!state.listening) state.listening = new Set();
          state.listening.add(type);
          state.el.addEventListener(type, state.onDOMEvent);
        }
      } else {
        attrs[name] = renderProps[name];
      }
    }

    state.prevProps = newPropNames;

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
            state.component,
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
  prevProps: string[];
  el: HTMLElement | null;
  component: T;
  attached: boolean;
  connectId: number;
  refChangeId: number;
  destroyId: number;
  callbacks: Record<string, (...args: any[]) => void>;
  domCallbacks: Record<string, (...args: any[]) => void>;
  listening: Set<string> | null;
  forwardRef: boolean;
  onDOMEvent(event: Event): void;
}

const eventTypeToCallbackName = new Map<string, string>();

function createInternalState<T extends Component>(): InternalState<T> {
  const state: Omit<InternalState<T>, 'component'> = {
    el: null,
    prevProps: [],
    callbacks: {},
    domCallbacks: {},
    refChangeId: -1,
    connectId: -1,
    destroyId: -1,
    attached: false,
    forwardRef: false,
    listening: null,
    onDOMEvent(event) {
      const args = !isUndefined((event as CustomEvent).detail)
        ? [(event as CustomEvent).detail, event]
        : [event];

      state.domCallbacks[event.type]?.(...args);
    },
  };

  return state as InternalState<T>;
}

function attachToHost<T extends Component>(state: InternalState<T>, el: HTMLElement) {
  if (state.el === el && state.attached) return;
  else if (state.attached) detachFromHost(state);

  if (state.domCallbacks) {
    if (!state.listening) state.listening = new Set();
    for (const type of Object.keys(state.domCallbacks)) {
      if (state.listening.has(type)) continue;
      el.addEventListener(type, state.onDOMEvent);
      state.listening.add(type);
    }
  }

  state.component.$$.attach(el);

  state.connectId = window.requestAnimationFrame(() => {
    state.component.$$.connect();
    state.connectId = -1;
  });

  state.attached = true;
}

function detachFromHost<T extends Component>(state: InternalState<T>) {
  if (!state.attached) return;

  window.cancelAnimationFrame(state.connectId);

  state.connectId = -1;
  state.component.$$.detach();
  state.attached = false;

  if (state.el && state.listening) {
    for (const type of state.listening) {
      state.el.removeEventListener(type, state.onDOMEvent);
    }

    state.listening.clear();
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

  this.callbacks[callbackProp]?.(...args);
}

function initComponent<T extends Component>(
  Component: ComponentConstructor<T>,
  state: InternalState<T>,
  props: ReactBridgeProps<T>,
  scope: Scope | null,
): T {
  const component = createComponent(Component, { props, scope });
  component.$$[ON_DISPATCH] = onDispatch.bind(state);
  component.$$.setup();
  return component;
}
