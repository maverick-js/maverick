import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { createServerElement } from '../element/create-server-element';
import { createElementInstance } from '../element/instance';
import { SCOPE } from '../element/internal';
import type { CustomElementDefinition } from '../element/types';
import { kebabToCamelCase } from '../std/string';
import { useReactScope, WithReactScope } from './scope';

const stylesRE = /style="(.*?)"/;

export function createReactServerElement(definition: CustomElementDefinition): any {
  const ServerElement = createServerElement(definition);
  const propDefs = definition.props ?? {};
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

    const scope = useReactScope();
    const instance = createElementInstance(definition, {
      props: _props,
      scope: scope?.current,
    });

    host.attachComponent(instance);

    const innerHTML = host.renderInnerHTML();

    if (host.hasAttribute('style')) {
      _attrs.style = {};

      for (const [name, value] of host.style.tokens) {
        _attrs.style[name.startsWith('--') ? name : kebabToCamelCase(name)] = value;
      }

      host.removeAttribute('style');
    }

    return WithReactScope(
      { current: instance[SCOPE], mounted: false },
      React.createElement(
        definition.tagName,
        {
          ..._attrs,
          ...Object.fromEntries(host.attributes.tokens),
          'mk-d': '',
          'mk-h': '',
        },
        definition.shadowRoot
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
          if (!scope) host.destroy();
          return null;
        }),
      ),
    );
  };
}
