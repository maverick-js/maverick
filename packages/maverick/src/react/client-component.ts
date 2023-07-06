import * as React from 'react';

import { Component, type ComponentConstructor, createComponent, tick } from '../core';
import { ON_DISPATCH } from '../core/symbols';
import { kebabToPascalCase } from '../std/string';
import { isUndefined } from '../std/unit';
import { ReactScopeContext, WithScope } from './scope';
import type { InternalReactProps } from './types';
import { setRef } from './utils';

export function createClientComponent<T extends Component>(
  Component: ComponentConstructor<T>,
  componentProps: Set<string>,
  componentEvents: Set<string>,
  componentEventsRE?: RegExp,
) {
  const forwardComponent = React.forwardRef<T, InternalReactProps<T>>((props, forwardRef) => {
    let scope = React.useContext(ReactScopeContext),
      elRef = React.useRef<HTMLElement | null>(),
      componentRef = React.useRef<T>(),
      attachedRef = React.useRef(false),
      classNameRef = React.useRef<string>(),
      propsRef = React.useRef<Set<string>>(),
      connectRafIdRef = React.useRef(-1);

    if (componentRef.current == null) {
      propsRef.current = new Set();

      componentRef.current = createComponent<T>(Component, {
        props,
        scope,
      });

      componentRef.current.$$._setup();

      componentRef.current.$$[ON_DISPATCH] = function onDispatch(event: Event) {
        let callbackProp = `on${kebabToPascalCase(event.type)}`,
          args = !isUndefined((event as CustomEvent).detail)
            ? [(event as CustomEvent).detail, event]
            : [event];

        props[callbackProp]?.(...args);
      };
    }

    const onRefChange = React.useCallback((el: HTMLElement | null) => {
      elRef.current = el;

      if (!attachedRef.current) return;

      if (el) {
        componentRef.current?.$$._attach(el);
        onConnect(connectRafIdRef, componentRef);
        updateBaseClassName(elRef, classNameRef, props.className);
      } else {
        componentRef.current?.$$._detach();
      }
    }, []);

    const onAttach = React.useCallback(() => {
      if (elRef.current) {
        componentRef.current?.$$._attach(elRef.current);
        onConnect(connectRafIdRef, componentRef);
        updateBaseClassName(elRef, classNameRef, props.className);
      }

      setRef(forwardRef, componentRef.current);
      attachedRef.current = true;

      return function onDetach() {
        componentRef.current?.$$._detach();
        attachedRef.current = false;
      };
    }, []);

    React.useEffect(() => {
      return function onDestroy() {
        if (elRef.current) return;
        window.cancelAnimationFrame(connectRafIdRef.current);
        componentRef.current!.$$[ON_DISPATCH] = null;
        componentRef.current!.$$._destroy();
        setRef(forwardRef, null);
      };
    }, []);

    React.useEffect(tick);

    let attrs = {},
      { className, children, ...__props } = props;

    className = (
      className
        ? className + (classNameRef.current ? ' ' + classNameRef.current : '')
        : classNameRef.current
    ) as any;

    if (componentProps.size) {
      let $props = componentRef.current.$$._props,
        seen = new Set<string>();

      for (const prop of Object.keys(props)) {
        if (componentProps.has(prop)) {
          $props[prop].set(__props[prop]);
          seen.add(prop);
          propsRef.current!.delete(prop);
        } else if (!componentEvents?.has(prop) && !componentEventsRE?.test(prop)) {
          attrs[prop] = __props[prop];
        }
      }

      for (const prop of propsRef.current!) {
        $props[prop].set(Component.props![prop]);
      }

      propsRef.current = seen;
    } else {
      attrs = __props;
    }

    return WithScope(
      componentRef.current.scope,
      React.createElement(AttachEffect, { effect: onAttach }),
      children?.(
        {
          ...attrs,
          className,
          suppressHydrationWarning: true,
          ref: onRefChange,
        },
        componentRef.current,
      ),
    );
  });

  forwardComponent.displayName = Component.name + 'Bridge';
  return forwardComponent;
}

function onConnect(
  rafIdRef: React.MutableRefObject<number>,
  componentRef: React.RefObject<Component | undefined>,
) {
  rafIdRef.current = window.requestAnimationFrame(() => {
    componentRef.current?.$$._connect();
  });
}

function updateBaseClassName(
  elRef: React.RefObject<HTMLElement | null | undefined>,
  classNameRef: React.MutableRefObject<string | undefined>,
  className: string = '',
) {
  const base = elRef.current?.classList.length ? elRef.current.classList + '' : void 0;
  classNameRef.current = base?.replace(className, '').trim();
}

// Run effects in top-down order.
function AttachEffect({ effect }) {
  React.useEffect(effect, []);
  return null;
}
