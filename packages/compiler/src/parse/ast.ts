import { isNull, trimWhitespace } from '@maverick-js/std';
import type { JsxElementNode } from '@maverick-js/ts';
import { encode } from 'html-entities';
import type ts from 'typescript';

import type { JsxAttrNamespace, JsxEventNamespace } from './jsx';

export class Scope {
  get isRoot() {
    return isNull(this.parent);
  }

  constructor(readonly parent: Scope | null = null) {}

  child() {
    return new Scope(this);
  }

  isChildOf(parent: Scope) {
    let pointer: Scope | null = this;

    while (pointer) {
      if (pointer === parent) return true;
      pointer = pointer.parent;
    }

    return false;
  }
}

export const enum AstNodeKind {
  Element = 1,
  Fragment = 2,
  Expression = 3,
  Component = 4,
  Text = 5,
  Noop = 6,
}

export type AstNode =
  | ElementNode
  | ComponentNode
  | FragmentNode
  | TextNode
  | ExpressionNode
  | NoopNode;

export interface ElementAttributes {
  attrs?: AttributeNode[];
  props?: AttributeNode[];
  vars?: AttributeNode[];
  classes?: AttributeNode[];
  styles?: AttributeNode[];
  spreads?: SpreadNode[];
  events?: EventNode[];
  ref?: RefNode;
  content?: AttributeNode;
  slot?: AttributeNode;
}

export interface ElementNode extends ElementAttributes {
  kind: AstNodeKind.Element;
  node: JsxElementNode;
  name: string;
  isVoid: boolean;
  isSVG: boolean;
  isCustomElement: boolean;
  isDynamic: () => boolean;
  children?: AstNode[];
}

export interface ComponentAttributes {
  props?: AttributeNode[];
  vars?: AttributeNode[];
  slot?: AttributeNode;
  class?: AttributeNode;
  classes?: AttributeNode[];
  spreads?: SpreadNode[];
  events?: EventNode[];
  ref?: RefNode;
}

export interface ComponentNode extends ComponentAttributes {
  kind: AstNodeKind.Component;
  node: JsxElementNode;
  name: string;
  slots?: Record<string, AstNode>;
}

export interface FragmentNode {
  kind: AstNodeKind.Fragment;
  node: ts.JsxFragment;
  children?: AstNode[];
}

export interface TextNode {
  kind: AstNodeKind.Text;
  node: ts.JsxText;
  value: string;
}

export interface ExpressionNode {
  kind: AstNodeKind.Expression;
  node: ts.JsxExpression;
  expression: ts.Expression;
  children?: AstNode[];
  dynamic: boolean;
}

export interface SpreadNode {
  node: ts.JsxSpreadAttribute;
  initializer: ts.Expression;
}

export interface AttributeNode {
  node: ts.JsxAttribute;
  initializer: ts.Expression;
  namespace?: JsxAttrNamespace;
  name: string;
  dynamic?: boolean;
  signal?: boolean;
}

export interface RefNode {
  node: ts.JsxAttribute;
  initializer: ts.Expression;
}

export interface EventNode {
  node: ts.JsxAttribute;
  initializer: ts.Expression;
  namespace: JsxEventNamespace | null;
  type: string;
  capture: boolean;
  forward: boolean;
  delegate: boolean;
}

export interface NoopNode {
  kind: AstNodeKind.Noop;
  node: ts.Node;
}

export type InferTsNode<T extends AstNode> = T extends ExpressionNode ? T['expression'] : T['node'];

export function createElementNode(info: Omit<ElementNode, 'kind'>): ElementNode {
  return { kind: AstNodeKind.Element, ...info };
}

export function createComponentNode(info: Omit<ComponentNode, 'kind'>): ComponentNode {
  return { kind: AstNodeKind.Component, ...info };
}

export function createFragmentNode(info: Omit<FragmentNode, 'kind'>): FragmentNode {
  return { kind: AstNodeKind.Fragment, ...info };
}

export function createTextNode(info: Omit<TextNode, 'kind' | 'value'>): TextNode {
  return { kind: AstNodeKind.Text, ...info, value: encode(trimWhitespace(info.node.text)) };
}

export function createExpressionNode(info: Omit<ExpressionNode, 'kind'>): ExpressionNode {
  return { kind: AstNodeKind.Expression, ...info };
}

export function createSpreadNode(info: Omit<SpreadNode, 'kind'>): SpreadNode {
  return info;
}

export function createNoopNode(node: ts.Node): NoopNode {
  return { kind: AstNodeKind.Noop, node: node };
}

export function isElementNode(node: AstNode): node is ElementNode {
  return node.kind === AstNodeKind.Element;
}

export function isComponentNode(node: AstNode): node is ComponentNode {
  return node.kind === AstNodeKind.Component;
}

export function isFragmentNode(node: AstNode): node is FragmentNode {
  return node.kind === AstNodeKind.Fragment;
}

export function isTextNode(node: AstNode): node is TextNode {
  return node.kind === AstNodeKind.Text;
}

export function isExpressionNode(node: AstNode): node is ExpressionNode {
  return node.kind === AstNodeKind.Expression;
}

export function isNoopNode(node: AstNode): node is NoopNode {
  return node.kind === AstNodeKind.Noop;
}
