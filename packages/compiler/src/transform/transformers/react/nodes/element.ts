import { trimQuotes } from '@maverick-js/std';
import { $, isAccessExpression } from '@maverick-js/ts';
import type ts from 'typescript';

import {
  type AstNode,
  type AttributeNode,
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
  const { runtime, domRuntime } = state;

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
    const scope = state.isExpressionChild ? 'render' : 'setup';

    let el = $.id('el'),
      props: ts.ObjectLiteralElementLike[] = [],
      attach: ts.Expression[] = [];

    if (node.spreads) {
      const mergedProps = domRuntime.mergeProps([
        ...node.spreads.map((s) => s.initializer),
        createElementProps(node),
      ]);

      const propsId = state[scope].vars.create(
        '$_props',
        scope === 'render'
          ? runtime.memo(
              mergedProps,
              node.spreads.map((s) => s.initializer).filter(isAccessExpression),
            )
          : mergedProps,
      ).name;

      const ssrProps = runtime.ssrSpread(propsId),
        ssrPropsId = state[scope].vars.create(
          '$_ssr_props',
          runtime.ifServer(scope === 'render' ? runtime.memo(ssrProps, [propsId]) : ssrProps),
        ).name;

      attach.push(domRuntime.spread(el, propsId));

      props.push($.createSpreadAssignment(ssrPropsId));
    } else {
      const clientProps = getClientProps(el, node, state);
      props.push(...clientProps.props);
      attach.push(...clientProps.attach);

      const ssrProps = getSsrProps(node, state);

      if (ssrProps.length > 0) {
        const ssrAttrs = $.object(ssrProps, true),
          ssrAttrsId = state[scope].vars.create(
            '$_ssr_attrs',
            runtime.ifServer(scope === 'render' ? runtime.memo(ssrAttrs) : ssrAttrs, $.null),
          ).name;

        props.push($.createSpreadAssignment(ssrAttrsId));
        props.push($.createPropertyAssignment('suppressHydrationWarning', $.createTrue()));
      }
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
        const onAttach = runtime.attach(attachId),
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
  state.module.vars.create(id, $.pure(state.runtime.createStaticElement(node)));
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

function getClientProps(
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

export function getSsrProps(node: ElementNode, { runtime }: ReactTransformState) {
  let classNode: AttributeNode | null = null,
    stylesNode: AttributeNode | null = null,
    props: ts.PropertyAssignment[] = [];

  function addProp(attr: AttributeNode) {
    const name = getReactPropName(attr.name);
    props.push(
      $.createPropertyAssignment(
        $.string(name),
        attr.signal ? runtime.unwrap(attr.initializer) : attr.initializer,
      ),
    );
  }

  if (node.attrs) {
    for (const attr of node.attrs) {
      if (attr.name === 'class') {
        classNode = attr;
      } else if (attr.name === 'style') {
        stylesNode = attr;
      } else if (attr.dynamic) {
        addProp(attr);
      }
    }
  }

  if (node.classes) {
    const base =
        classNode?.signal && classNode.initializer
          ? runtime.unwrap(classNode.initializer)
          : (classNode?.initializer ?? $.string('')),
      $classProps = node.classes?.map((c) =>
        $.createPropertyAssignment(
          $.string(c.name),
          c.signal ? runtime.unwrap(c.initializer) : c.initializer,
        ),
      ),
      classProps = $classProps ? runtime.ssrClass(base, $classProps) : base;

    props.push($.createPropertyAssignment('className', classProps));
  } else if (classNode) {
    const value = classNode.signal ? runtime.unwrap(classNode.initializer) : classNode.initializer;
    props.push($.createPropertyAssignment('className', runtime.ssrClass(value, [])));
  }

  if (node.styles || node.vars) {
    const base =
        stylesNode?.signal && stylesNode.initializer
          ? runtime.unwrap(stylesNode.initializer)
          : (stylesNode?.initializer ?? $.string('')),
      $styleProps = node.styles?.map((s) =>
        $.createPropertyAssignment(
          $.string(s.name),
          s.signal ? runtime.unwrap(s.initializer) : s.initializer,
        ),
      ),
      $varProps = node.vars?.map((s) =>
        $.createPropertyAssignment(
          $.string(`--${s.name}`),
          s.signal ? runtime.unwrap(s.initializer) : s.initializer,
        ),
      ),
      styleProps =
        $styleProps || $varProps
          ? runtime.ssrStyle(base, [...($styleProps ?? []), ...($varProps ?? [])])
          : base;

    props.push($.createPropertyAssignment('style', styleProps));
  } else if (stylesNode) {
    const value = stylesNode.signal
      ? runtime.unwrap(stylesNode.initializer)
      : stylesNode.initializer;
    props.push($.createPropertyAssignment('style', runtime.ssrStyle(value, [])));
  }

  if (node.content) {
    props.push(
      createDangerouslySetInnerHTMLProp(
        node.content.signal ? runtime.unwrap(node.content.initializer) : node.content.initializer,
      ),
    );
  }

  return props;
}
