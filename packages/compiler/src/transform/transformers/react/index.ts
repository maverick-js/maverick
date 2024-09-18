import { isArray } from '@maverick-js/std';
import {
  $,
  replaceTsNodes,
  resetUniqueIdCount,
  splitImportsAndBody,
  type TsNodeMap,
} from '@maverick-js/ts';
import ts from 'typescript';

import { delegateEvents } from '../dom';
import type { Transformer } from '../transformer';
import { ReactTransformState } from './state';
import { transform } from './transform';

export function reactTransformer(): Transformer {
  return {
    name: '@maverick-js/react',
    transform({ sourceFile, nodes, ctx }) {
      const state = new ReactTransformState(null),
        replace: TsNodeMap = new Map();

      for (const node of nodes) {
        let result = transform(node, state.child(node)),
          parentNode = node.node.parent;

        if (ts.isParenthesizedExpression(parentNode)) {
          parentNode = parentNode.parent;
        }

        let isReturned = ts.isReturnStatement(parentNode),
          isStatementChild = ts.isStatement(parentNode),
          shouldReplaceParent = (isReturned || isStatementChild) && isArray(result),
          replaceNode = shouldReplaceParent ? parentNode : node.node;

        if (isReturned && isArray(result)) {
          const lastNode = result[result.length - 1];
          if (lastNode && ts.isExpression(lastNode)) {
            result[result.length - 1] = $.createReturnStatement(lastNode);
          }
        }

        replace.set(replaceNode, result);

        resetUniqueIdCount();
      }

      const { imports, body } = splitImportsAndBody(sourceFile);

      if (ctx.options.delegateEvents && state.delegatedEvents.size > 0) {
        body.push(delegateEvents(state.delegatedEvents, state.domRuntime));
      }

      const statements: ts.Statement[] = [];

      const components = ctx.analysis.components;
      for (const component of Object.keys(components)) {
        if (components[component]) state.runtime.add(component);
      }

      const runtimes = [state.runtime, state.domRuntime];
      for (const runtime of runtimes) {
        if (runtime.identifiers.length > 0) {
          statements.push(runtime.toImportDeclaration());
        }
      }

      if (state.module.vars.length > 0) {
        statements.push(state.module.vars.toStatement());
      }

      return replaceTsNodes(
        $.updateSourceFile(sourceFile, [...imports, ...statements, ...state.module.block, ...body]),
        replace,
      );
    },
  };
}
