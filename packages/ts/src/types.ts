import type ts from 'typescript';

export type JsxElementNode = ts.JsxElement | ts.JsxSelfClosingElement;

export type JsxRootNode = JsxElementNode | ts.JsxFragment;
