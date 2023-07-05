import * as React from 'react';

import type { Component } from '../core';
import { MaverickServerElement } from '../element/server';
import { kebabToCamelCase } from '../std/string';
import { isString } from '../std/unit';
import { ClientComponent } from './client-component';
import { WithScope } from './scope';

export class ServerComponent<T extends Component> extends ClientComponent<T> {
  override render() {
    let Ctor = this.constructor as typeof ClientComponent,
      host = new MaverickServerElement(this._component),
      attrs: Record<string, any> = {},
      { className, style = {}, children, forwardRef, ...props } = this.props;

    if (Ctor._props.size) {
      let $props = this._component.$$._props;
      for (const prop of Object.keys(props)) {
        if (Ctor._props.has(prop)) {
          $props[prop].set(props[prop]);
        } else {
          attrs[prop] = props[prop];
        }
      }
    }

    host.setup();

    if (host.hasAttribute('class')) {
      className = ((isString(className) ? className + ' ' : '') +
        host.getAttribute('class')) as any;

      host.removeAttribute('class');
    }

    if (host.hasAttribute('style')) {
      for (const [name, value] of host.style.tokens) {
        style[name.startsWith('--') ? name : kebabToCamelCase(name)] = value;
      }

      host.removeAttribute('style');
    }

    if (host.hasAttribute('tabindex') && !('tabIndex' in attrs)) {
      attrs.tabIndex = host.getAttribute('tabindex');
      host.removeAttribute('tabindex');
    }

    return WithScope(
      this._scope,
      children?.(
        {
          ...Object.fromEntries(host.attributes.tokens),
          ...attrs,
          className,
          style,
        },
        this._component,
      ),
      React.createElement(() => {
        host.destroy();
        return null;
      }),
    );
  }
}
