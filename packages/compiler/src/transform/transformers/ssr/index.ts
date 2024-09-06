import ts from 'typescript';

import type { Transformer } from '../transformer';
import {
  $,
  replaceTsNodes,
  resetNameCount,
  splitImportsAndBody,
  type TsNodeMap,
} from '../ts-factory';
import { SsrTransformState } from './state';
import { transform } from './transform';

export function ssrTransformer(): Transformer {
  return {
    name: '@maverick-js/ssr',
    transform({ sourceFile, nodes, ctx }) {
      const hydratable = Boolean(ctx.options.hydratable),
        state = new SsrTransformState(null, { hydratable }),
        replace: TsNodeMap = new Map();

      for (const node of nodes) {
        const result = transform(node, state.child(node));
        if (result) replace.set(node.node, result);
        resetNameCount();
      }

      const { imports, body } = splitImportsAndBody(sourceFile);

      const components = ctx.analysis.components;
      if (components.portal) state.runtime.add('Portal');
      if (components.fragment) state.runtime.add('Fragment');
      if (components.for) state.runtime.add('For');

      const statements: ts.Statement[] = [];

      if (state.runtime.identifiers.length > 0) {
        statements.push(state.runtime.toImportDeclaration());
      }

      addTemplateVariables(state);
      if (state.vars.declarations.length > 0) {
        statements.push(state.vars.toStatement());
      }

      return replaceTsNodes(
        $.updateSourceFile(sourceFile, [...imports, ...statements, ...body]),
        replace,
      );
    },
  };
}

function addTemplateVariables(state: SsrTransformState) {
  state.walk(({ template, statics }) => {
    if (template && statics.length > 0) {
      state.vars.create(template, $.createArrayLiteralExpression(statics));
    }
  });
}
