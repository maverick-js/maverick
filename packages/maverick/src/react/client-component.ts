import * as React from 'react';

import { Component, type ComponentConstructor, createComponent, tick } from '../core';
import { ON_DISPATCH } from '../core/symbols';
import { kebabToPascalCase } from '../std/string';
import { isFunction, isUndefined } from '../std/unit';
import { ReactScopeContext, WithScope } from './scope';
import type { ReactBridgeProps } from './types';
import { setRef } from './utils';

export interface CreateReactClientComponentOptions {
  props: Set<string>;
  events: Set<string>;
  eventsRE?: RegExp;
}

export function createClientComponent<T extends Component>(
  Component: ComponentConstructor<T>,
  options: CreateReactClientComponentOptions,
) {
  const forwardComponent = React.forwardRef<T, ReactBridgeProps<T>>((props, forwardRef) => {
    let scope = React.useContext(ReactScopeContext),
      state = React.useRef<{
        _component: T;
        _el: HTMLElement | null;
        _props: Set<string>;
        _attached: boolean;
        _refChangeId: number;
        _connectId: number;
      }>();

    if (!state.current) {
      const _component = createComponent<T>(Component, {
        props,
        scope,
      });

      _component.$$._setup();

      _component.$$[ON_DISPATCH] = function onDispatch(event: Event) {
        let callbackProp = `on${kebabToPascalCase(event.type)}`,
          args = !isUndefined((event as CustomEvent).detail)
            ? [(event as CustomEvent).detail, event]
            : [event];

        props[callbackProp]?.(...args);
      };

      state.current = {
        _el: null,
        _props: new Set(),
        _component,
        _attached: false,
        _refChangeId: -1,
        _connectId: -1,
      };
    }

    const onRefChange = React.useCallback((el: HTMLElement | null) => {
      const $state = state.current!;

      if (!$state._attached) {
        $state._el = el;
        return;
      }

      window.cancelAnimationFrame($state._refChangeId);
      $state._refChangeId = window.requestAnimationFrame(() => {
        $state._refChangeId = -1;

        if ($state._el === el) return;
        $state._el = el;

        const { _component } = $state;

        if (el) {
          _component.$$._attach(el);
          $state._connectId = window.requestAnimationFrame(() => {
            _component.$$._connect();
            $state._connectId = -1;
          });
        } else {
          window.cancelAnimationFrame($state._connectId);
          $state._connectId = -1;
          _component.$$._detach();
        }
      });
    }, []);

    const onAttach = React.useCallback(() => {
      const $state = state.current!,
        { _el, _component } = $state;

      if (_el) {
        _component.$$._attach(_el);
        $state._connectId = window.requestAnimationFrame(() => {
          _component.$$._connect();
          $state._connectId = -1;
        });
      }

      setRef(forwardRef, _component);
      $state._attached = true;

      return function onDetach() {
        const $state = state.current!;
        window.cancelAnimationFrame($state._connectId);
        $state._connectId = -1;
        $state._component.$$._detach();
        $state._attached = false;
      };
    }, []);

    React.useEffect(() => {
      return function onDestroy() {
        const { _el, _component, _refChangeId, _connectId } = state.current!;

        // Headless components will be destroyed by parent scope.
        if (_el || !isFunction(props.children)) return;

        window.cancelAnimationFrame(_refChangeId);
        window.cancelAnimationFrame(_connectId);

        _component.$$[ON_DISPATCH] = null;
        _component.$$._destroy();

        setRef(forwardRef, null);
      };
    }, []);

    React.useEffect(tick);

    let attrs = {},
      { _component, _props } = state.current,
      { children, ...__props } = props;

    if (options.props.size) {
      let $props = _component.$$._props,
        seen = new Set<string>();

      for (const prop of Object.keys(props)) {
        if (options.props.has(prop)) {
          $props[prop].set(__props[prop]);
          seen.add(prop);
          _props.delete(prop);
        } else if (!options.events?.has(prop) && !options.eventsRE?.test(prop)) {
          attrs[prop] = __props[prop];
        }
      }

      for (const prop of _props) {
        $props[prop].set(Component.props![prop]);
      }

      state.current!._props = seen;
    } else {
      attrs = __props;
    }

    return WithScope(
      _component.scope,
      React.createElement(AttachEffect, { effect: onAttach }),
      isFunction(children)
        ? children?.(
            {
              ...attrs,
              suppressHydrationWarning: true,
              ref: onRefChange,
            },
            _component,
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
