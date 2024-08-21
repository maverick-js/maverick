import type ts from 'typescript';

export type JSXElementNode = ts.JsxElement | ts.JsxSelfClosingElement;

export type JSXRootNode =
  | JSXElementNode
  | ts.JsxFragment
  | ts.BinaryExpression
  | ts.ConditionalExpression;

export type JSXNodeMeta = {
  parent?: JSXNodeMeta;
  component?: boolean;
  dynamic?: () => void;
  spread?: () => void;
};

export type JSXAttrNamespace =
  | 'class'
  | '$class'
  | 'prop'
  | '$prop'
  | 'style'
  | '$style'
  | 'var'
  | '$var';

export type JSXEventNamespace = 'on' | 'on_capture';

export type JSXNamespace = JSXAttrNamespace | JSXEventNamespace;

export type JSXChildContentAttrName =
  | 'innerHTML'
  | 'textContent'
  | 'innerText'
  | '$innerHTML'
  | '$textContent'
  | '$innerText';
