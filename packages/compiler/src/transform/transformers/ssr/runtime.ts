import { filterFalsy } from '@maverick-js/std';
import { $, createNullFilledArgs } from '@maverick-js/ts';
import ts from 'typescript';

import { Runtime } from '../shared/runtime';

export class SsrRuntime extends Runtime {
  protected override pkg = '@maverick-js/ssr';

  ssr(template: ts.Identifier, values: ts.Expression[]) {
    return this.call('ssr', [template, $.array(values)]);
  }

  attrs(attrs: ts.Expression) {
    return this.call('attrs', [attrs]);
  }

  class(base: ts.Expression, props?: ts.ObjectLiteralElementLike[]) {
    return this.call('class', props?.length ? [base, $.object(props, true)] : [base]);
  }

  style(base: ts.Expression, props: ts.ObjectLiteralElementLike[]) {
    return this.call('style', [base, $.object(props, true)]);
  }

  createComponent(
    name: string,
    props?: ts.Expression,
    slots?: ts.Expression,
    attrs?: ts.Expression,
  ) {
    const id = $.id(name);
    return this.call('create_component', createNullFilledArgs([id, props, slots, attrs]));
  }

  mergeProps(sources: (ts.Expression | null | undefined)[]) {
    const props = filterFalsy(sources);
    return props.length <= 1 ? (props[0] ?? $.emptyObject) : this.call('merge_props', props);
  }

  appendClass(host: ts.Identifier, classList: ts.Expression) {
    return this.call('append_class', [host, classList]);
  }

  escape(value: ts.Expression) {
    return this.call('escape', [value]);
  }

  scoped(compute: ts.Expression) {
    return this.call('scoped', [ts.isIdentifier(compute) ? compute : $.arrowFn([], compute)]);
  }
}
