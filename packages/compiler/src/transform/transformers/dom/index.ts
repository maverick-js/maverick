import {
  $,
  replaceTsNodes,
  resetArgsCount,
  splitImportsAndBody,
  type TsNodeMap,
} from '@maverick-js/ts';
import ts from 'typescript';

import { Scope } from '../../../parse/ast';
import type { Transformer } from '../transformer';
import { DomTransformState } from './state';
import { transform } from './transform';
import { DomTemplateVariables } from './vars';

export interface DomTransformerOptions {
  /**
   * If this is `true`, when a `<host>` tag is encountered, the transformer will try to find a
   * corresponding root `tagName` on a class component and if found create a custom element.
   */
  customElements?: boolean;
}

export function domTransformer({ customElements }: DomTransformerOptions = {}): Transformer {
  return {
    name: '@maverick-js/dom',
    transform({ sourceFile, nodes, ctx }) {
      const hydratable = Boolean(ctx.options.hydratable),
        state = new DomTransformState(null, { hydratable, customElements }),
        replace: TsNodeMap = new Map();

      for (const node of nodes) {
        const result = transform(node, state.child(node, new Scope()));
        if (result) replace.set(node.node, result);
        resetArgsCount();
      }

      const { imports, body } = splitImportsAndBody(sourceFile);

      if (ctx.options.delegateEvents && state.delegatedEvents.size > 0) {
        body.push(delegateEvents(state));
      }

      const statements: ts.Statement[] = [];

      const components = ctx.analysis.components;
      if (components.portal) state.runtime.add('Portal');
      if (components.fragment) state.runtime.add('Fragment');
      if (components.for) state.runtime.add('For');

      const templates = createTemplateVariables(state);

      if (state.runtime.identifiers.length > 0) {
        statements.push(state.runtime.toImportDeclaration());
      }

      if (templates) statements.push(templates.toStatement());

      return replaceTsNodes(
        $.updateSourceFile(sourceFile, [...imports, ...statements, ...state.renders, ...body]),
        replace,
      );
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

function delegateEvents({ delegatedEvents, runtime }: DomTransformState) {
  return $.createExpressionStatement(
    runtime.delegateEvents(
      $.createArrayLiteralExpression(Array.from(delegatedEvents).map((type) => $.string(type))),
    ),
  );
}
