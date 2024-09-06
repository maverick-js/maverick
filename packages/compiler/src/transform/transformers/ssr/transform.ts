import ts from 'typescript';

import { type AstNode, isTextNode } from '../../../parse/ast';
import { type Visitors, walk } from '../../../parse/walk';
import { $ } from '../ts-factory';
import { Component } from './nodes/component';
import { Element } from './nodes/element';
import { Expression } from './nodes/expression';
import { Fragment } from './nodes/fragment';
import { Text } from './nodes/text';
import type { SsrTransformState } from './state';

let visitors: Visitors<SsrTransformState> = {
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

  walk({ node, visitors, state });

  // Commit any remaining HTML to the template.
  state.commit();

  if (state.statics.length === 1 && state.values.length === 0) {
    return state.statics[0];
  } else if (state.statics.length > 0) {
    state.template = $.createUniqueName('$$_t');
    return state.runtime.ssr(state.template, state.values);
  }

  if (state.values.length > 0) {
    return state.values.length === 1
      ? state.values[0]
      : $.createArrayLiteralExpression(state.values);
  }

  return $.createNull();
}
