import { $ } from '@maverick-js/ts';
import ts from 'typescript';

import {
  type AstNode,
  isComponentNode,
  isElementNode,
  isExpressionNode,
  isTextNode,
} from '../../../parse/ast';
import { type Visitors, walk } from '../../../parse/walk';
import { Component } from './nodes/component';
import { Element } from './nodes/element';
import { Expression } from './nodes/expression';
import { Fragment } from './nodes/fragment';
import { Text } from './nodes/text';
import type { ReactTransformState } from './state';

export const reactVisitors: Visitors<ReactTransformState> = {
  Element,
  Component,
  Fragment,
  Expression,
  Text,
};

export function transform(
  node: AstNode,
  state: ReactTransformState,
): ts.Expression | Array<ts.Expression | ts.Statement> {
  const { runtime } = state;

  if (isTextNode(node)) {
    return $.string(node.value);
  }

  walk({ node, visitors: reactVisitors, state });

  // This will occur when the entire node is static and hoisted from inside an expression.
  if (isElementNode(node) && !state.node) {
    return state.result ?? $.createNull();
  }

  let $return: ts.Expression;

  if (state.node) {
    $return = runtime.createElement(state.node);
  } else if (isComponentNode(node) && state.result) {
    $return = state.result;
  } else if (isExpressionNode(node)) {
    $return = state.result!;
  } else {
    $return = state.result ? runtime.h(state.result) : $.createNull();
  }

  // Let expression visitor handle it from here.
  if (state.isExpressionChild) {
    return $return;
  }

  const render = state.getRenderBlock();

  if (render.length > 0) {
    render.push($.createReturnStatement($return));

    const renderId = $.createUniqueName('$_render');
    state.setup.block.push($.fn(renderId, [], render));

    const node = state.setup.vars.create('$_node', runtime.h(renderId));
    $return = node.name;
  }

  // Don't build setup for child states.
  if (state.isChild) {
    return $return;
  }

  const setup = state.getSetupBlock();
  return setup.length > 0 ? [...setup, $return] : $return;
}
