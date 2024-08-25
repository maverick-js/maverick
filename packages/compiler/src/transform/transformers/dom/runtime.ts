import ts from 'typescript';

import { createId } from '../../print';

export class Runtime {
  readonly identifiers: Record<string, ts.Identifier> = {};

  createTemplate(html: string) {
    return this.#createCallExpression('$$_create_template', [ts.factory.createStringLiteral(html)]);
  }

  createFragment() {
    return this.#createCallExpression('$$_create_fragment', []);
  }

  createComponent(id: ts.Identifier) {
    return this.#createCallExpression('$$_create_component', [id]);
  }

  createWalker(fragment: ts.Identifier, walker: ts.Identifier) {
    return this.#createCallExpression('$$_create_walker', [fragment, walker]);
  }

  nextTemplate(fragment: ts.Identifier) {
    return this.#createCallExpression('$$_next_template', [fragment]);
  }

  nextElement(walker: ts.Identifier) {
    return this.#createCallExpression('$$_next_element', [walker]);
  }

  createElement(tagName: string) {
    return this.#createCallExpression('$$_create_element', [
      ts.factory.createStringLiteral(tagName),
    ]);
  }

  setupCustomElement(host: ts.Identifier, props: ts.Identifier | ts.ObjectLiteralExpression) {
    return this.#createCallExpression('$$_setup_custom_element', [host, props]);
  }

  children(id: ts.Identifier) {
    return this.#createCallExpression('$$_children', [id]);
  }

  insert(parent: ts.Identifier, value: ts.Identifier, marker?: ts.Identifier) {
    return this.#createCallExpression(
      '$$_insert',
      marker ? [parent, value, marker] : [parent, value],
    );
  }

  insertAtMarker(marker: ts.Identifier, value: ts.Identifier) {
    return this.#createCallExpression('$$_insert_at_marker', [marker, value]);
  }

  listen(target: ts.Identifier, type: string, handler: ts.Expression, capture: boolean) {
    return this.#createCallExpression('$$_listen', [
      target,
      ts.factory.createStringLiteral(type),
      handler,
      capture ? ts.factory.createTrue() : ts.factory.createFalse(),
    ]);
  }

  delegateEvents(types: ts.ArrayLiteralExpression) {
    return this.#createCallExpression('$$_delegate_events', [types]);
  }

  clone(fragment: ts.Identifier) {
    return this.#createCallExpression('$$_clone', [fragment]);
  }

  ref(element: ts.Identifier, ref: ts.Expression) {
    return this.#createCallExpression('$$_ref', [element, ref]);
  }

  attr(el: ts.Identifier, name: string, value: ts.Expression) {
    return this.#createCallExpression('$$_attr', [el, ts.factory.createStringLiteral(name), value]);
  }

  class(el: ts.Identifier, name: string, value: ts.Expression) {
    return this.#createCallExpression('$$_class', [
      el,
      ts.factory.createStringLiteral(name),
      value,
    ]);
  }

  style(el: ts.Identifier, prop: string, value: ts.Expression) {
    return this.#createCallExpression('$$_style', [
      el,
      ts.factory.createStringLiteral(prop),
      value,
    ]);
  }

  spread(el: ts.Identifier, props: ts.Identifier | ts.ObjectLiteralExpression) {
    return this.#createCallExpression('$$_spread', [el, props]);
  }

  mergeProps(sources: ts.Expression[]) {
    return this.#createCallExpression('$$_merge_props', sources);
  }

  computed(compute: ts.Identifier) {
    return this.#createCallExpression('$$_computed', [compute]);
  }

  effect(compute: ts.Identifier) {
    return this.#createCallExpression('$$_effect', [compute]);
  }

  peek(compute: ts.Identifier) {
    return this.#createCallExpression('$$_peek', [compute]);
  }

  scoped(compute: ts.Identifier) {
    return this.#createCallExpression('$$_scoped', [compute]);
  }

  hydrating() {
    return this.#getId('$$_hydrating');
  }

  #getId(name: string) {
    let id = this.identifiers[name];

    if (!id) {
      this.identifiers[name] = id = createId(name);
    }

    return id;
  }

  #createCallExpression(name: string, args: readonly ts.Expression[] | undefined) {
    return ts.factory.createCallExpression(this.#getId(name), undefined, args);
  }
}
