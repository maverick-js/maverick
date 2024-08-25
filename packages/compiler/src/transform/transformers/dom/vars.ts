import ts from 'typescript';

import { Variables } from '../shared/variables';
import { $, createArrayBindingPattern } from '../ts-factory';
import type { DomRuntime } from './runtime';

const ID = {
  component: '$_c',
  element: '$_e',
  expression: '$_x',
  host: '$_h',
  marker: '$_m',
  root: '$_r',
  template: '$_t',
  walker: '$_w',
};

export class DomTemplateVariables extends Variables {
  #runtime: DomRuntime;

  constructor(runtime: DomRuntime) {
    super();
    this.#runtime = runtime;
  }

  create(html: ts.StringLiteral) {
    return this.addVariable(ID.template, this.#runtime.createTemplate(html));
  }
}

export class DomBlockVariables extends Variables {
  #runtime: DomRuntime;

  constructor(runtime: DomRuntime) {
    super();
    this.#runtime = runtime;
  }

  root(template: ts.Identifier) {
    return this.addVariable(ID.root, this.#runtime.clone(template)).name;
  }

  element(init: ts.Expression) {
    return this.addVariable(ID.element, init).name;
  }

  walker(template: ts.Identifier, walker?: ts.Identifier) {
    const rootId = $.id(ID.root),
      walkerId = $.id(ID.walker),
      bindings = createArrayBindingPattern(rootId, walkerId);

    this.addVariable(bindings, this.#runtime.createWalker(template, walker));

    return {
      root: rootId,
      walker: walkerId,
    };
  }

  component(
    name: string,
    props?: ts.Expression,
    slots?: ts.Expression,
    onAttach?: ts.ArrowFunction,
  ) {
    return this.addVariable(
      ID.component,
      this.#runtime.createComponent(name, props, slots, onAttach),
    ).name;
  }

  host(component: ts.Identifier) {
    return this.addVariable(ID.host, $.prop(component, 'host')).name;
  }

  expression(init: ts.Expression) {
    return this.addVariable(ID.expression, init).name;
  }

  nextElement(walker: ts.Identifier) {
    return this.addVariable(ID.element, this.#runtime.nextElement(walker)).name;
  }

  nextNode(walker: ts.Identifier) {
    return this.addVariable(ID.marker, this.#runtime.nextNode(walker)).name;
  }
}
