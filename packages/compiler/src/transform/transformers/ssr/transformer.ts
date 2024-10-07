import {
  $,
  replaceTsNodes,
  resetUniqueIdCount,
  splitImportsAndBody,
  type TsNodeMap,
} from '@maverick-js/ts';
import ts from 'typescript';

import { setupCustomElements } from '../shared/element';
import type { Transform, TransformData } from '../transformer';
import { SsrTransformState } from './state';
import { transform } from './transform';

export interface SsrTransformOptions {
  /**
   * Whether to mark components with a static `element` property declaration to be
   * rendered as a custom element.
   */
  customElements?: boolean;
}

export function createSsrTransform(options?: SsrTransformOptions): Transform {
  return (data) => ssrTransform(data, options);
}

export function ssrTransform(
  { sourceFile, nodes, ctx }: TransformData,
  { customElements }: SsrTransformOptions = {},
) {
  const state = new SsrTransformState(null),
    replace: TsNodeMap = new Map();

  for (const node of nodes) {
    const result = transform(node, state.child(node));
    if (result) replace.set(node.node, result);
    resetUniqueIdCount();
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
  if (state.vars.length > 0) {
    statements.push(state.vars.toStatement());
  }

  const transformedSourceFile = replaceTsNodes(
    $.updateSourceFile(sourceFile, [...imports, ...statements, ...body]),
    replace,
  );

  return customElements
    ? setupCustomElements(transformedSourceFile, () => $.createTrue())
    : transformedSourceFile;
}

function addTemplateVariables(state: SsrTransformState) {
  state.walk(({ template, statics }) => {
    if (template && statics.length > 0) {
      state.vars.create(template, $.array(statics));
    }
  });
}
