import ts from 'typescript';

import { type ElementNode, isFragmentNode } from '../../../../parse/ast';
import { getAttributeText } from '../../../../parse/utils';
import { createElementProps } from '../../ts-factory';
import type { DomVisitorContext } from '../context';
import { getElementId } from '../position';

export function Element(node: ElementNode, { state, walk }: DomVisitorContext) {
  let isRoot = walk.path.length === 0 || isFragmentNode(walk.path.at(-1)!),
    el: ts.Identifier | undefined;

  if (!state.template) {
    state.template = state.vars.template.create(state.html);
  }

  if (state.hydratable && (isRoot || node.isDynamic())) {
    state.html.text += '<!$>';
  }

  if (isRoot) {
    if (state.hydratable) {
      const bindings = state.vars.block.walker(state.template.name);
      el = bindings.root;
      state.walker = bindings.walker;
    } else {
      el = state.vars.block.root(state.template.name);
    }
  } else if (node.isDynamic()) {
    if (state.hydratable) {
      assert(state.walker);
      el = state.vars.block.nextElement(state.walker);
    } else {
      el = getElementId(node, state, walk);
    }
  }

  state.html.text += `<${node.as ?? node.name}`;

  if (el) {
    state.elements.set(node, el);

    if (node.spreads) {
      state.block.push(
        state.runtime.spread(
          el,
          state.runtime.mergeProps([
            ...node.spreads.map((s) => s.initializer),
            createElementProps(node),
          ]),
        ),
      );
    } else {
      if (node.attrs) {
        for (const attr of node.attrs) {
          if (!attr.dynamic) {
            state.html.text += ` ${attr.name}="${getAttributeText(attr)}"`;
          } else {
            state.block.push(state.runtime.attr(el, attr.name, attr.initializer));
          }
        }
      }

      if (node.props) {
        for (const prop of node.props) {
          state.block.push(state.runtime.prop(el, prop.name, prop.initializer, prop.signal));
        }
      }

      if (node.classes) {
        for (const c of node.classes) {
          state.block.push(state.runtime.class(el, c.name, c.initializer));
        }
      }

      if (node.styles) {
        for (const style of node.styles) {
          state.block.push(state.runtime.style(el, style.name, style.initializer));
        }
      }

      if (node.vars) {
        for (const cssvar of node.vars) {
          state.block.push(state.runtime.style(el, `--${cssvar.name}`, cssvar.initializer));
        }
      }

      if (node.events) {
        for (const event of node.events) {
          state.block.push(state.runtime.listen(el, event.type, event.initializer, event.capture));
          if (event.delegate) state.delegatedEvents.add(event.type);
        }
      }

      if (node.ref) {
        state.block.push(state.runtime.ref(el, node.ref.initializer));
      }
    }
  }

  if (node.isVoid) {
    state.html.text += '/>';
  } else {
    state.html.text += '>';
    if (node.content) {
      if (el) {
        state.block.push(
          state.runtime.prop(el, node.content.name, node.content.initializer, node.content.signal),
        );
      }
    } else {
      walk.children();
    }

    state.html.text += `</${node.as ?? node.name}>`;
  }
}
