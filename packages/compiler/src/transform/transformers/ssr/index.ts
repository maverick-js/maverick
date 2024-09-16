import {
  $,
  replaceTsNodes,
  resetArgsCount,
  splitImportsAndBody,
  type TsNodeMap,
} from '@maverick-js/ts';
import ts from 'typescript';

import { markCustomElements } from '../element';
import type { Transformer } from '../transformer';
import { SsrTransformState } from './state';
import { transform } from './transform';

export interface SsrTransformOptions {
  /**
   * Whether to mark components with a static `tagName` property declaration to be rendered as
   * a custom element.
   */
  customElements?: boolean;
}

export function ssrTransformer({ customElements }: SsrTransformOptions = {}): Transformer {
  return {
    name: '@maverick-js/ssr',
    transform({ sourceFile, nodes, ctx }) {
      const hydratable = Boolean(ctx.options.hydratable),
        state = new SsrTransformState(null, { hydratable }),
        replace: TsNodeMap = new Map();

      for (const node of nodes) {
        const result = transform(node, state.child(node));
        if (result) replace.set(node.node, result);
        resetArgsCount();
      }

      const { imports, body } = splitImportsAndBody(sourceFile);

      const components = ctx.analysis.components;
      for (const component of Object.keys(components)) {
        if (components[component]) state.runtime.add(component);
      }

      const statements: ts.Statement[] = [];

      if (state.runtime.identifiers.length > 0) {
        statements.push(state.runtime.toImportDeclaration());
      }

      addTemplateVariables(state);
      if (state.vars.declarations.length > 0) {
        statements.push(state.vars.toStatement());
      }

      const transformedSourceFile = replaceTsNodes(
        $.updateSourceFile(sourceFile, [...imports, ...statements, ...body]),
        replace,
      );

      return customElements ? markCustomElements(transformedSourceFile) : transformedSourceFile;
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
