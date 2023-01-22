import { SCOPE, tick } from '@maverick-js/signals';
import * as React from 'react';

import { createElementInstance } from '../element/instance';
import { PROPS } from '../element/internal';
import {
  CustomElementRegistrar,
  registerCustomElement,
  registerLiteCustomElement,
} from '../element/register';
import type {
  AnyCustomElement,
  CustomElementDefinition,
  CustomElementInstance,
  HTMLCustomElement,
  InferCustomElement,
} from '../element/types';
import { $$_attach_declarative_shadow_dom } from '../runtime/dom';
import { kebabToPascalCase } from '../std/string';
import { createReactServerElement } from './create-react-server-element';
import type { ReactElement, ReactElementProps } from './types';
import { ComputeScopeContext, ReactComputeScope, WithComputeScope } from './use-compute-scope';
import { setRef } from './utils';

export interface ReactElementInit {
  displayName?: string;
}

export function createReactElement<Definition extends CustomElementDefinition>(
  definition: Definition,
  init?: ReactElementInit,
): ReactElement<InferCustomElement<Definition>> {
  return __SERVER__
    ? createReactServerElement(definition)
    : createReactClientElement(registerCustomElement, definition, init);
}

export function createLiteReactElement<Definition extends CustomElementDefinition>(
  definition: Definition,
  init?: ReactElementInit,
): ReactElement<InferCustomElement<Definition>> {
  return __SERVER__
    ? createReactServerElement(definition)
    : createReactClientElement(registerLiteCustomElement, definition, init);
}

function createReactClientElement<
  T extends CustomElementDefinition,
  R extends AnyCustomElement = InferCustomElement<T>,
>(
  registerCustomElement: CustomElementRegistrar,
  definition: T,
  init?: ReactElementInit,
): ReactElement<R> {
  registerCustomElement(definition);

  class CustomElement extends ReactCustomElement<R> {
    static displayName = init?.displayName ?? definition.tagName;
    static override contextType = ComputeScopeContext;
    static override _definition = definition;
    static override _props = new Set(Object.keys(definition.props ?? {}));
  }

  const ForwardedComponent = React.forwardRef<any, any>((props, ref) =>
    React.createElement(CustomElement, { ...props, __forwardedRef: ref }, props?.children),
  );

  ForwardedComponent.displayName = CustomElement.displayName;

  return ForwardedComponent as any;
}

class ReactCustomElement<T extends AnyCustomElement> extends React.Component<ReactElementProps<T>> {
  declare context: React.ContextType<typeof ComputeScopeContext>;

  static _definition: CustomElementDefinition;
  static _props: Set<string>;
  static _callbacks = new Map<string, string>();

  private _scope: ReactComputeScope;
  private _instance: CustomElementInstance;
  private _element: HTMLCustomElement | null = null;
  private _ref?: React.RefCallback<HTMLCustomElement>;
  private _forwardedRef?: React.Ref<HTMLCustomElement>;
  private _listeners = new Map<string, EventListenerObject>();

  constructor(props, context) {
    super(props);

    const ctor = this.constructor as typeof ReactCustomElement;

    this._instance = createElementInstance(ctor._definition, {
      props,
      scope: context?.current,
    });

    this._scope = {
      current: this._instance[SCOPE],
      setups: context?.setups || [],
    };
  }

  override componentDidMount() {
    // Check if element instance has already been attached (might occur on remounting tree with
    // preserved state).
    if (!this._element || this._element.instance) return;

    $$_attach_declarative_shadow_dom(this._element);

    this._element!.onEventDispatch((eventType) => {
      const callbackName = `on${kebabToPascalCase(eventType)}`;
      const callback = this.props[callbackName];
      const ctor = this.constructor as typeof ReactCustomElement;
      ctor._callbacks.set(callbackName, eventType);
      if (callback) this._updateEventListener(eventType, callback);
    });

    // We need this because `componentDidMount` is called in virtual creation order and not
    // when it's attached to the DOM (i.e, children come before parent). We want to run setup in
    // DOM order.
    const setups = this._scope.setups!;
    setups.push(() => this._element!.attachComponent(this._instance));
    // Root scope won't have scope context set.
    if (!this.context) while (setups.length) setups.pop()!();
  }

  override componentWillUnmount() {
    // Wait a tick to ensure this element is definitely being destroyed.
    // https://reactjs.org/blog/2022/03/29/react-v18.html#new-strict-mode-behaviors
    window.requestAnimationFrame(() => {
      if (!this._element) this._instance.destroy();
    });
  }

  override render() {
    const { __forwardedRef, className, children, ...restProps } = this.props;

    if (!this._ref || this._forwardedRef !== __forwardedRef) {
      this._ref = (value) => {
        this._element = value;
        if (__forwardedRef) setRef(__forwardedRef, value);
        this._forwardedRef = __forwardedRef;
      };
    }

    const props = { class: className, ref: this._ref };
    const $props = this._instance[PROPS];
    const ctor = this.constructor as typeof ReactCustomElement;

    for (const prop of Object.keys(restProps)) {
      const value = restProps[prop];
      if (ctor._callbacks.has(prop)) {
        this._updateEventListener(ctor._callbacks.get(prop)!, value);
      } else if (ctor._props.has(prop)) {
        $props['$' + prop].set(value);
      } else {
        props[prop] = value;
      }
    }

    tick();

    return WithComputeScope(
      this._scope,
      React.createElement(
        ctor._definition.tagName,
        { ...props, 'mk-d': true, suppressHydrationWarning: true },
        React.createElement(ShadowRoot, {
          shadow: ctor._definition.shadowRoot,
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
