import { getScheduler, observable } from '@maverick-js/observables';
import * as React from 'react';

import { defineCustomElement } from '../element/create-html-element';
import type { AnyElementDefinition, MaverickElement } from '../element/types';
import { ContextMap } from '../runtime';
import { $$_attach_declarative_shadow_dom } from '../runtime/dom';
import { kebabToPascalCase } from '../utils/str';
import { createReactServerElement } from './create-react-server-element';
import { ReactElementContextMap } from './react-element-context';
import type { ReactElement, ReactElementProps } from './types';
import { setRef, WithContextMap } from './utils';

export type ReactElementInit = {
  displayName?: string;
};

export function createReactElement<Definition extends AnyElementDefinition>(
  definition: Definition,
  init?: ReactElementInit,
): ReactElement<Definition> {
  return __SERVER__
    ? createReactServerElement(definition)
    : createReactClientElement(definition, init);
}

const scheduler = getScheduler(),
  SETUP = Symbol();

function createReactClientElement<Definition extends AnyElementDefinition>(
  definition: Definition,
  init?: ReactElementInit,
): ReactElement<Definition> {
  defineCustomElement(definition);

  const definedProps = new Set(Object.keys(definition.props ?? {})),
    eventCallbacks = new Map<string, string>();

  class CustomElement extends React.Component<ReactElementProps<Definition>> {
    static displayName = init?.displayName ?? definition.tagName;
    static override contextType = ReactElementContextMap;
    declare context: React.ContextType<typeof ReactElementContextMap>;

    private _element: MaverickElement | null = null;
    private _context!: ContextMap;
    private _children = observable(false);
    private _ref?: React.RefCallback<MaverickElement>;
    private _forwardedRef?: React.Ref<MaverickElement>;
    private _listeners = new Map<string, EventListenerObject>();

    override componentDidMount() {
      if (!this._element) return;

      $$_attach_declarative_shadow_dom(this._element);

      const setup = () =>
        this._element!.$setup({
          props: this.props,
          context: this._context,
          children: this._children,
          onEventDispatch: (eventType) => {
            const callbackName = `on${kebabToPascalCase(eventType)}`;
            const callback = this.props[callbackName];
            eventCallbacks.set(callbackName, eventType);
            if (callback) this._updateEventListener(eventType, callback);
          },
        });

      // We need this because `componentDidMount` is called in virtual creation order and not
      // when it's attached to the DOM (i.e, children come before parent). We want to run setup in
      // DOM order.
      if (!this._context.has(SETUP)) this._context.set(SETUP, []);

      const setups = this._context.get(SETUP);
      setups.push(setup);

      // Root element won't have context set.
      if (!this.context) {
        while (setups.length) setups.pop()();
        scheduler.flushSync();
      }
    }

    override componentWillUnmount() {
      this._element?.$destroy();
    }

    override render() {
      const forwardedRef = this.props.__forwardedRef ?? null;
      if (!this._ref || this._forwardedRef !== forwardedRef) {
        this._ref = (value) => {
          this._element = value;
          if (forwardedRef) setRef(forwardedRef, value);
          this._forwardedRef = forwardedRef;
        };
      }

      const { __forwardedRef, className, children, ...restProps } = this.props;
      const props = { class: className, ref: this._ref };

      for (const prop of Object.keys(restProps)) {
        const value = restProps[prop];
        if (eventCallbacks.has(prop)) {
          this._updateEventListener(eventCallbacks.get(prop)!, value);
        } else if (definedProps.has(prop)) {
          this._element?.$$props[prop].set(value);
        } else {
          props[prop] = value;
        }
      }

      if (!this._context) this._context = this.context ?? new Map();
      this._children.set(!!children);
      scheduler.flushSync();

      return WithContextMap(
        this._context,
        this.context,
        React.createElement(
          definition.tagName,
          { ...props, 'mk-delegate': true, suppressHydrationWarning: true },
          React.createElement(ShadowRoot, {
            shadow: definition.shadowRoot,
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

  const ForwardedComponent = React.forwardRef<any, any>((props, ref) =>
    React.createElement(CustomElement, { ...props, __forwardedRef: ref }, props?.children),
  );

  ForwardedComponent.displayName = CustomElement.displayName;
  return ForwardedComponent as any;
}

function ShadowRoot(props) {
  return React.createElement(props.shadow ? 'template' : 'shadow-root', {
    dangerouslySetInnerHTML: { __html: '' },
    suppressHydrationWarning: true,
  });
}
