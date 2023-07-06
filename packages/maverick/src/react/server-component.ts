import * as React from 'react';

import { type Component, type ComponentConstructor, createComponent } from '../core';
import { MaverickServerElement } from '../element/server';
import { kebabToCamelCase } from '../std/string';
import { isString } from '../std/unit';
import { ReactScopeContext, WithScope } from './scope';
import type { InternalReactProps } from './types';

export function createServerComponent<T extends Component>(
  Component: ComponentConstructor<T>,
  componentProps: Set<string>,
): React.FC<InternalReactProps<T>> {
  function ServerComponent(props: InternalReactProps<T>) {
    let scope = React.useContext(ReactScopeContext),
      component = createComponent<T>(Component, { props, scope }),
      host = new MaverickServerElement(component),
      attrs: Record<string, any> = {},
      { className, style = {}, children, forwardRef, ...__props } = props;

    if (componentProps.size) {
      for (const prop of Object.keys(__props)) {
        if (!componentProps.has(prop)) attrs[prop] = __props[prop];
      }
    } else {
      attrs = __props;
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
      component.$$._scope,
      children?.(
        {
          ...Object.fromEntries(host.attributes.tokens),
          ...attrs,
          className,
          style,
        },
        component,
      ),
      React.createElement(() => {
        host.destroy();
        return null;
      }),
    );
  }

  ServerComponent.displayName = Component.name + 'Bridge';
  return ServerComponent;
}
