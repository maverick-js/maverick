import ts from 'typescript';

import { logTime } from '../utils/logger';
import type { AST } from './ast';
import { buildAST } from './build-ast';
import { isJSXElementNode, walk } from './utils';

export interface ParseJSXOptions {
  filename: string;
}

const tsxRE = /\.tsx/;

export function parse(code: string, options: ParseJSXOptions) {
  const { filename } = options,
    parseStartTime = process.hrtime(),
    sourceFile = ts.createSourceFile(filename, code, 99, true, tsxRE.test(filename) ? 4 : 2),
    jsx: AST[] = [];

  logTime({
    message: `Parsed Source File (TS): ${filename}`,
    startTime: parseStartTime,
  });

  const parse = (node: ts.Node) => {
    if (ts.isBinaryExpression(node) || ts.isConditionalExpression(node)) {
      const hasJSXChild = walk(node, (node) => isJSXElementNode(node) || ts.isJsxFragment(node));

      if (hasJSXChild) {
        jsx.push(buildAST(node, {}));
      }

      return;
    } else if (isJSXElementNode(node) || ts.isJsxFragment(node)) {
      jsx.push(buildAST(node, {}));
      return;
    }

    ts.forEachChild(node, parse);
  };

  ts.forEachChild(sourceFile, parse);

  return {
    sourceFile,
    jsx,
  };
}
