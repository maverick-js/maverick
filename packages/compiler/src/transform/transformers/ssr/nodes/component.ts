import type ts from 'typescript';

import { type ComponentNode } from '../../../../parse/ast';
import {
  $,
  createComponentHostProps,
  createComponentProps,
  createComponentSlotsObject,
} from '../../ts-factory';
import type { SsrTransformState, SsrVisitorContext } from '../state';
import { transform } from '../transform';

export function Component(node: ComponentNode, { state }: SsrVisitorContext) {
  const { runtime } = state;

  const props = createComponentProps(node),
    spreads = node.spreads
      ? state.vars.create('$_spread', runtime.mergeProps(node.spreads.map((s) => s.initializer)))
      : null,
    component = runtime.createComponent(
      node.name,
      spreads ? runtime.mergeProps([spreads.name, props]) : props,
      createComponentSlotsObject(node, transform, state.child.bind(state)),
      createAttrs(node, spreads?.name, state),
    );

  state.value(component);
}

function createAttrs(
  node: ComponentNode,
  spreads: ts.Identifier | undefined,
  { runtime }: SsrTransformState,
) {
  if (spreads) {
    return runtime.mergeProps([spreads, createComponentHostProps(node, { ssr: true })]);
  } else {
    const props: ts.PropertyAssignment[] = [];

    if (node.class) {
      props.push($.createPropertyAssignment('class', node.class.initializer));
    }

    if (node.classes) {
      const classes = node.classes.map((c) =>
        $.createPropertyAssignment($.string(c.name), c.initializer),
      );

      props.push(
        $.createPropertyAssignment('$class', $.createObjectLiteralExpression(classes, true)),
      );
    }

    if (node.vars) {
      const vars = node.vars.map((c) =>
        $.createPropertyAssignment($.string(`--${c.name}`), c.initializer),
      );

      props.push($.createPropertyAssignment('$var', $.createObjectLiteralExpression(vars, true)));
    }

    if (props.length > 0) {
      return $.createObjectLiteralExpression(props, true);
    }
  }
}
