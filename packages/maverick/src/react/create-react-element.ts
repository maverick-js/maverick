import { tick } from '@maverick-js/signals';
import * as React from 'react';

import { registerCustomElement } from '../element/create-html-element';
import { createElementInstance } from '../element/instance';
import { PROPS } from '../element/internal';
import type {
  AnyCustomElement,
  AnyCustomElementDefinition,
  AnyCustomElementInstance,
  HTMLCustomElement,
  InferCustomElementFromDefinition,
} from '../element/types';
import type { ContextMap } from '../runtime';
import { $$_attach_declarative_shadow_dom } from '../runtime/dom';
import { kebabToPascalCase } from '../std/string';
import { createReactServerElement } from './create-react-server-element';
import type { ReactElement, ReactElementProps } from './types';
import { ReactContextMap } from './use-react-context';
import { setRef, WithContextMap } from './utils';

export type ReactElementInit = {
  displayName?: string;
};

export function createReactElement<Definition extends AnyCustomElementDefinition>(
  definition: Definition,
  init?: ReactElementInit,
): ReactElement<InferCustomElementFromDefinition<Definition>> {
  return __SERVER__
    ? createReactServerElement(definition)
    : createReactClientElement(definition, init);
}

const SETUP = Symbol();

function createReactClientElement<
  T extends AnyCustomElementDefinition,
  R extends AnyCustomElement = InferCustomElementFromDefinition<T>,
>(definition: T, init?: ReactElementInit): ReactElement<R> {
  registerCustomElement(definition);

  const definedProps = new Set(Object.keys(definition.props ?? {})),
    eventCallbacks = new Map<string, string>();

  class ReactCustomElement extends React.Component<ReactElementProps<R>> {
    static displayName = init?.displayName ?? definition.tagName;
    static override contextType = ReactContextMap;
    declare context: React.ContextType<typeof ReactContextMap>;

    private _instance: AnyCustomElementInstance;
    private _element: HTMLCustomElement | null = null;
    private _context!: ContextMap;
    private _ref?: React.RefCallback<HTMLCustomElement>;
    private _forwardedRef?: React.Ref<HTMLCustomElement>;
    private _listeners = new Map<string, EventListenerObject>();

    constructor(props, context) {
      super(props);
      this._context = context ?? new Map();
      this._instance = createElementInstance(definition, {
        props,
        context: this._context,
      });
    }

    override componentDidMount() {
      if (!this._element) return;

      $$_attach_declarative_shadow_dom(this._element);

      this._element!.onEventDispatch((eventType) => {
        const callbackName = `on${kebabToPascalCase(eventType)}`;
        const callback = this.props[callbackName];
        eventCallbacks.set(callbackName, eventType);
        if (callback) this._updateEventListener(eventType, callback);
      });

      // We need this because `componentDidMount` is called in virtual creation order and not
      // when it's attached to the DOM (i.e, children come before parent). We want to run setup in
      // DOM order.
      if (!this._context.has(SETUP)) this._context.set(SETUP, []);

      const setups = this._context.get(SETUP);
      setups.push(() => this._element!.attachComponent(this._instance));

      // Root element won't have context set.
      if (!this.context) {
        while (setups.length) setups.pop()();
      }
    }

    override componentWillUnmount() {
      this._instance.destroy();
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
      const $$props = this._instance[PROPS];

      for (const prop of Object.keys(restProps)) {
        const value = restProps[prop];
        if (eventCallbacks.has(prop)) {
          this._updateEventListener(eventCallbacks.get(prop)!, value);
        } else if (definedProps.has(prop)) {
          $$props[prop] = value;
        } else {
          props[prop] = value;
        }
      }

      tick();

      return WithContextMap(
        this._context,
        this.context,
        React.createElement(
          definition.tagName,
          { ...props, 'mk-d': true, suppressHydrationWarning: true },
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
    React.createElement(ReactCustomElement, { ...props, __forwardedRef: ref }, props?.children),
  );

  ForwardedComponent.displayName = ReactCustomElement.displayName;
  return ForwardedComponent as any;
}

function ShadowRoot(props) {
  return React.createElement(props.shadow ? 'template' : 'shadow-root', {
    dangerouslySetInnerHTML: { __html: '' },
    suppressHydrationWarning: true,
  });
}
