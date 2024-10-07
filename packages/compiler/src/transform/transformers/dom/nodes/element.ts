import { trimQuotes } from '@maverick-js/std';
import { $ } from '@maverick-js/ts';
import type ts from 'typescript';

import {
  type AstNode,
  type AttributeNode,
  type ElementNode,
  isElementNode,
  isFragmentNode,
} from '../../../../parse/ast';
import { getAttributeText } from '../../../../parse/utils';
import { createElementSpreadProps } from '../../shared/factory';
import { getElementId } from '../position';
import type { DomRuntime } from '../runtime';
import type { DomVisitorContext } from '../state';

export function Element(node: ElementNode, { state, walk }: DomVisitorContext) {
  const { hydratable, vars, runtime, block } = state,
    isRoot = walk.path.length === 0 || isFragmentNode(walk.path.at(-1)!);

  if (!state.template) {
    state.template = $.createUniqueName('$_template');
    state.importNodes = containsCustomElement(node);
  }

  if (state.hydratable && (isRoot || node.isDynamic())) {
    state.html += '<!$>';
  }

  if (isRoot) {
    if (hydratable) {
      const bindings = vars.setup.walker(state.template);
      state.element = bindings.root;
      state.walker = bindings.walker;
    } else {
      state.element = vars.setup.root(state.template);
    }
  } else if (node.isDynamic()) {
    if (state.hydratable) {
      state.element = vars.setup.nextElement(state.walker!);
    } else {
      state.element = getElementId(node, state, walk);
    }
  }

  if (isRoot && state.element) {
    state.elements.set(node, state.element);
  }

  state.html += `<${node.name}`;

  if (state.element) {
    if (node.spreads) {
      const props = runtime.mergeProps([
        ...node.spreads.map((s) => s.initializer),
        createElementSpreadProps(node),
      ]);

      block.push(runtime.spread(state.element, props));
    } else {
      block.push(
        ...createElementDomExpressions(state.element, node, runtime, {
          delegatedEvents: state.delegatedEvents,
          onStaticAttr: (attr) => {
            state.html += ` ${attr.name}="${getAttributeText(attr)}"`;
          },
        }),
      );
    }
  }

  if (state.element && state.result === $.null) {
    state.result = state.element;
  }

  if (node.isVoid) {
    state.html += '/>';
  } else {
    state.html += '>';
    if (node.content) {
      if (node.content.dynamic) {
        if (state.element) {
          block.push(runtime.content(state.element, node.content.name, node.content.initializer));
        }
      } else {
        state.html += trimQuotes(node.content.initializer.getText());
      }
    } else {
      walk.children();
    }

    state.html += `</${node.name}>`;
  }
}

export function containsCustomElement(node: AstNode) {
  if (isElementNode(node) && node.isCustomElement) {
    return true;
  }

  if ((isElementNode(node) || isFragmentNode(node)) && node.children) {
    for (const child of node.children) {
      if (containsCustomElement(child)) return true;
    }
  }

  return false;
}

export function createElementDomExpressions(
  el: ts.Identifier,
  node: ElementNode,
  runtime: DomRuntime,
  {
    delegatedEvents,
    onStaticAttr,
  }: {
    delegatedEvents?: Set<string>;
    onStaticAttr: (attr: AttributeNode) => void;
  },
) {
  const block: ts.Expression[] = [];

  if (node.attrs) {
    for (const attr of node.attrs) {
      if (!attr.dynamic) {
        onStaticAttr(attr);
      } else if (attr.signal && attr.name === 'class' && node.classes) {
        block.push(runtime.classTokens(el, attr.initializer));
      } else if (attr.signal && attr.name === 'style' && (node.styles || node.vars)) {
        block.push(runtime.styleTokens(el, attr.initializer));
      } else {
        block.push(runtime.attr(el, attr.name, attr.initializer));
      }
    }
  }

  if (node.props) {
    for (const prop of node.props) {
      block.push(runtime.prop(el, prop.name, prop.initializer, prop.signal));
    }
  }

  if (node.classes) {
    for (const c of node.classes) {
      block.push(runtime.class(el, c.name, c.initializer));
    }
  }

  if (node.styles) {
    for (const style of node.styles) {
      block.push(runtime.style(el, style.name, style.initializer));
    }
  }

  if (node.vars) {
    for (const cssvar of node.vars) {
      block.push(runtime.style(el, `--${cssvar.name}`, cssvar.initializer));
    }
  }

  if (node.events) {
    for (const event of node.events) {
      block.push(runtime.listen(el, event.type, event.initializer, event.capture));
      if (event.delegate) delegatedEvents?.add(event.type);
    }
  }

  if (node.ref) {
    block.push(runtime.ref(el, node.ref.initializer));
  }

  return block;
}
