import { logTime } from '@maverick-js/logger';
import {
  findImportSpecifierFromDeclaration,
  isJsxElementNode,
  isValueImportDeclarationFrom,
  isValueImportSpecifier,
} from '@maverick-js/ts';
import ts from 'typescript';

import type { ParseAnalysis } from './analysis';
import { type AstNode, isNoopNode } from './ast';
import { createAstNode } from './create-ast';

export interface ParseOptions {
  filename: string;
}

const tsxRE = /\.tsx/;

export function parse(code: string, options: ParseOptions) {
  let { filename } = options,
    analysis: ParseAnalysis = { components: {} },
    parseStartTime = process.hrtime(),
    sourceFile = ts.createSourceFile(filename, code, 99, true, tsxRE.test(filename) ? 4 : 2),
    astNodes: AstNode[] = [];

  logTime({
    message: `Parsed Source File (TS): ${filename}`,
    startTime: parseStartTime,
  });

  const parse = (node: ts.Node) => {
    if (isValueImportDeclarationFrom(node, 'maverick.js')) {
      const Fragment = findImportSpecifierFromDeclaration(node, 'Fragment'),
        Portal = findImportSpecifierFromDeclaration(node, 'Portal'),
        For = findImportSpecifierFromDeclaration(node, 'For'),
        Host = findImportSpecifierFromDeclaration(node, 'Host');

      if (isValueImportSpecifier(Fragment)) analysis.components.Fragment = Fragment;
      if (isValueImportSpecifier(Portal)) analysis.components.Portal = Portal;
      if (isValueImportSpecifier(For)) analysis.components.For = For;
      if (isValueImportSpecifier(Host)) analysis.components.Host = Host;
    }

    if (isJsxElementNode(node)) {
      const astNode = createAstNode(node);

      astNodes.push(astNode);
      return;
    } else if (ts.isJsxFragment(node)) {
      astNodes.push(createAstNode(node));
      return;
    }

    ts.forEachChild(node, parse);
  };

  ts.forEachChild(sourceFile, parse);

  return {
    analysis,
    sourceFile,
    nodes: astNodes.filter((node) => !isNoopNode(node)),
  };
}
