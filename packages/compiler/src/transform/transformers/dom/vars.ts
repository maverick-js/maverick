import { $, createArrayBindingPattern } from '@maverick-js/ts';
import ts from 'typescript';

import { Variables } from '../shared/variables';
import type { DomRuntime } from './runtime';

const ID = {
  component: '$_component',
  element: '$_el',
  expression: '$_expression',
  host: '$_host',
  marker: '$_marker',
  node: '$_node',
  root: '$_root',
  template: '$_template',
  walker: '$_walker',
};

export class DomSetupVariables extends Variables {
  #runtime: DomRuntime;

  constructor(runtime: DomRuntime) {
    super();
    this.#runtime = runtime;
  }

  root(template: ts.Identifier) {
    return this.create(ID.root, $.call(template)).name;
  }

  node(init: ts.Expression) {
    return this.create(ID.node, init).name;
  }

  element(init: ts.Expression) {
    return this.create(ID.element, init).name;
  }

  walker(template: ts.Expression) {
    const rootId = $.createUniqueName(ID.root),
      walkerId = $.createUniqueName(ID.walker),
      bindings = createArrayBindingPattern(rootId, walkerId);

    this.create(bindings, this.#runtime.createWalker(template));

    return {
      root: rootId,
      walker: walkerId,
    };
  }

  component(
    name: ts.Expression,
    props?: ts.Expression,
    listen?: ts.Expression,
    slots?: ts.Expression,
    onAttach?: ts.Expression,
  ) {
    return this.create(
      ID.component,
      this.#runtime.createComponent(name, props, listen, slots, onAttach),
    ).name;
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
