import { filterFalsy } from '@maverick-js/std';
import { $, createNullFilledArgs, isAccessExpression } from '@maverick-js/ts';
import ts from 'typescript';

import { Runtime } from '../shared/runtime';

export class DomRuntime extends Runtime {
  protected override pkg = '@maverick-js/dom';

  createTemplate(html: ts.StringLiteral) {
    return $.pure(this.call('create_template', [html]));
  }

  createFragment() {
    return this.call('create_fragment');
  }

  createComponent(
    name: string,
    props?: ts.Expression,
    slots?: ts.Expression,
    onAttach?: ts.Expression,
  ) {
    const id = $.id(name);
    return this.call('create_component', createNullFilledArgs([id, props, slots, onAttach]));
  }

  createWalker(fragment: ts.Identifier, walker?: ts.Identifier) {
    return this.call('create_walker', walker ? [fragment, walker] : [fragment]);
  }

  nextTemplate(fragment: ts.Identifier) {
    return this.call('next_template', [fragment]);
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

  children(id: ts.Identifier) {
    return this.call('children', [id]);
  }

  insert(parent: ts.Identifier, value: ts.Expression, marker?: ts.Identifier) {
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

  forwardEvent(target: ts.Identifier, type: string, capture: boolean) {
    const args: any[] = [target, $.string(type)];
    if (capture) args.push($.createTrue());
    return this.call('forward_event', args);
  }

  delegateEvents(types: ts.ArrayLiteralExpression) {
    return this.call('delegate_events', [types]);
  }

  clone(fragment: ts.Identifier) {
    return this.call('clone', [fragment]);
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

  attr(el: ts.Identifier, name: string, value: ts.Expression) {
    return this.call('attr', [el, $.string(name), value]);
  }

  class(el: ts.Identifier, name: string, value: ts.Expression) {
    return this.call('class', [el, $.string(name), value]);
  }

  appendClass(el: ts.Identifier, value: ts.Expression) {
    return this.call('append_class', [el, value]);
  }

  style(el: ts.Identifier, prop: string, value: ts.Expression) {
    return this.call('style', [el, $.string(prop), value]);
  }

  spread(el: ts.Identifier, props: ts.Expression) {
    return this.call('spread', [el, props]);
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
