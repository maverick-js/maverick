import ts from 'typescript';

import { Scope } from '../../../parse/ast';
import type { Transformer } from '../transformer';
import {
  $,
  replaceTsNodes,
  resetNameCount,
  splitImportsAndBody,
  type TsNodeMap,
} from '../ts-factory';
import { walkStateChildren as walkState } from './context';
import { createTransformState, transform } from './transform';

export function domTransformer(): Transformer {
  return {
    name: '@maverick-js/dom',
    transform({ sourceFile, nodes, ctx }) {
      const hydratable = Boolean(ctx.options.hydratable),
        state = createTransformState(null, { hydratable }),
        replace: TsNodeMap = new Map();

      for (const node of nodes) {
        const result = transform(node, state.createChild(node, new Scope()));
        if (result) replace.set(node.node, result);
        resetNameCount();
      }

      const { imports, body } = splitImportsAndBody(sourceFile);

      if (ctx.options.delegateEvents && state.delegatedEvents.size > 0) {
        body.push(
          $.createExpressionStatement(
            state.runtime.delegateEvents(
              $.createArrayLiteralExpression(
                Array.from(state.delegatedEvents).map((type) => $.string(type)),
              ),
            ),
          ),
        );
      }

      const statements: ts.Statement[] = [];

      if (ctx.analysis.components.portal) state.runtime.add('Portal');
      if (ctx.analysis.components.fragment) state.runtime.add('Fragment');
      if (ctx.analysis.components.for) state.runtime.add('For');

      if (state.runtime.identifiers.length > 0) {
        statements.push(state.runtime.toImportDeclaration());
      }

      // Check whether there are any templates before appending statement.
      if (walkState(state, (childState) => childState.template && childState.html.text)) {
        // Dedupe templates.
        const templates = state.vars.template.declarations;
        for (let i = 0; i < templates.length; i++) {
          const templateA = getTemplateHtmlString(templates[i]);
          for (let j = i + 1; j < templates.length; j++) {
            const templateB = getTemplateHtmlString(templates[j]);
            if (templateA === templateB) {
              replace.set(templates[j].initializer!, templates[i].name);
            }
          }
        }

        statements.push(state.vars.template.toStatement());
      }

      return replaceTsNodes(
        $.updateSourceFile(sourceFile, [...imports, ...statements, ...state.renders, ...body]),
        replace,
      );
    },
  };
}

function getTemplateHtmlString(variable: ts.VariableDeclaration) {
  const { initializer } = variable;

  if (initializer && ts.isCallExpression(initializer)) {
    const firstArg = initializer.arguments[0];
    if (ts.isStringLiteral(firstArg)) return firstArg.text;
  }

  return '';
}
