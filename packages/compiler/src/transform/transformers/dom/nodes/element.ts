import { trimQuotes } from '@maverick-js/std';
import { $ } from '@maverick-js/ts';

import { type ElementNode, isFragmentNode } from '../../../../parse/ast';
import { getAttributeText } from '../../../../parse/utils';
import { createElementProps } from '../../shared/factory';
import { getElementId } from '../position';
import type { DomVisitorContext } from '../state';

export function Element(node: ElementNode, { state, walk }: DomVisitorContext) {
  const { hydratable, vars, runtime, block } = state,
    isRoot = walk.path.length === 0 || isFragmentNode(walk.path.at(-1)!);

  if (!state.template) {
    state.template = $.createUniqueName('$_template');
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
      assert(state.walker);
      state.element = vars.setup.nextElement(state.walker);
    } else {
      state.element = getElementId(node, state, walk);
    }
  }

  state.html += `<${node.name}`;

  if (state.element) {
    state.elements.set(node, state.element);

    if (node.spreads) {
      const props = runtime.mergeProps([
        ...node.spreads.map((s) => s.initializer),
        createElementProps(node),
      ]);

      block.push(runtime.spread(state.element, props));
    } else {
      if (node.attrs) {
        for (const attr of node.attrs) {
          if (!attr.dynamic) {
            state.html += ` ${attr.name}="${getAttributeText(attr)}"`;
          } else {
            block.push(runtime.attr(state.element, attr.name, attr.initializer));
          }
        }
      }

      if (node.props) {
        for (const prop of node.props) {
          block.push(runtime.prop(state.element, prop.name, prop.initializer, prop.signal));
        }
      }

      if (node.classes) {
        for (const c of node.classes) {
          block.push(runtime.class(state.element, c.name, c.initializer));
        }
      }

      if (node.styles) {
        for (const style of node.styles) {
          block.push(runtime.style(state.element, style.name, style.initializer));
        }
      }

      if (node.vars) {
        for (const cssvar of node.vars) {
          block.push(runtime.style(state.element, `--${cssvar.name}`, cssvar.initializer));
        }
      }

      if (node.events) {
        for (const event of node.events) {
          block.push(runtime.listen(state.element, event.type, event.initializer, event.capture));
          if (event.delegate) state.delegatedEvents.add(event.type);
        }
      }

      if (node.ref) {
        block.push(runtime.ref(state.element, node.ref.initializer));
      }
    }
  }

  if (node.isVoid) {
    state.html += '/>';
  } else {
    state.html += '>';
    if (node.content) {
      if (node.content.dynamic) {
        if (state.element) {
          block.push(
            runtime.prop(
              state.element,
              node.content.name,
              node.content.initializer,
              node.content.signal,
            ),
          );
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
