import {
  $,
  createImports,
  replaceTsNodes,
  resetUniqueIdCount,
  splitImportsAndBody,
  type TsNodeMap,
} from '@maverick-js/ts';
import ts from 'typescript';

import { Scope } from '../../../parse/ast';
import { setupCustomElements } from '../shared/element';
import { Variables } from '../shared/variables';
import type { Transform, TransformData } from '../transformer';
import type { DomRuntime } from './runtime';
import { DomTransformState } from './state';
import { transform } from './transform';

export interface DomTransformOptions {
  /**
   * Whether to mark components with a static `element` property declaration to be
   * built as a custom element.
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
  /**
   * A single event listener is attached to the document to manage expensive events on multiple
   * child elements. Instead of adding individual listeners to each child, the event "bubbles" up
   * from the target element to the document, where the listener can capture and handle it. This
   * improves performance, especially in dynamic interfaces, by reducing the number of event
   * listeners.
   */
  delegateEvents?: boolean;
}

export function createDomTransform(options?: DomTransformOptions): Transform {
  return (data) => domTransform(data, options);
}

export function domTransform(
  { sourceFile, nodes, ctx }: TransformData,
  { customElements, hydratable, delegateEvents }: DomTransformOptions = {},
) {
  const state = new DomTransformState(null, { hydratable }),
    replace: TsNodeMap = new Map();

  for (const node of nodes) {
    const result = transform(node, state.child(node, new Scope()));
    if (result) replace.set(node.node, result);
    resetUniqueIdCount();
  }

  const { imports, body } = splitImportsAndBody(sourceFile);

  if (delegateEvents && state.delegatedEvents.size > 0) {
    body.push(createDelegateEventsStatement(state.delegatedEvents, state.runtime));
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

  if (state.vars.module.length > 0) {
    statements.push(state.vars.module.toStatement());
  }

  const transformedSourceFile = replaceTsNodes(
    $.updateSourceFile(sourceFile, [...imports, ...statements, ...state.renders, ...body]),
    replace,
  );

  return customElements
    ? setupCustomElements(transformedSourceFile, registerCustomElement, [createElementImport()])
    : transformedSourceFile;
}

const registerCustomElementExpression = $.call($.id('$$_create_custom_element'), [$.id('this')]);

function registerCustomElement() {
  return registerCustomElementExpression;
}

function createElementImport() {
  return createImports([$.id('$$_create_custom_element')], '@maverick-js/element');
}

function createTemplateVariables(state: DomTransformState) {
  const templates: [template: ts.Identifier, html: string, importNodes: boolean][] = [],
    vars = new Variables();

  state.walk(({ template, html, importNodes }) => {
    if (template && html) templates.push([template, html, importNodes]);
  });

  for (const [template, html, importNodes] of templates) {
    vars.create(template, state.runtime.createTemplate($.string(html), importNodes));
  }

  // Dedupe templates.
  for (let i = 0; i < templates.length; i++) {
    const templateA = templates[i];
    for (let j = i + 1; j < templates.length; j++) {
      const templateB = templates[j];
      if (templateA[1] === templateB[1] && templateA[2] === templateB[2]) {
        vars.update(templateB[0], templateA[0]);
      }
    }
  }

  return templates.length > 0 ? vars : null;
}

export function createDelegateEventsStatement(events: Set<string>, runtime: DomRuntime) {
  return $.createExpressionStatement(
    runtime.delegateEvents($.array(Array.from(events).map((type) => $.string(type)))),
  );
}
