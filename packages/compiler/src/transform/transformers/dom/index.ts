import {
  $,
  replaceTsNodes,
  resetUniqueIdCount,
  splitImportsAndBody,
  type TsNodeMap,
} from '@maverick-js/ts';
import ts from 'typescript';

import { Scope } from '../../../parse/ast';
import { markCustomElements } from '../shared/element';
import type { Transformer } from '../transformer';
import type { DomRuntime } from './runtime';
import { DomTransformState } from './state';
import { transform } from './transform';
import { DomTemplateVariables } from './vars';

export interface DomTransformOptions {
  /**
   * Whether to mark components with a static `tagName` property declaration to be built as
   * a custom element. The custom element itself needs to be registered separately.
   */
  customElements?: boolean;
  /**
   * When set to `true`, the DOM runtime will connect the server-rendered HTML with the JS on
   * the client, making it interactive.
   *
   * The runtime does not require the component to be rendered on the server first but it's
   * recommended for the best performance.
   */
  hydratable?: boolean;
}

export function domTransformer({
  customElements = false,
  hydratable = false,
}: DomTransformOptions = {}): Transformer {
  return {
    name: '@maverick-js/dom',
    transform({ sourceFile, nodes, ctx }) {
      const state = new DomTransformState(null, { hydratable }),
        replace: TsNodeMap = new Map();

      for (const node of nodes) {
        const result = transform(node, state.child(node, new Scope()));
        if (result) replace.set(node.node, result);
        resetUniqueIdCount();
      }

      const { imports, body } = splitImportsAndBody(sourceFile);

      if (ctx.options.delegateEvents && state.delegatedEvents.size > 0) {
        body.push(delegateEvents(state.delegatedEvents, state.runtime));
      }

      const statements: ts.Statement[] = [];

      const components = ctx.analysis.components;
      for (const component of Object.keys(components)) {
        if (components[component]) state.runtime.add(component);
      }

      const templates = createTemplateVariables(state);

      if (state.runtime.identifiers.length > 0) {
        statements.push(state.runtime.toImportDeclaration());
      }

      if (templates) statements.push(templates.toStatement());

      const transformedSourceFile = replaceTsNodes(
        $.updateSourceFile(sourceFile, [...imports, ...statements, ...state.renders, ...body]),
        replace,
      );

      return customElements ? markCustomElements(transformedSourceFile) : transformedSourceFile;
    },
  };
}

function createTemplateVariables(state: DomTransformState) {
  const templates: [template: ts.Identifier, html: string][] = [],
    vars = new DomTemplateVariables(state.runtime);

  state.walk(({ template, html }) => {
    if (template && html) templates.push([template, html]);
  });

  for (const [template, html] of templates) {
    vars.template(template, html);
  }

  // Dedupe templates.
  for (let i = 0; i < templates.length; i++) {
    const templateA = templates[i];
    for (let j = i + 1; j < templates.length; j++) {
      const templateB = templates[j];
      if (templateA[1] === templateB[1]) {
        vars.update(templateB[0], templateA[0]);
      }
    }
  }

  return templates.length > 0 ? vars : null;
}

export function delegateEvents(events: Set<string>, runtime: DomRuntime) {
  return $.createExpressionStatement(
    runtime.delegateEvents($.array(Array.from(events).map((type) => $.string(type)))),
  );
}