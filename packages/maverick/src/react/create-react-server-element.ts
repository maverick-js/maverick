import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { createServerElement } from '../element/create-server-element';
import { createElementInstance } from '../element/instance';
import type { AnyElementDefinition } from '../element/types';
import { kebabToCamelCase } from '../std/string';
import { ReactContextMap } from './use-react-context';
import { WithContextMap } from './utils';

const stylesRE = /style="(.*?)"/;

export function createReactServerElement(definition: AnyElementDefinition): any {
  const ServerElement = createServerElement(definition);
  const propDefs = definition.props ?? {};

  return ({ className, style, ...props }: any = {}) => {
    const host = new ServerElement();

    const $attrs: Record<string, any> = {};
    const $props: Record<string, any> = {};

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
        $props[prop] = props[prop];
      } else {
        $attrs[prop] = props[prop];
      }
    }

    const providedContextMap = React.useContext(ReactContextMap);
    const contextMap = providedContextMap ?? new Map();

    const instance = createElementInstance(definition, {
      props: $props,
      context: contextMap,
      children: () => !!props.children,
    });

    host.attachComponent(instance);

    const innerHTML = host.renderInnerHTML();

    if (host.hasAttribute('style')) {
      $attrs.style = {};

      for (const [name, value] of host.style.tokens) {
        $attrs.style[name.startsWith('--') ? name : kebabToCamelCase(name)] = value;
      }

      host.removeAttribute('style');
    }

    return WithContextMap(
      contextMap,
      providedContextMap,
      React.createElement(
        definition.tagName,
        {
          ...$attrs,
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
      ),
    );
  };
}
