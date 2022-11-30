import type MagicString from 'magic-string';
import ts from 'typescript';

import { logTime } from '../../utils/logger';
import { hasChildType } from '../../utils/ts';
import type { AST } from '../ast';
import { buildAST } from './parse';

export type ParseJSXOptions = {
  filename: string;
};

const tsxRE = /\.tsx/;

export function parseJSX(code: MagicString, options: Partial<ParseJSXOptions> = {}) {
  const { filename = '' } = options;

  const parseStartTime = process.hrtime();
  const sourceFile = ts.createSourceFile(
    filename,
    code.original,
    99,
    true,
    tsxRE.test(filename) ? 4 : 2,
  );
  logTime('Parsed Source File (TS)', parseStartTime);

  const ast: AST[] = [];

  let lastImportNode: ts.Node | undefined;
  const parse = (node: ts.Node) => {
    if (ts.isBinaryExpression(node) || ts.isConditionalExpression(node)) {
      const hasJSXChild = hasChildType(
        node,
        (node) => isJSXElementNode(node) || ts.isJsxFragment(node),
      );

      if (hasJSXChild) {
        ast.push(buildAST(node, {}));
      }

      return;
    } else if (isJSXElementNode(node) || ts.isJsxFragment(node)) {
      ast.push(buildAST(node, {}));
      return;
    }

    ts.forEachChild(node, parse);
  };

  ts.forEachChild(sourceFile, parse);

  return {
    startPos: lastImportNode?.getEnd() ?? 0,
    ast,
  };
}

export function isJSXElementNode(node: ts.Node): node is JSXElementNode {
  return ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node);
}

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

export type JSXAttrNamespace = '$class' | '$cssvar' | '$prop' | '$style';
export type JSXEventNamespace = '$on' | '$oncapture';
export type JSXDirectiveNamespace = '$use';
export type JSXNamespace = JSXAttrNamespace | JSXEventNamespace | JSXDirectiveNamespace;
export type JSXChildContentAttrName = '$innerHTML' | '$textContent' | '$innerText';
