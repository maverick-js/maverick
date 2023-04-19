import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import type { ComponentConstructor } from '../element/component';
import { createServerElement } from '../element/create-server-element';
import { createComponent } from '../element/instance';
import { INSTANCE } from '../element/internal';
import { kebabToCamelCase } from '../std/string';
import { useReactScope, WithScope } from './scope';

const stylesRE = /style="(.*?)"/;

export function createReactServerElement(Component: ComponentConstructor): any {
  const ServerElement = createServerElement(Component);
  const propDefs = Component.el.props ?? {};
  return ({ className, style, ...props }: any = {}) => {
    const host = new ServerElement();

    const _attrs: Record<string, any> = {};
    const _props: Record<string, any> = {};

    if (className) {
      host.setAttribute('class', className + '');
    }

    if (style) {
      const markup = renderToStaticMarkup(React.createElement('a', { style }));
      const styles = markup.match(stylesRE)?.[1];
      if (styles) host.setAttribute('style', styles);
    }

    for (const prop of Object.keys(props)) {
      if (prop in propDefs) {
        _props[prop] = props[prop];
      } else {
        _attrs[prop] = props[prop];
      }
    }

    const parentScope = useReactScope(),
      component = createComponent(Component, {
        props: _props,
        scope: parentScope,
      });

    host.attachComponent(component);

    const innerHTML = host.renderInnerHTML();

    if (host.hasAttribute('style')) {
      _attrs.style = {};

      for (const [name, value] of host.style.tokens) {
        _attrs.style[name.startsWith('--') ? name : kebabToCamelCase(name)] = value;
      }

      host.removeAttribute('style');
    }

    return WithScope(
      component[INSTANCE]._scope,
      React.createElement(
        Component.el.tagName,
        {
          ..._attrs,
          ...Object.fromEntries(host.attributes.tokens),
          'mk-d': '',
          'mk-h': '',
        },
        Component.el.shadowRoot
          ? React.createElement('template', {
              shadowroot: host.getShadowRootMode(),
              dangerouslySetInnerHTML: { __html: innerHTML },
            })
          : React.createElement('shadow-root', {
              dangerouslySetInnerHTML: { __html: innerHTML },
            }),
        props.children,
        React.createElement(() => {
          // Destroy from root scope so it's more efficient.
          if (!parentScope) host.destroy();
          return null;
        }),
      ),
    );
  };
}
