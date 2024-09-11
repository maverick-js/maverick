import { $, createArrayBindingPattern } from '@maverick-js/ts';
import ts from 'typescript';

import { Variables } from '../shared/variables';
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

  template(id: ts.Identifier, html: string) {
    return this.create(id, this.#runtime.createTemplate($.string(html)));
  }
}

export class DomBlockVariables extends Variables {
  #runtime: DomRuntime;

  constructor(runtime: DomRuntime) {
    super();
    this.#runtime = runtime;
  }

  root(template: ts.Identifier) {
    return this.create(ID.root, this.#runtime.clone(template)).name;
  }

  element(init: ts.Expression) {
    return this.create(ID.element, init).name;
  }

  walker(template: ts.Identifier, walker?: ts.Identifier) {
    const rootId = $.id(ID.root),
      walkerId = $.id(ID.walker),
      bindings = createArrayBindingPattern(rootId, walkerId);

    this.create(bindings, this.#runtime.createWalker(template, walker));

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
    return this.create(ID.component, this.#runtime.createComponent(name, props, slots, onAttach))
      .name;
  }

  host(component: ts.Identifier) {
    return this.create(ID.host, $.prop(component, 'host')).name;
  }

  expression(init: ts.Expression) {
    return this.create(ID.expression, init).name;
  }

  nextElement(walker: ts.Identifier) {
    return this.create(ID.element, this.#runtime.nextElement(walker)).name;
  }

  nextNode(walker: ts.Identifier) {
    return this.create(ID.marker, this.#runtime.nextNode(walker)).name;
  }
}
