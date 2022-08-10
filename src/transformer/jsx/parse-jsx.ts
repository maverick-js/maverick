import t from 'typescript';
import { buildAST } from './parse';
import type { AST } from '../ast';
import { logTime } from '../../utils/logger';

export type ParseJSXOptions = {
  filename: string;
};

const tsxRE = /\.tsx/;

export function parseJSX(
  source: string,
  options: Partial<ParseJSXOptions> = {},
): [start: number, ast: AST[]] {
  const { filename = '' } = options;

  const parseStartTime = process.hrtime();
  const sourceFile = t.createSourceFile(filename, source, 99, true, tsxRE.test(filename) ? 4 : 2);
  logTime('Parsed Source File (TS)', parseStartTime);

  const ast: AST[] = [];

  let lastImportNode: t.Node | undefined;
  const parse = (node: t.Node) => {
    if (t.isImportDeclaration(node)) {
      lastImportNode = node;
    } else if (isJSXElementNode(node) || t.isJsxFragment(node)) {
      ast.push(buildAST(node, {}));
      return;
    }

    t.forEachChild(node, parse);
  };

  t.forEachChild(sourceFile, parse);
  return [lastImportNode?.getEnd() ?? 0, ast];
}

export function isJSXElementNode(node: t.Node): node is JSXElementNode {
  return t.isJsxElement(node) || t.isJsxSelfClosingElement(node);
}

export type JSXElementNode = t.JsxElement | t.JsxSelfClosingElement;
export type JSXRootNode = JSXElementNode | t.JsxFragment;

export type JSXNodeMeta = {
  parent?: JSXNodeMeta;
  component?: boolean;
  dynamic?: () => void;
  spread?: () => void;
};

export type JSXAttrNamespace = '$class' | '$cssvar' | '$prop' | '$style';
export type JSXEventNamespace = '$on' | '$oncapture';
export type JSXDirectiveNamespace = '$use';
export type JSXNamespace = JSXAttrNamespace | JSXEventNamespace | JSXDirectiveNamespace;
export type JSXChildContentAttrName = '$innerHTML' | '$textContent' | '$innerText';
