import ts from 'typescript';

import { $, createImports, createNullFilledArgs } from '../ts-factory';

export class DomRuntime {
  readonly #record: Record<string, ts.Identifier> = {};

  get identifiers() {
    return Object.values(this.#record);
  }

  add(name: string) {
    this.#id(name);
  }

  createTemplate(html: ts.StringLiteral) {
    return this.#call('$$_create_template', [html]);
  }

  createFragment() {
    return this.#call('$$_create_fragment', []);
  }

  createComponent(
    name: string,
    props?: ts.Expression,
    slots?: ts.Expression,
    onAttach?: ts.ArrowFunction,
  ) {
    const id = $.id(name);
    return this.#call('$$_create_component', createNullFilledArgs([id, props, slots, onAttach]));
  }

  createWalker(fragment: ts.Identifier, walker?: ts.Identifier) {
    return this.#call('$$_create_walker', walker ? [fragment, walker] : [fragment]);
  }

  nextTemplate(fragment: ts.Identifier) {
    return this.#call('$$_next_template', [fragment]);
  }

  nextElement(walker: ts.Identifier) {
    return this.#call('$$_next_element', [walker]);
  }

  nextNode(walker: ts.Identifier) {
    return $.createCallExpression($.prop(walker, $.id('nextNode')), undefined, undefined);
  }

  createElement(tagName: string) {
    return this.#call('$$_create_element', [$.createStringLiteral(tagName)]);
  }

  setupCustomElement(host: ts.Identifier, props: ts.Identifier | ts.ObjectLiteralExpression) {
    return this.#call('$$_setup_custom_element', [host, props]);
  }

  child(parent: ts.Identifier, index: number) {
    return this.#call('$$_child', [parent, $.number(index)]);
  }

  children(id: ts.Identifier) {
    return this.#call('$$_children', [id]);
  }

  insert(parent: ts.Identifier, value: ts.Expression, marker?: ts.Identifier) {
    return this.#call('$$_insert', marker ? [parent, value, marker] : [parent, value]);
  }

  insertAtMarker(marker: ts.Expression, value: ts.Expression) {
    return this.#call('$$_insert_at_marker', [marker, value]);
  }

  listen(target: ts.Identifier, type: string, handler: ts.Expression, capture: boolean) {
    const args = [target, $.string(type), handler];
    if (capture) args.push($.createTrue());
    return this.#call('$$_listen', args);
  }

  forwardEvent(target: ts.Identifier, type: string, capture: boolean) {
    const args: any[] = [target, $.string(type)];
    if (capture) args.push($.createTrue());
    return this.#call('$$_forward_event', args);
  }

  delegateEvents(types: ts.ArrayLiteralExpression) {
    return this.#call('$$_delegate_events', [types]);
  }

  clone(fragment: ts.Identifier) {
    return this.#call('$$_clone', [fragment]);
  }

  ref(element: ts.Identifier, ref: ts.Expression) {
    return this.#call('$$_ref', [element, ref]);
  }

  prop(obj: ts.Identifier, prop: string, value: ts.Expression, signal?: boolean) {
    if (signal) {
      return this.#call('$$_prop', [obj, $.string(prop), value]);
    }

    return $.setProp(obj, prop, value);
  }

  attr(el: ts.Identifier, name: string, value: ts.Expression) {
    return this.#call('$$_attr', [el, $.string(name), value]);
  }

  class(el: ts.Identifier, name: string, value: ts.Expression) {
    return this.#call('$$_class', [el, $.string(name), value]);
  }

  appendClass(el: ts.Identifier, value: ts.Expression) {
    return this.#call('$$_append_class', [el, value]);
  }

  style(el: ts.Identifier, prop: string, value: ts.Expression) {
    return this.#call('$$_style', [el, $.string(prop), value]);
  }

  spread(el: ts.Identifier, props: ts.Expression) {
    return this.#call('$$_spread', [el, props]);
  }

  componentSpread(el: ts.Identifier, props: ts.Expression) {
    return this.#call('$$_component_spread', [el, props]);
  }

  mergeProps(sources: (ts.Expression | null | undefined)[]) {
    const filteredSources = sources.filter(Boolean) as ts.Expression[];
    return filteredSources.length <= 1
      ? (filteredSources[0] ?? $.emptyObject())
      : this.#call('$$_merge_props', filteredSources);
  }

  computed(compute: ts.Identifier | ts.Expression) {
    return this.#call('$$_computed', [ts.isIdentifier(compute) ? compute : $.arrowFn([], compute)]);
  }

  effect(compute: ts.Identifier | ts.Expression) {
    return this.#call('$$_effect', [ts.isIdentifier(compute) ? compute : $.arrowFn([], compute)]);
  }

  peek(compute: ts.Identifier | ts.Expression) {
    return this.#call('$$_peek', [ts.isIdentifier(compute) ? compute : $.arrowFn([], compute)]);
  }

  scoped(compute: ts.Identifier | ts.Expression) {
    return this.#call('$$_scoped', [ts.isIdentifier(compute) ? compute : $.arrowFn([], compute)]);
  }

  hydrating() {
    return this.#id('$$_hydrating');
  }

  toImportDeclaration() {
    return createImports(Object.values(this.#record), '@maverick-js/dom');
  }

  #id(name: string) {
    let id = this.#record[name];

    if (!id) {
      this.#record[name] = id = $.id(name);
    }

    return id;
  }

  #call(name: string, args: readonly ts.Expression[] | undefined) {
    return $.createCallExpression(this.#id(name), undefined, args);
  }
}
