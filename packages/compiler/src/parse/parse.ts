import ts from 'typescript';

import { logTime } from '../utils/logger';
import type { ASTNode } from './ast';
import { createASTNode } from './create-ast';
import { isJsxElementNode, walkTsNode } from './utils';

export interface ParseOptions {
  filename: string;
}

const tsxRE = /\.tsx/;

export function parse(code: string, options: ParseOptions) {
  const { filename } = options,
    parseStartTime = process.hrtime(),
    sourceFile = ts.createSourceFile(filename, code, 99, true, tsxRE.test(filename) ? 4 : 2),
    jsx: ASTNode[] = [];

  logTime({
    message: `Parsed Source File (TS): ${filename}`,
    startTime: parseStartTime,
  });

  const parse = (node: ts.Node) => {
    if (ts.isBinaryExpression(node) || ts.isConditionalExpression(node)) {
      const containsJsx = walkTsNode(
        node,
        (node) => isJsxElementNode(node) || ts.isJsxFragment(node),
      );

      if (containsJsx) {
        jsx.push(createASTNode(node));
      }

      return;
    } else if (isJsxElementNode(node) || ts.isJsxFragment(node)) {
      jsx.push(createASTNode(node));
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
