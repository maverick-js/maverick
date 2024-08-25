import { encode } from 'html-entities';
import type ts from 'typescript';

import { trimWhitespace } from '../utils/print';
import type { JsxAttrNamespace, JsxElementNode, JsxEventNamespace } from './jsx/types';

export const enum ASTNodeKind {
  Element = 1,
  Fragment = 2,
  Text = 3,
  Expression = 4,
  Component = 5,
  Noop = 6,
}

export type ASTNode =
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
  class?: AttributeNode;
  classes?: AttributeNode[];
  style?: AttributeNode;
  styles?: AttributeNode[];
  spreads?: SpreadNode[];
  events?: EventNode[];
  ref?: RefNode;
}

export interface ElementNode extends ElementAttributes {
  kind: ASTNodeKind.Element;
  node: JsxElementNode;
  tagName: string;
  isVoid: boolean;
  isSVG: boolean;
  isCustomElement: boolean;
  children?: ASTNode[];
}

export interface ComponentAttributes {
  props?: AttributeNode[];
  vars?: AttributeNode[];
  class?: AttributeNode;
  classes?: AttributeNode[];
  spreads?: SpreadNode[];
  events?: EventNode[];
}

export interface ComponentNode extends ComponentAttributes {
  kind: ASTNodeKind.Component;
  node: JsxElementNode;
  tagName: string;
  children?: ASTNode[];
}

export interface FragmentNode {
  kind: ASTNodeKind.Fragment;
  node: ts.JsxFragment;
  children?: ASTNode[];
}

export interface TextNode {
  kind: ASTNodeKind.Text;
  node: ts.JsxText;
  value: string;
}

export interface ExpressionNode {
  kind: ASTNodeKind.Expression;
  node: ts.Expression | ts.JsxExpression;
  root?: boolean;
  signal?: boolean;
  children?: ASTNode[];
  dynamic: boolean;
  value: string;
  callId?: string;
}

export interface SpreadNode {
  node: ts.JsxSpreadAttribute;
  value: string;
}

export interface AttributeNode {
  /* Points at attribute when shorthand property (no initializer). */
  node: ts.JsxAttribute | ts.StringLiteral | ts.Expression;
  namespace?: JsxAttrNamespace;
  name: string;
  value: string;
  dynamic?: boolean;
  signal?: boolean;
  children?: ASTNode[];
}

export interface RefNode {
  node: ts.Expression;
  value: string;
}

export interface EventNode {
  /* Points at attribute when forwarded event (no initializer). */
  node: ts.JsxAttribute | ts.Expression;
  namespace: JsxEventNamespace | null;
  type: string;
  value: string;
  capture: boolean;
  forward: boolean;
  delegate: boolean;
}

export interface NoopNode {
  kind: ASTNodeKind.Noop;
}

export function createElementNode(info: Omit<ElementNode, 'kind'>): ElementNode {
  return { kind: ASTNodeKind.Element, ...info };
}

export function createComponentNode(info: Omit<ComponentNode, 'kind'>): ComponentNode {
  return { kind: ASTNodeKind.Component, ...info };
}

export function createFragmentNode(info: Omit<FragmentNode, 'kind'>): FragmentNode {
  return { kind: ASTNodeKind.Fragment, ...info };
}

export function createTextNode(info: Omit<TextNode, 'kind' | 'value'>): TextNode {
  return { kind: ASTNodeKind.Text, ...info, value: encode(trimWhitespace(info.node.getText())) };
}

export function createExpressionNode(info: Omit<ExpressionNode, 'kind'>): ExpressionNode {
  return { kind: ASTNodeKind.Expression, ...info };
}

const spreadTrimRE = /(?:^\{\.{3})(.*)(?:\}$)/;
export function createSpreadNode(info: Omit<SpreadNode, 'kind' | 'value'>): SpreadNode {
  return {
    ...info,
    value: info.node.getText().replace(spreadTrimRE, '$1'),
  };
}

const noop: NoopNode = { kind: ASTNodeKind.Noop };
export function createNoopNode(): NoopNode {
  return noop;
}

export function isElementNode(node: ASTNode): node is ElementNode {
  return node.kind === ASTNodeKind.Element;
}

export function isComponentNode(node: ASTNode): node is ComponentNode {
  return node.kind === ASTNodeKind.Component;
}

export function isFragmentNode(node: ASTNode): node is FragmentNode {
  return node.kind === ASTNodeKind.Fragment;
}

export function isTextNode(node: ASTNode): node is TextNode {
  return node.kind === ASTNodeKind.Text;
}

export function isExpressionNode(node: ASTNode): node is ExpressionNode {
  return node.kind === ASTNodeKind.Expression;
}

export function isNoopNode(node: ASTNode): node is NoopNode {
  return node === noop;
}
