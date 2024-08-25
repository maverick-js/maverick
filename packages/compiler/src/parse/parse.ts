import ts from 'typescript';

import { logTime } from '../utils/logger';
import type { ParseAnalysis } from './analysis';
import { type AstNode, isNoopNode } from './ast';
import { createAstNode } from './create-ast';
import type { JsxRootNode } from './jsx/types';
import { getImportSpecifierFromDeclaration, isJsxElementNode } from './utils';

export interface ParseOptions {
  filename: string;
}

const tsxRE = /\.tsx/;

export function parse(code: string, options: ParseOptions) {
  const { filename } = options,
    analysis: ParseAnalysis = { components: {} },
    parseStartTime = process.hrtime(),
    sourceFile = ts.createSourceFile(filename, code, 99, true, tsxRE.test(filename) ? 4 : 2),
    astNodes: AstNode[] = [],
    jsxNodes: JsxRootNode[] = [];

  logTime({
    message: `Parsed Source File (TS): ${filename}`,
    startTime: parseStartTime,
  });

  const parse = (node: ts.Node) => {
    if (ts.isImportDeclaration(node)) {
      const Fragment = getImportSpecifierFromDeclaration(node, 'maverick.js', 'Fragment'),
        Portal = getImportSpecifierFromDeclaration(node, 'maverick.js', 'Portal'),
        For = getImportSpecifierFromDeclaration(node, 'maverick.js', 'For');

      if (Fragment) analysis.components.fragment = Fragment;
      if (Portal) analysis.components.portal = Portal;
      if (For) analysis.components.for = For;
    }

    if (isJsxElementNode(node) || ts.isJsxFragment(node)) {
      jsxNodes.push(node);
      return;
    }

    ts.forEachChild(node, parse);
  };

  ts.forEachChild(sourceFile, parse);

  for (const jsxNode of jsxNodes) {
    astNodes.push(createAstNode(jsxNode));
  }

  return {
    analysis,
    sourceFile,
    nodes: astNodes.filter((node) => !isNoopNode(node)),
  };
}
