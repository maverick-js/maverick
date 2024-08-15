import * as React from 'react';

import {
  type Component,
  type ComponentConstructor,
  createComponent,
} from '../../maverick/src/core';
import { MaverickServerElement } from '../../maverick/src/element/server';
import { kebabToCamelCase } from '../../std/src/string';
import { isFunction } from '../../std/src/unit';
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
      { style = {}, children, forwardRef, ...renderProps } = props;

    if (options.props.size) {
      for (const prop of Object.keys(renderProps)) {
        if (!options.props.has(prop)) attrs[prop] = renderProps[prop];
      }
    } else {
      attrs = renderProps;
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
      { current: component.$$.scope! },
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
