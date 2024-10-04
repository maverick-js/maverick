import { filterFalsy, isArray, isString, trimQuotes } from '@maverick-js/std';
import { $, createNullFilledArgs, isAccessExpression } from '@maverick-js/ts';
import ts from 'typescript';

import {
  type AstNode,
  isElementNode,
  isExpressionNode,
  isFragmentNode,
  isTextNode,
} from '../../../parse/ast';
import { Runtime } from '../shared/runtime';
import { createStaticReactNodeProps, isReactNode, type ReactNode } from './react-node';

export class ReactRuntime extends Runtime {
  protected override pkg = '@maverick-js/react';

  get isClient() {
    return this.id('$$_IS_CLIENT');
  }

  get isServer() {
    return this.id('$$_IS_SERVER');
  }

  createElement(node: ReactNode) {
    return this.h(
      node.name,
      isArray(node.props)
        ? node.props.length > 0
          ? $.object(node.props, true)
          : undefined
        : node.props,
      node.children.map((child) => (isReactNode(child) ? this.createElement(child) : child)),
    );
  }

  createStaticElement(node: AstNode): ts.Expression {
    if (isElementNode(node) && !node.isDynamic()) {
      const props =
        !node.attrs && node.content
          ? this.html(node.content.initializer)
          : createStaticReactNodeProps(node);

      return this.h(
        node.name,
        isArray(props) ? $.object(props, true) : props,
        !node.content ? node.children?.map((node) => this.createStaticElement(node)) : undefined,
      );
    } else if (isFragmentNode(node)) {
      return this.h(
        this.add('ReactFragment'),
        undefined,
        node.children?.map((node) => this.createStaticElement(node)),
      );
    } else if (isTextNode(node)) {
      return $.string(node.value);
    } else if (isExpressionNode(node)) {
      return $.string(trimQuotes(node.expression.getText()));
    } else {
      throw Error('not_static');
    }
  }

  h(name: string | ts.Expression, props?: ts.Expression, children: ts.Expression[] = []) {
    return this.call(
      'h',
      filterFalsy([
        isString(name) ? $.string(name) : name,
        props ?? (children.length > 0 ? $.null : undefined),
        ...children,
      ]),
    );
  }

  attach(callback: ts.Expression) {
    return this.call('attach', [callback]);
  }

  component(
    tagName: string,
    props?: ts.Expression,
    listeners?: ts.Expression,
    slots?: ts.Expression,
    onAttach?: ts.Expression,
  ) {
    return this.call(
      'component',
      createNullFilledArgs([
        $.id(tagName),
        props,
        listeners ? this.ifClient(listeners) : undefined,
        slots,
        onAttach,
      ]),
    );
  }

  ifClient(truthy: ts.Expression, falsy?: ts.Expression) {
    return this.#createConditionalExpression(this.isClient, truthy, falsy);
  }

  ifServer(expression: ts.Expression, falsy?: ts.Expression) {
    return this.#createConditionalExpression(this.isServer, expression, falsy);
  }

  html(content: ts.Expression) {
    return this.call('html', [content]);
  }

  memo(compute: ts.Expression, deps?: ts.Expression[]) {
    return this.#createCompute('memo', compute, deps);
  }

  computed(compute: ts.Expression | ts.Block, deps?: ts.Expression[]) {
    return this.#createCompute('computed', compute, deps);
  }

  expression(compute: ts.Expression, deps?: ts.Expression[]) {
    return this.#createCompute('expression', compute, deps);
  }

  appendHtml(html: ts.Expression) {
    return this.call('append_html', [html]);
  }

  unwrap(expression: ts.Expression) {
    return this.call('unwrap', [expression]);
  }

  ssrSpread(props: ts.Expression) {
    return this.call('ssr_spread', [props]);
  }

  ssrClass(base: ts.Expression, props: ts.PropertyAssignment[]) {
    return this.call('ssr_class', props.length ? [base, $.object(props, true)] : [base]);
  }

  ssrStyle(base: ts.Expression, props: ts.PropertyAssignment[]) {
    return this.call('ssr_style', props.length ? [base, $.object(props, true)] : [base]);
  }

  ssrAttrs(attrs: ts.Expression) {
    return this.call('ssr_attrs', [attrs]);
  }

  #createCompute(id: string, compute: ts.Expression | ts.Block, deps?: ts.Expression[]) {
    const callback = this.#createComputeCallback(compute);
    return this.call(id, deps?.length ? [callback, $.array(deps)] : [callback]);
  }

  #createComputeCallback(compute: ts.Expression | ts.Block) {
    if (isAccessExpression(compute)) {
      return compute;
    } else {
      return $.arrowFn([], compute);
    }
  }

  #createConditionalExpression(
    condition: ts.Identifier,
    truthy: ts.Expression,
    falsy?: ts.Expression,
  ) {
    return falsy ? $.ternary(condition, truthy, falsy) : $.createLogicalAnd(condition, truthy);
  }
}
