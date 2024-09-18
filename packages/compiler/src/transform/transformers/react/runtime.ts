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

  createElementFromAST(node: AstNode): ts.Expression {
    if (isElementNode(node) && !node.isDynamic()) {
      const props =
        !node.attrs && node.content
          ? this.html(node.content.initializer)
          : createStaticReactNodeProps(node);

      return this.h(
        node.name,
        isArray(props) ? $.object(props, true) : props,
        !node.content ? node.children?.map((node) => this.createElementFromAST(node)) : undefined,
      );
    } else if (isFragmentNode(node)) {
      return this.h(
        this.add('ReactFragment'),
        undefined,
        node.children?.map((node) => this.createElementFromAST(node)),
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
      '$$_h',
      filterFalsy([
        isString(name) ? $.string(name) : name,
        props ?? (children.length > 0 ? $.createNull() : undefined),
        ...children,
      ]),
    );
  }

  attach(callback: ts.Expression) {
    return this.call('$$_attach', [callback]);
  }

  component(
    tagName: string,
    props?: ts.Expression,
    listeners?: ts.Expression,
    slots?: ts.Expression,
    onAttach?: ts.Expression,
  ) {
    return this.call(
      '$$_component',
      createNullFilledArgs([
        $.id(tagName),
        props,
        this.onlyClient(listeners) as ts.Expression,
        slots,
        onAttach,
      ]),
    );
  }

  onlyClient(block: ts.Expression | Array<ts.Expression | ts.Statement> | undefined) {
    if (!block) return;
    return this.#if(this.isClient, block);
  }

  onlyServer(block: ts.Expression | Array<ts.Expression | ts.Statement> | undefined) {
    if (!block) return;
    return this.#if(this.isServer, block);
  }

  html(content: ts.Expression) {
    return this.call('$$_html', [content]);
  }

  memo(compute: ts.Expression, deps?: ts.Expression[]) {
    return this.#computeWithDeps('$$_memo', compute, deps);
  }

  computed(compute: ts.Expression | ts.Block, deps?: ts.Expression[]) {
    return this.#computeWithDeps('$$_computed', compute, deps);
  }

  expression(compute: ts.Expression, deps?: ts.Expression[]) {
    return this.#computeWithDeps('$$_expression', compute, deps);
  }

  appendHtml(html: ts.Expression) {
    return this.call('$$_append_html', [html]);
  }

  #if(condition: ts.Identifier, block: ts.Expression | Array<ts.Expression | ts.Statement>) {
    if (!isArray(block)) {
      return $.createLogicalAnd(condition, block);
    } else {
      return $.if(condition, block);
    }
  }

  #computeWithDeps(id: string, compute: ts.Expression | ts.Block, deps?: ts.Expression[]) {
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
}
