import { isArray, trimQuotes, uniqueItemsOnly } from '@maverick-js/std';
import {
  $,
  type AccessExpression,
  findAccessExpressions,
  getAccessExpressionId,
  isAccessExpression,
  resolveBindingNameIdentifiers,
} from '@maverick-js/ts';
import ts from 'typescript';

import { type ExpressionNode } from '../../../../parse/ast';
import { transformAstNodeChildren } from '../../shared/factory';
import type { StateTransformResult } from '../../transformer';
import type { ReactTransformState, ReactVisitorContext } from '../state';
import { transform } from '../transform';

export function Expression(node: ExpressionNode, { state }: ReactVisitorContext) {
  const { runtime } = state;

  if (ts.isArrowFunction(node.expression)) {
    // Collect render function args so we can forward them.
    const bindings = node.expression.parameters.map((p) => p.name),
      args = resolveBindingNameIdentifiers(bindings);

    for (const arg of args) {
      const text = arg.text;
      state.render.args.add(text);
      state.render.allArgs.add(text);
    }
  }

  if (node.children) {
    const parent = state.node;
    state.node = null; // temp remove so children create new roots.

    // Transform all child JSX elements.
    node.expression = transformAstNodeChildren(
      node,
      (childNode, childState: ReactTransformState) => {
        const result = transform(childNode, childState);
        return resolveExpressionChild(result, state, childState);
      },
      (node) => state.child(node),
    );

    state.node = parent;
  }

  if (!node.dynamic) {
    if (state.node) {
      state.node.children.push($.string(trimQuotes(node.expression.getText())));
    } else {
      state.result = node.expression;
    }
  } else if (ts.isArrowFunction(node.expression)) {
    const render = state.getRenderBlock();

    if (render.length > 0) {
      const id = $.createUniqueName('$_slot'),
        body = node.expression.body,
        result = ts.isExpression(body) ? [$.createReturnStatement(body)] : body.statements,
        block = $.block([...render, ...result]);

      state.setup.block.push($.fn(id, node.expression.parameters, block));

      state.result = id;
    } else {
      let result = node.expression as ts.Expression;
      state.result = result;
    }
  } else {
    // Handle binding render function arguments to expression render functions.
    if (state.render.allArgs.size > 0) {
      const accesses = findAccessExpressions(node.expression),
        binds = getBindings(accesses, state.render.allArgs),
        deps = !isAccessExpression(node.expression) ? accesses : undefined;

      for (const bind of binds) state.render.binds.add(bind);

      const nodeId = state.render.vars.create(
        '$_node',
        runtime.expression(node.expression, deps),
      ).name;

      state.node?.children.push(nodeId);

      state.result = nodeId;
    } else {
      const computedId = state.setup.vars.create(
        '$_computed',
        runtime.computed(node.expression),
      ).name;

      const expressionId = state.render.vars.create(
        '$_expression',
        runtime.expression(computedId),
      ).name;

      state.node?.children.push(expressionId);
      state.result = expressionId;
    }
  }
}

export function resolveExpressionChild(
  result: StateTransformResult,
  parentState: ReactTransformState,
  childState: ReactTransformState,
) {
  const { runtime } = childState,
    render = childState.getRenderBlock();

  if (render.length > 0) {
    // can this ever be an array?
    if (result && !isArray(result)) {
      render.push($.createReturnStatement(result));
    }

    const renderId = $.createUniqueName('$_render'),
      binds = childState.render.binds,
      // Merge args and binds because it might be a nested render function.
      args = childState.isRenderFunctionChild
        ? binds.size > 0
          ? new Set([...binds, ...childState.render.args])
          : childState.render.args
        : binds;

    for (const bind of binds) {
      parentState.render.binds.add(bind);
    }

    childState.setup.block.push($.fn(renderId, Array.from(args).map($.id), render));

    if (args.size === 0) {
      const node = childState.setup.vars.create('$_node', runtime.h(renderId));
      return node.name;
    } else {
      return childState.render.binds.size > 0
        ? runtime.h($.bind(renderId, $.null, Array.from(args).map($.id)))
        : runtime.h(renderId);
    }
  }

  return result;
}

function getBindings(accesses: AccessExpression[], args: Set<string>) {
  return uniqueItemsOnly(
    accesses
      .map(getAccessExpressionId)
      .filter((id) => id && args.has(id.text))
      .map((id) => id!.text),
  ) as string[];
}
