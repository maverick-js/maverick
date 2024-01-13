import * as React from 'react';

import { type Component, type ComponentConstructor, createComponent } from '../core';
import { MaverickServerElement } from '../element/server';
import { kebabToCamelCase } from '../std/string';
import { isFunction } from '../std/unit';
import { attrsToProps } from './attrs-map';
import { ReactScopeContext, WithScope } from './scope';
import type { ReactBridgeProps } from './types';

export interface CreateReactServerComponentOptions {
  props: Set<string>;
}

export function createServerComponent<T extends Component>(
  Component: ComponentConstructor<T>,
  options: CreateReactServerComponentOptions,
): React.FC<ReactBridgeProps<T>> {
  function ServerComponent(props: ReactBridgeProps<T>) {
    let scope = React.useContext(ReactScopeContext),
      component = createComponent<T>(Component, {
        props,
        scope: scope.current,
      }),
      host = new MaverickServerElement(component),
      attrs: Record<string, any> = {},
      { style = {}, children, forwardRef, ...__props } = props;

    if (options.props.size) {
      for (const prop of Object.keys(__props)) {
        if (!options.props.has(prop)) attrs[prop] = __props[prop];
      }
    } else {
      attrs = __props;
    }

    host.setup();

    if (host.hasAttribute('style')) {
      for (const [name, value] of host.style.tokens) {
        style[name.startsWith('--') ? name : kebabToCamelCase(name)] = value;
      }

      host.removeAttribute('style');
    }

    for (const [attrName, attrValue] of host.attributes.tokens) {
      const propName = attrsToProps[attrName];
      if (propName) {
        if (!(propName in attrs)) {
          attrs[propName] = attrValue;
        }

        host.removeAttribute(attrName);
      }
    }

    return WithScope(
      { current: component.$$._scope! },
      isFunction(children)
        ? children?.(
            {
              ...Object.fromEntries(host.attributes.tokens),
              ...attrs,
              style,
            },
            component,
          )
        : children,
      React.createElement(() => {
        host.destroy();
        return null;
      }),
    );
  }

  ServerComponent.displayName = Component.name + 'Bridge';
  return ServerComponent;
}
