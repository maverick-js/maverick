import { trimQuotes } from '@maverick-js/std';
import { $ } from '@maverick-js/ts';
import { encode } from 'html-entities';
import ts from 'typescript';

import { type AstNode, isExpressionNode, isTextNode } from '../../../parse/ast';
import { type Visitors, walk } from '../../../parse/walk';
import { Component } from './nodes/component';
import { Element } from './nodes/element';
import { Expression } from './nodes/expression';
import { Fragment } from './nodes/fragment';
import { Text } from './nodes/text';
import type { SsrTransformState } from './state';

export const ssrVisitors: Visitors<SsrTransformState> = {
  Element,
  Component,
  Fragment,
  Expression,
  Text,
};

export function transform(node: AstNode, state: SsrTransformState): ts.Expression {
  if (isTextNode(node)) {
    return $.string(node.value);
  }

  walk({ node, visitors: ssrVisitors, state });

  if (isExpressionNode(node)) {
    if (!node.dynamic) {
      return $.string(encode(trimQuotes(node.expression.getText())));
    } else if (!node.children) {
      return state.runtime.escape(node.expression);
    } else {
      return node.expression;
    }
  }

  // Commit any remaining HTML to the template.
  state.commit();

  if (state.statics.length === 1 && state.values.length === 0) {
    return state.statics[0];
  } else if (state.statics.length > 0) {
    state.template = $.createUniqueName('$$_template');
    return state.runtime.ssr(state.template, state.values);
  }

  if (state.values.length > 0) {
    return state.values.length === 1 ? state.values[0] : $.array(state.values);
  }

  return $.null;
}
