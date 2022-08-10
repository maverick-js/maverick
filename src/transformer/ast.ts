import type {
  JSXAttrNamespace,
  JSXElementNode,
  JSXEventNamespace,
  JSXRootNode,
} from './jsx/parse-jsx';
import t from 'typescript';
import { trimWhitespace } from '../utils/print';
import { encode } from 'html-entities';

const AST = Symbol('AST');

export type AST = {
  /** @internal */
  [AST]: true;
  root: JSXRootNode;
  tree: ASTTree;
};

export type ASTTree = ASTNode[];

export const enum ASTNodeKind {
  Element = 1,
  Fragment = 2,
  Spread = 3,
  Attribute = 4,
  Text = 5,
  Expression = 6,
  Ref = 7,
  Event = 8,
  Directive = 9,
  Structural = 20,
}

export type ASTNode =
  | ElementNode
  | FragmentNode
  | TextNode
  | ExpressionNode
  | AttributeNode
  | SpreadNode
  | RefNode
  | EventNode
  | DirectiveNode
  | StructuralNode;

export type ASTUnknownNode = {
  kind: ASTNodeKind;
};

export const enum StructuralNodeType {
  ElementEnd = 1,
  FragmentEnd = 3,
  ChildrenStart = 4,
  ChildrenEnd = 5,
  AttributesEnd = 6,
}

export type StructuralNode = {
  type: StructuralNodeType;
  kind: ASTNodeKind.Structural;
};

export type ElementNode = {
  kind: ASTNodeKind.Element;
  ref: JSXElementNode;
  tagName: string;
  isVoid: boolean;
  isSVG: boolean;
  isCE: boolean;
  children?: ComponentChildren[];
  isComponent: boolean;
  hasChildren: boolean;
  childCount: number;
  childElementCount: number;
  spread(): boolean;
  dynamic(): boolean;
};

export type ComponentChildren = AST | TextNode | ExpressionNode;

export type FragmentNode = {
  kind: ASTNodeKind.Fragment;
  ref: t.JsxFragment;
  childCount: number;
  childElementCount: number;
};

export type TextNode = {
  kind: ASTNodeKind.Text;
  ref: t.JsxText;
  value: string;
};

export type ExpressionNode = {
  kind: ASTNodeKind.Expression;
  ref: t.JsxExpression;
  root?: boolean;
  observable?: boolean;
  children?: AST[];
  dynamic: boolean;
  value: string;
  callId?: string;
};

export type SpreadNode = {
  kind: ASTNodeKind.Spread;
  ref: t.JsxSpreadAttribute;
  value: string;
};

export type AttributeNode = {
  kind: ASTNodeKind.Attribute;
  /* Points at attribute when shorthand property (no initializer). */
  ref: t.JsxAttribute | t.StringLiteral | t.Expression;
  namespace: JSXAttrNamespace | null;
  name: string;
  value: string;
  dynamic?: boolean;
  observable?: boolean;
  callId?: string;
};

export type RefNode = {
  kind: ASTNodeKind.Ref;
  ref: t.Expression;
  value: string;
};

export type EventNode = {
  kind: ASTNodeKind.Event;
  ref: t.Expression;
  namespace: JSXEventNamespace | null;
  type: string;
  value: string;
};

export type DirectiveNode = {
  kind: ASTNodeKind.Directive;
  ref: t.Expression;
  name: string;
  value: string;
};

export function createAST(root: JSXRootNode): AST {
  return { [AST]: true, root, tree: [] };
}

export function createElementNode(info: Omit<ElementNode, 'kind'>): ElementNode {
  return { kind: ASTNodeKind.Element, ...info };
}

export function createFragmentNode(info: Omit<FragmentNode, 'kind'>): FragmentNode {
  return { kind: ASTNodeKind.Fragment, ...info };
}

export function createTextNode(info: Omit<TextNode, 'kind' | 'value'>): TextNode {
  return { kind: ASTNodeKind.Text, ...info, value: encode(trimWhitespace(info.ref.getText())) };
}

export function createAttributeNode(info: Omit<AttributeNode, 'kind'>): AttributeNode {
  return { kind: ASTNodeKind.Attribute, ...info };
}

export function createRefNode(info: Omit<RefNode, 'kind'>): RefNode {
  return { kind: ASTNodeKind.Ref, ...info };
}

export function createEventNode(info: Omit<EventNode, 'kind'>): EventNode {
  return { kind: ASTNodeKind.Event, ...info };
}

export function createDirectiveNode(info: Omit<DirectiveNode, 'kind'>): DirectiveNode {
  return { kind: ASTNodeKind.Directive, ...info };
}

export function createExpressionNode(info: Omit<ExpressionNode, 'kind'>): ExpressionNode {
  return { kind: ASTNodeKind.Expression, ...info };
}

const spreadTrimRE = /(?:^\{\.{3})(.*)(?:\}$)/;
export function createSpreadNode(info: Omit<SpreadNode, 'kind' | 'value'>): SpreadNode {
  return {
    kind: ASTNodeKind.Spread,
    ...info,
    value: info.ref.getText().replace(spreadTrimRE, '$1'),
  };
}

export function createStructuralNode(type: StructuralNodeType): StructuralNode {
  return { kind: ASTNodeKind.Structural, type };
}

export function isAST(value: any): value is AST {
  return !!value[AST];
}

export function isElementNode(node: ASTUnknownNode): node is ElementNode {
  return node.kind === ASTNodeKind.Element;
}

export function isFragmentNode(node: ASTUnknownNode) {
  return node.kind === ASTNodeKind.Fragment;
}

export function isTextNode(node: ASTUnknownNode): node is TextNode {
  return node.kind === ASTNodeKind.Text;
}

export function isAttributeNode(node: ASTUnknownNode): node is AttributeNode {
  return node.kind === ASTNodeKind.Attribute;
}

export function isSpreadNode(node: ASTUnknownNode): node is SpreadNode {
  return node.kind === ASTNodeKind.Spread;
}

export function isExpressionNode(node: ASTUnknownNode): node is ExpressionNode {
  return node.kind === ASTNodeKind.Expression;
}

export function isRefNode(node: ASTUnknownNode): node is RefNode {
  return node.kind === ASTNodeKind.Ref;
}

export function isEventNode(node: ASTUnknownNode): node is EventNode {
  return node.kind === ASTNodeKind.Event;
}

export function isDirectiveNode(node: ASTUnknownNode): node is DirectiveNode {
  return node.kind === ASTNodeKind.Directive;
}

export function isStructuralNode(node: ASTUnknownNode): node is StructuralNode {
  return node.kind === ASTNodeKind.Structural;
}

export function isElementEnd(node: StructuralNode) {
  return node.type === StructuralNodeType.ElementEnd;
}

export function isFragmentEnd(node: StructuralNode) {
  return node.type === StructuralNodeType.FragmentEnd;
}

export function isAttributesEnd(node: StructuralNode) {
  return node.type === StructuralNodeType.AttributesEnd;
}

export function isChildrenStart(node: StructuralNode) {
  return node.type === StructuralNodeType.ChildrenStart;
}

export function isChildrenEnd(node: StructuralNode) {
  return node.type === StructuralNodeType.ChildrenEnd;
}
