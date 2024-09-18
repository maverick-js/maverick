import { trimQuotes } from '@maverick-js/std';
import { $ } from '@maverick-js/ts';
import type ts from 'typescript';

import {
  type AstNode,
  type ElementNode,
  type FragmentNode,
  isElementNode,
  isFragmentNode,
  isTextNode,
} from '../../../../parse/ast';
import { getElementDepth, isStaticTree } from '../../../../parse/utils';
import { createElementProps } from '../../shared/factory';
import { getReactPropName } from '../attr-map';
import { createDangerouslySetInnerHTMLProp, createReactNode } from '../react-node';
import type { ReactTransformState, ReactVisitorContext } from '../state';

export function Element(node: ElementNode, { state, walk }: ReactVisitorContext) {
  const { domRuntime } = state;

  if (isStaticTree(node)) {
    if (node.children && getElementDepth(node) >= 20) {
      // If the tree is more than 20 elements deep we can improve performance by cloning and
      // inserting the HTML.
      renderTemplate(node, state);
    } else {
      // Hoist static virtual nodes.
      hoistRender(node, state);
    }
  } else {
    const el = $.id('el'),
      props: ts.PropertyAssignment[] = [],
      attach: ts.Expression[] = [];

    if (node.spreads) {
      const props = domRuntime.mergeProps([
        ...node.spreads.map((s) => s.initializer),
        createElementProps(node),
      ]);

      attach.push(domRuntime.spread(el, props));
    } else {
      const result = processAttrs(el, node, state);
      props.push(...result.props);
      attach.push(...result.attach);
    }

    if (node.content) {
      if (node.content.signal) {
        attach.push(
          domRuntime.prop(el, node.content.name, node.content.initializer, node.content.signal),
        );
      } else {
        props.push(createDangerouslySetInnerHTMLProp(node.content.initializer));
      }
    }

    if (attach.length > 0) {
      const attachId = $.createUniqueName('$_attach'),
        attachCallback = $.fn(attachId, [el], attach);

      if (!node.isDynamic()) {
        props.push($.createPropertyAssignment('ref', attachId));
      } else {
        const onAttach = state.runtime.attach(attachId),
          ref = state.render.vars.create('$_ref', onAttach);
        props.push($.createPropertyAssignment('ref', ref.name));
      }

      const scope = node.isDynamic() ? 'setup' : 'module';
      state[scope].block.push(attachCallback);
    }

    // Hoist static props.
    const shouldHoistProps = !node.isDynamic() && props.length > 0,
      propsId = shouldHoistProps
        ? state.module.vars.create('$_props', $.pure($.object(props, true))).name
        : null;

    const vNode = createReactNode(node.name, propsId ?? props);
    state.appendNode(vNode, !node.content ? walk : undefined);
  }
}

export function hoistRender(node: ElementNode | FragmentNode, state: ReactTransformState) {
  const id = $.createUniqueName('$_static_node');
  state.module.vars.create(id, $.pure(state.runtime.createElementFromAST(node)));
  if (!state.result) state.result = id;
  if (state.node) state.node.children.push(id);
}

export function renderTemplate(node: ElementNode, state: ReactTransformState) {
  const { runtime, domRuntime } = state;

  const vNodeId = $.createUniqueName('$_node'),
    templateId = $.createUniqueName('$_template'),
    refCallback = runtime.appendHtml(domRuntime.clone(templateId)),
    refProp = $.createPropertyAssignment('ref', refCallback),
    vNode = $.pure(runtime.createElement(createReactNode(node.name, [refProp]))),
    template = $.string(node.children!.map(renderToString).join(''));

  state.module.vars.create(vNodeId, vNode);
  state.module.vars.create(templateId, domRuntime.createTemplate(template));

  if (!state.result) state.result = vNodeId;
}

export function renderToString(node: AstNode) {
  if (isElementNode(node)) {
    let html = `<${node.name}>`;

    if (node.content) {
      html += trimQuotes(node.content.initializer.getText());
    } else if (node.children) {
      for (const child of node.children) {
        html += renderToString(child);
      }
    }

    return html + `</${node.name}>`;
  } else if (isFragmentNode(node)) {
    if (node.children) {
      let html = '';

      for (const child of node.children) {
        html += renderToString(child);
      }

      return html;
    }
  } else if (isTextNode(node)) {
    return node.value;
  } else {
    return '';
  }
}

function processAttrs(
  el: ts.Identifier,
  node: ElementNode,
  { domRuntime, delegatedEvents }: ReactTransformState,
) {
  const props: ts.PropertyAssignment[] = [],
    attach: ts.Expression[] = [];

  if (node.attrs) {
    for (const attr of node.attrs) {
      if (!attr.dynamic) {
        const name = getReactPropName(attr.name);
        props.push($.createPropertyAssignment(name, attr.initializer));
      } else {
        attach.push(domRuntime.attr(el, attr.name, attr.initializer));
      }
    }
  }

  if (node.props) {
    for (const prop of node.props) {
      attach.push(domRuntime.prop(el, prop.name, prop.initializer, prop.signal));
    }
  }

  if (node.classes) {
    for (const c of node.classes) {
      attach.push(domRuntime.class(el, c.name, c.initializer));
    }
  }

  if (node.styles) {
    for (const style of node.styles) {
      attach.push(domRuntime.style(el, style.name, style.initializer));
    }
  }

  if (node.vars) {
    for (const cssvar of node.vars) {
      attach.push(domRuntime.style(el, `--${cssvar.name}`, cssvar.initializer));
    }
  }

  if (node.events) {
    for (const event of node.events) {
      attach.push(domRuntime.listen(el, event.type, event.initializer, event.capture));
      if (event.delegate) delegatedEvents.add(event.type);
    }
  }

  if (node.ref) {
    attach.push(domRuntime.ref(el, node.ref.initializer));
  }

  return { props, attach };
}
