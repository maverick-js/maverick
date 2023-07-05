import * as React from 'react';

import { Component, type ComponentConstructor, createComponent, type Scope, tick } from '../core';
import { ON_DISPATCH } from '../core/symbols';
import { kebabToPascalCase } from '../std/string';
import { isUndefined } from '../std/unit';
import { ReactScopeContext, WithScope } from './scope';
import type { InternalReactProps } from './types';
import { setRef } from './utils';

export class ClientComponent<T extends Component> extends React.Component<InternalReactProps<T>> {
  declare context: React.ContextType<typeof ReactScopeContext>;

  static _Component: ComponentConstructor;
  static _props: Set<string>;
  static _events: Set<string>;
  static _eventsRegex?: RegExp;
  static override contextType = ReactScopeContext;

  protected _el: HTMLElement | null = null;
  protected _scope: Scope;
  protected _component: T;
  protected _attached = false;
  protected _forwardRef?: React.Ref<T> | null;
  protected _props = new Set<string>();
  protected _baseClassName: string | undefined;

  constructor(props, context) {
    super(props);

    let Ctor = this.constructor as typeof ClientComponent;
    this._component = createComponent<T>(Ctor._Component as ComponentConstructor<T>, {
      props: props,
      scope: context,
    });

    this._component.$$._setup();

    this._scope = this._component.$$._scope;
    if (!__SERVER__) this._component.$$[ON_DISPATCH] = this._onDispatch.bind(this);
  }

  protected _onRefChange = (el: HTMLElement | null) => {
    this._el = el;

    if (!this._attached) return;

    if (el) {
      this._component.$$._attach(el);
      this._component.$$._connect();
      this._updateBaseClassName();
    } else {
      this._component.$$._detach();
    }
  };

  protected _onAttach = () => {
    if (this._el) {
      this._component.$$._attach(this._el);
      this._component.$$._connect();
      this._updateBaseClassName();
    }

    setRef(this._forwardRef, this._component);

    this._attached = true;
    return this._onDetach.bind(this);
  };

  protected _updateBaseClassName() {
    const base = this._el?.classList.length ? this._el.classList + '' : void 0,
      { className = '' } = this.props;
    this._baseClassName = base?.replace(className, '').trim();
  }

  protected _onDetach() {
    this._component.$$._detach();
    this._attached = false;
  }

  override componentWillUnmount(): void {
    this._forwardRef = null;
    this._component.$$[ON_DISPATCH] = null;
    this._component.$$._destroy();
  }

  override componentDidUpdate(): void {
    tick();
  }

  protected _onDispatch(event: Event) {
    let callbackProp = `on${kebabToPascalCase(event.type)}`,
      args = !isUndefined((event as CustomEvent).detail)
        ? [(event as CustomEvent).detail, event]
        : [event];

    this.props[callbackProp]?.(...args);
  }

  override render(): React.ReactNode {
    let Ctor = this.constructor as typeof ClientComponent,
      attrs = {},
      { className, children, forwardRef, ...props } = this.props;

    className = (
      className
        ? className + (this._baseClassName ? ' ' + this._baseClassName : '')
        : this._baseClassName
    ) as any;

    if (this._forwardRef !== forwardRef) {
      if (this._attached) setRef(forwardRef, this._component);
      this._forwardRef = forwardRef;
    }

    if (Ctor._props.size) {
      let $props = this._component.$$._props,
        seen = new Set<string>();

      for (const prop of Object.keys(props)) {
        if (Ctor._props.has(prop)) {
          $props[prop].set(props[prop]);
          seen.add(prop);
          this._props.delete(prop);
        } else if (!Ctor._events?.has(prop) && !Ctor._eventsRegex?.test(prop)) {
          attrs[prop] = props[prop];
        }
      }

      for (const prop of this._props) {
        $props[prop].set(Ctor._Component.props![prop]);
      }

      this._props = seen;
    }

    return WithScope(
      this._scope,
      React.createElement(MountEffect, { effect: this._onAttach }),
      children?.(
        {
          ...attrs,
          className,
          suppressHydrationWarning: true,
          ref: this._onRefChange,
        },
        this._component,
      ),
    );
  }
}

// Run effects in top-down order.
function MountEffect({ effect }) {
  React.useEffect(effect, []);
  return null;
}
