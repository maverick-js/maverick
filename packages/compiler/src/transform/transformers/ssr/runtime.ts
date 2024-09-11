import { filterNullish } from '@maverick-js/std';
import { $, createNullFilledArgs } from '@maverick-js/ts';
import ts from 'typescript';

import { Runtime } from '../runtime';

export class SsrRuntime extends Runtime {
  protected override pkg = '@maverick-js/ssr';

  ssr(template: ts.Identifier, values: ts.Expression[]) {
    return this.call('$$_ssr', [template, $.createArrayLiteralExpression(values)]);
  }

  attrs(attrs: ts.Expression) {
    return this.call('$$_attrs', [attrs]);
  }

  class(base: ts.Expression, props?: ts.ObjectLiteralElementLike[]) {
    return this.call(
      '$$_class',
      props?.length ? [base, $.createObjectLiteralExpression(props, true)] : [base],
    );
  }

  style(base: ts.Expression, props: ts.ObjectLiteralElementLike[]) {
    return this.call('$$_style', [base, $.createObjectLiteralExpression(props, true)]);
  }

  createComponent(
    name: string,
    props?: ts.Expression,
    slots?: ts.Expression,
    attrs?: ts.Expression,
  ) {
    const id = $.id(name);
    return this.call('$$_create_component', createNullFilledArgs([id, props, slots, attrs]));
  }

  mergeProps(sources: (ts.Expression | null | undefined)[]) {
    const props = filterNullish(sources);
    return props.length <= 1 ? (props[0] ?? $.emptyObject()) : this.call('$$_merge_props', props);
  }

  appendClass(host: ts.Identifier, classList: ts.Expression) {
    return this.call('$$_append_class', [host, classList]);
  }

  escape(value: ts.Expression) {
    return this.call('$$_escape', [value]);
  }

  scoped(compute: ts.Identifier | ts.Expression) {
    return this.call('$$_scoped', [ts.isIdentifier(compute) ? compute : $.arrowFn([], compute)]);
  }
}
