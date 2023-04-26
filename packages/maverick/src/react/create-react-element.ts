import { tick } from '@maverick-js/signals';
import * as React from 'react';

import { type AnyComponent, type ComponentConstructor } from '../element/component';
import type { HTMLCustomElement } from '../element/host';
import { createComponent } from '../element/instance';
import {
  type CustomElementRegistrar,
  registerCustomElement,
  registerLiteCustomElement,
} from '../element/register';
import { $$_attach_declarative_shadow_dom } from '../runtime/dom';
import { kebabToPascalCase } from '../std/string';
import { createReactServerElement } from './create-react-server-element';
import { ReactComputeScopeContext, WithScope } from './scope';
import type { ReactElement, ReactElementProps } from './types';
import { setRef } from './utils';

export interface ReactElementInit {
  displayName?: string;
}

export function createReactElement<Component extends AnyComponent>(
  Component: ComponentConstructor<Component>,
  init?: ReactElementInit,
): ReactElement<Component> {
  return __SERVER__
    ? createReactServerElement(Component)
    : createReactClientElement(registerCustomElement, Component, init);
}

export function createLiteReactElement<Component extends AnyComponent>(
  Component: ComponentConstructor<Component>,
  init?: ReactElementInit,
): ReactElement<Component> {
  return __SERVER__
    ? createReactServerElement(Component)
    : createReactClientElement(registerLiteCustomElement, Component, init);
}

function createReactClientElement<Component extends AnyComponent>(
  registerCustomElement: CustomElementRegistrar,
  Component: ComponentConstructor<Component>,
  init?: ReactElementInit,
): ReactElement<Component> {
  registerCustomElement(Component);

  class CustomElement extends ReactCustomElement<Component> {
    static displayName = init?.displayName ?? kebabToPascalCase(Component.el.tagName);
    static override contextType = ReactComputeScopeContext;
    static override _component = Component;
    static override _props = new Set(Object.keys(Component.el.props ?? {}));
  }

  const ForwardedComponent = React.forwardRef<any, any>((props, ref) =>
    React.createElement(CustomElement, { ...props, __forwardedRef: ref }, props?.children),
  );

  ForwardedComponent.displayName = 'ForwardRef_' + CustomElement.displayName;

  return ForwardedComponent as any;
}

class ReactCustomElement<Component extends AnyComponent> extends React.Component<
  ReactElementProps<Component>
> {
  declare context: React.ContextType<typeof ReactComputeScopeContext>;

  static _component: ComponentConstructor;
  static _props: Set<string>;
  static _callbacks = new Map<string, string>();

  private _component!: AnyComponent;
  private _listeners!: Map<string, EventListenerObject>;
  private _element: HTMLCustomElement | null = null;
  private _ref?: React.RefCallback<HTMLCustomElement>;
  private _forwardedRef?: React.Ref<HTMLCustomElement>;

  override componentDidMount() {
    // Check if element instance has already been attached (might occur on remounting tree with
    // preserved state).
    if (!this._element || this._element.component) return;

    $$_attach_declarative_shadow_dom(this._element);

    this._element.onEventDispatch((eventType) => {
      const callbackName = `on${kebabToPascalCase(eventType)}`;
      const callback = this.props[callbackName];
      const ctor = this.constructor as typeof ReactCustomElement;
      ctor._callbacks.set(callbackName, eventType);
      if (callback) this._updateEventListener(eventType, callback);
    });

    this._element.attachComponent(this._component);
  }

  override componentWillUnmount() {
    // Wait a tick to ensure this element is definitely being destroyed.
    // https://reactjs.org/blog/2022/03/29/react-v18.html#new-strict-mode-behaviors
    window.requestAnimationFrame(() => {
      if (!this._element) this._component.destroy();
    });
  }

  override render() {
    const ctor = this.constructor as typeof ReactCustomElement;
    const { __forwardedRef, className, children, ...restProps } = this.props;

    if (!this._component) {
      this._listeners = new Map();
      this._component = createComponent(ctor._component, {
        props: this.props,
        scope: this.context,
      });
    }

    if (!this._ref || this._forwardedRef !== __forwardedRef) {
      this._ref = (value) => {
        this._element = value;
        if (__forwardedRef) setRef(__forwardedRef, value);
        this._forwardedRef = __forwardedRef;
      };
    }

    const props = { class: className, ref: this._ref };
    const $props = this._component.instance._props;

    for (const prop of Object.keys(restProps)) {
      const value = restProps[prop];
      if (ctor._callbacks.has(prop)) {
        this._updateEventListener(ctor._callbacks.get(prop)!, value);
      } else if (ctor._props.has(prop)) {
        $props[prop].set(value);
      } else {
        props[prop] = value;
      }
    }

    tick();

    return WithScope(
      this._component.instance._scope,
      React.createElement(
        ctor._component.el.tagName,
        { ...props, 'mk-d': true, suppressHydrationWarning: true },
        React.createElement(ShadowRoot, {
          shadow: ctor._component.el.shadowRoot,
        }),
        children,
      ),
    );
  }

  private _updateEventListener(eventType: string, listener?: (event?: Event) => void) {
    let handler = this._listeners.get(eventType);

    if (!this._element || handler?.handleEvent === listener) return;

    if (listener) {
      if (!handler) {
        this._listeners.set(eventType, (handler = { handleEvent: listener }));
        this._element.addEventListener(eventType, handler);
      } else {
        handler.handleEvent = listener;
      }
    } else if (handler) {
      this._listeners.delete(eventType);
      this._element.removeEventListener(eventType, handler);
    }
  }
}

function ShadowRoot(props) {
  return React.createElement(props.shadow ? 'template' : 'shadow-root', {
    dangerouslySetInnerHTML: { __html: '' },
    suppressHydrationWarning: true,
  });
}
