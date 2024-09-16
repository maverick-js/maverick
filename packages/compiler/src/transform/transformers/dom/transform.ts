import { trimQuotes } from '@maverick-js/std';
import { $, createFunction, createObjectBindingPattern, getArgId, hasArgId } from '@maverick-js/ts';
import { encode } from 'html-entities';
import ts from 'typescript';

import {
  type AstNode,
  isElementNode,
  isExpressionNode,
  isFragmentNode,
  isTextNode,
} from '../../../parse/ast';
import { type Visitors, walk } from '../../../parse/walk';
import { isHigherOrderExpression } from '../factory';
import { transformProps } from '../transform-props';
import { Component } from './nodes/component';
import { Element } from './nodes/element';
import { Expression } from './nodes/expression';
import { Fragment } from './nodes/fragment';
import { Text } from './nodes/text';
import { DomTransformState } from './state';

export const domVisitors: Visitors<DomTransformState> = {
  Element,
  Component,
  Fragment,
  Expression,
  Text,
};

export function transform(node: AstNode, state: DomTransformState): ts.Expression {
  if (isTextNode(node)) {
    return $.string(node.value);
  }

  transformProps(node, (_, value) => {
    state.args.push(value);
    return getArgId(value);
  });

  walk({ node, visitors: domVisitors, state });

  if (isExpressionNode(node)) {
    if (!node.dynamic) {
      return $.string(encode(trimQuotes(node.expression.getText())));
    } else if (hasArgId(node.expression)) {
      const id = getArgId(node.expression);
      return state.hydratable && isHigherOrderExpression(node) ? $.call(id) : id;
    } else {
      return node.expression;
    }
  }

  if (isFragmentNode(node) && state.children) {
    return createFragment(state);
  }

  return createRender(state);
}

const renderCallCache = new WeakMap<DomTransformState, ts.Expression>();

function createRender(state: DomTransformState) {
  const shortCall = getShortCall(state.root, state);
  if (shortCall) return shortCall;

  const id = $.createUniqueName(`$$_render`),
    rootId = state.vars.block.getFirstName(),
    blockStatements = state.block.map($.createExpressionStatement),
    returnStatement = $.createReturnStatement(rootId),
    block = $.createBlock(
      [state.vars.block.toStatement(), ...blockStatements, returnStatement],
      true,
    ),
    args = getRenderArgs(state),
    fn = createFunction(id, createRenderFunctionParams(args), block);

  state.renders.push(fn);

  const call = createRenderCall(id, args, state.scope.isRoot);
  renderCallCache.set(state, call);
  return call;
}

function createFragment(state: DomTransformState) {
  const id = $.createUniqueName(`$$_fragment`),
    args = getRenderArgs(state),
    children = $.createArrayLiteralExpression(state.children.map(createFragmentChild)),
    fn = createFunction(id, createRenderFunctionParams(args), [$.createReturnStatement(children)]);

  state.renders.push(fn);

  return createRenderCall(id, args, state.scope.isRoot);
}

function createFragmentChild(childState: DomTransformState) {
  const root = childState.root;
  if (root && isExpressionNode(root)) {
    if (!root.dynamic) return root.expression;
    const id = getArgId(root.expression);
    return childState.hydratable && root.dynamic ? $.call(id) : id;
  } else {
    return getRenderCall(childState);
  }
}

function getRenderCall(state: DomTransformState) {
  return renderCallCache.get(state) ?? createRender(state);
}

// Avoid creating a new render function for simply cloning a node `$$_clone(template)`.
function getShortCall(node: AstNode | null, state: DomTransformState) {
  if (state.hydratable) return null;

  if (node && isElementNode(node) && !node.isDynamic() && state.block.length === 0) {
    const root = state.vars.block.declarations[0];
    if (
      root?.initializer &&
      ts.isCallExpression(root.initializer) &&
      ts.isIdentifier(root.initializer.expression)
    ) {
      return root.initializer;
    }
  }

  return null;
}

function createRenderFunctionParams(args: ts.Expression[]) {
  if (!args.length) return [];
  return [createObjectBindingPattern(...args.map((node) => getArgId(node)))];
}

function createRenderCall(id: ts.Identifier, args: ts.Expression[], isRootCall: boolean) {
  return $.createCallExpression(id, undefined, createRenderCallParams(args, isRootCall));
}

function createRenderCallParams(args: ts.Expression[], isRootCall: boolean) {
  if (!args.length) return [];
  return [
    $.createObjectLiteralExpression(
      isRootCall
        ? args.map((node) => $.createPropertyAssignment(getArgId(node), node))
        : args.map((node) => $.createShorthandPropertyAssignment(getArgId(node))),
    ),
  ];
}

function getRenderArgs(state: DomTransformState, scope = state.scope) {
  const args = [...state.args];

  for (const childState of state.children) {
    if (childState.scope.isChildOf(scope)) {
      args.push(...getRenderArgs(childState, scope));
    }
  }

  return args;
}
