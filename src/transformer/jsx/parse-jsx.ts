import * as t from 'typescript';
import { buildAST } from './parse';
import type { AST } from '../ast';
import { Stats } from '../../utils/stats';

export type ParseJSXOptions = {
  filename: string;
  stats: Stats | null;
};

const tsxRE = /\.tsx/;

export function parseJSX(
  source: string,
  options: Partial<ParseJSXOptions> = {},
): [start: number, ast: AST[]] {
  const { filename = '', stats } = options;

  stats?.start('ts_parse');
  const sourceFile = t.createSourceFile(
    filename,
    source,
    t.ScriptTarget.ESNext,
    true,
    tsxRE.test(filename) ? t.ScriptKind.TSX : t.ScriptKind.JSX,
  );
  stats?.stop('ts_parse');

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

  stats?.start('parse');
  t.forEachChild(sourceFile, parse);
  stats?.stop('parse');

  return [lastImportNode?.getEnd() ?? 0, ast];
}

export function isJSXElementNode(node: t.Node): node is JSXElementNode {
  return t.isJsxElement(node) || t.isJsxSelfClosingElement(node);
}

export type JSXElementNode = t.JsxElement | t.JsxSelfClosingElement;
export type JSXRootNode = JSXElementNode | t.JsxFragment;

export type JSXNodeMeta = {
  parent?: JSXNodeMeta;
  isSVGChild?: boolean;
  dynamic?: () => void;
};

export type JSXAttrNamespace = '$attr' | '$class' | '$cssvar' | '$prop' | '$style';
export type JSXEventNamespace = '$on' | '$oncapture';
export type JSXDirectiveNamespace = '$use';
export type JSXNamespace = JSXAttrNamespace | JSXEventNamespace | JSXDirectiveNamespace;
export type JSXChildContentAttrName = '$innerHTML' | '$textContent' | '$innerText';
