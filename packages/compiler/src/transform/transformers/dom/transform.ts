import ts from 'typescript';

import {
  type AstNode,
  isElementNode,
  isExpressionNode,
  isFragmentNode,
  isTextNode,
} from '../../../parse/ast';
import { type Visitors, walk } from '../../../parse/walk';
import { transformProps } from '../transform-props';
import { $, createFunction, createObjectBindingPattern, getUniqueNameForNode } from '../ts-factory';
import { Component } from './nodes/component';
import { Element } from './nodes/element';
import { Expression } from './nodes/expression';
import { Fragment } from './nodes/fragment';
import { Text } from './nodes/text';
import { DomTransformState } from './state';

let visitors: Visitors<DomTransformState> = {
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
    return getUniqueNameForNode(value);
  });

  walk({ node, visitors, state });

  // Expressions are passed as arguments so they don't need to create a render function.
  if (isExpressionNode(node)) {
    return $.createNull(); // no-op
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
    return getUniqueNameForNode(root.expression);
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
  return [createObjectBindingPattern(...args.map((node) => getUniqueNameForNode(node)))];
}

function createRenderCall(id: ts.Identifier, args: ts.Expression[], isRootCall: boolean) {
  return $.createCallExpression(id, undefined, createRenderCallParams(args, isRootCall));
}

function createRenderCallParams(args: ts.Expression[], isRootCall: boolean) {
  if (!args.length) return [];
  return [
    $.createObjectLiteralExpression(
      isRootCall
        ? args.map((node) => $.createPropertyAssignment(getUniqueNameForNode(node), node))
        : args.map((node) => $.createShorthandPropertyAssignment(getUniqueNameForNode(node))),
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
