import { filterFalsy } from '@maverick-js/std';
import { $, createNullFilledArgs, isAccessExpression } from '@maverick-js/ts';
import ts from 'typescript';

import { Runtime } from '../shared/runtime';

export class DomRuntime extends Runtime {
  protected override pkg = '@maverick-js/dom';

  createTemplate(html: ts.StringLiteral, importNodes: boolean) {
    return $.pure(this.call('create_template', importNodes ? [html, $.createTrue()] : [html]));
  }

  createComponent(
    name: ts.Expression,
    props?: ts.Expression,
    listen?: ts.Expression,
    slots?: ts.Expression,
    onAttach?: ts.Expression,
  ) {
    return this.call(
      'create_component',
      createNullFilledArgs([name, props, listen, slots, onAttach]),
    );
  }

  createWalker(template: ts.Expression) {
    return this.call('create_walker', [template]);
  }

  nextElement(walker: ts.Identifier) {
    return this.call('next_element', [walker]);
  }

  nextNode(walker: ts.Identifier) {
    return $.createCallExpression($.prop(walker, $.id('nextNode')), undefined, undefined);
  }

  createElement(tagName: string) {
    return this.call('create_element', [$.createStringLiteral(tagName)]);
  }

  child(parent: ts.Identifier, index: number) {
    return this.call('child', [parent, $.number(index)]);
  }

  insert(parent: ts.Identifier, value: ts.Expression, marker?: ts.Identifier | ts.NullLiteral) {
    return this.call('insert', marker ? [parent, value, marker] : [parent, value]);
  }

  insertAtMarker(marker: ts.Expression, value: ts.Expression) {
    return this.call('insert_at_marker', [marker, value]);
  }

  listen(target: ts.Identifier, type: string, handler: ts.Expression, capture: boolean) {
    const args = [target, $.string(type), handler];
    if (capture) args.push($.createTrue());
    return this.call('listen', args);
  }

  listenCallback(...events: Array<ts.Expression | undefined>) {
    return this.call('listen_callback', filterFalsy(events));
  }

  delegateEvents(types: ts.ArrayLiteralExpression) {
    return this.call('delegate_events', [types]);
  }

  ref(element: ts.Identifier, ref: ts.Expression) {
    return this.call('ref', [element, ref]);
  }

  prop(obj: ts.Identifier, prop: string, value: ts.Expression, signal?: boolean) {
    if (signal) {
      return this.call('prop', [obj, $.string(prop), value]);
    }

    return $.setProp(obj, prop, value);
  }

  content(el: ts.Identifier, prop: string, value: ts.Expression) {
    return this.call('content', [el, $.string(prop), value]);
  }

  attr(el: ts.Identifier, name: string, value: ts.Expression) {
    return this.call('attr', [el, $.string(name), value]);
  }

  class(el: ts.Identifier, name: string, value: ts.Expression) {
    return this.call('class', [el, $.string(name), value]);
  }

  classTokens(el: ts.Identifier, value: ts.Expression) {
    return this.call('class_tokens', [el, value]);
  }

  appendClass(el: ts.Identifier, value: ts.Expression) {
    return this.call('append_class', [el, value]);
  }

  style(el: ts.Identifier, prop: string, value: ts.Expression) {
    return this.call('style', [el, $.string(prop), value]);
  }

  styleTokens(el: ts.Identifier, value: ts.Expression) {
    return this.call('style_tokens', [el, value]);
  }

  spread(el: ts.Identifier, props: ts.Expression) {
    return this.call('spread', [el, props]);
  }

  hostSpread(el: ts.Identifier, props: ts.Expression) {
    return this.call('host_spread', [el, props]);
  }

  mergeProps(sources: (ts.Expression | null | undefined)[]) {
    const filteredSources = sources.filter(Boolean) as ts.Expression[];
    return filteredSources.length <= 1
      ? (filteredSources[0] ?? $.emptyObject)
      : this.call('merge_props', filteredSources);
  }

  computed(compute: ts.Expression) {
    return this.call('computed', [this.#createComputeCallback(compute)]);
  }

  effect(compute: ts.Expression) {
    return this.call('effect', [this.#createComputeCallback(compute)]);
  }

  peek(compute: ts.Expression) {
    return this.call('peek', [this.#createComputeCallback(compute)]);
  }

  scoped(compute: ts.Expression) {
    return this.call('scoped', [this.#createComputeCallback(compute)]);
  }

  hydrating() {
    return this.id('hydrating');
  }

  #createComputeCallback(compute: ts.Expression) {
    if (isAccessExpression(compute)) {
      return compute;
    } else {
      return $.arrowFn([], compute);
    }
  }
}
