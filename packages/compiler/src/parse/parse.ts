import { logTime } from '@maverick-js/logger';
import {
  findClassThatExtendsModuleExport,
  findImportSpecifierFromDeclaration,
  findStaticProp,
  getTagName,
  isClassThatExtendsModuleExport,
  isJsxElementNode,
  isValueImportDeclarationFrom,
  isValueImportSpecifier,
  type JsxRootNode,
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
  const { filename } = options,
    analysis: ParseAnalysis = {
      components: {},
      tagNames: new WeakMap(),
    },
    parseStartTime = process.hrtime(),
    sourceFile = ts.createSourceFile(filename, code, 99, true, tsxRE.test(filename) ? 4 : 2),
    astNodes: AstNode[] = [],
    jsxNodes: JsxRootNode[] = [];

  logTime({
    message: `Parsed Source File (TS): ${filename}`,
    startTime: parseStartTime,
  });

  const parse = (node: ts.Node) => {
    if (isValueImportDeclarationFrom(node, 'maverick.js')) {
      const Fragment = findImportSpecifierFromDeclaration(node, 'Fragment'),
        Portal = findImportSpecifierFromDeclaration(node, 'Portal'),
        For = findImportSpecifierFromDeclaration(node, 'For'),
        Component = findImportSpecifierFromDeclaration(node, 'Component');

      if (isValueImportSpecifier(Fragment)) analysis.components.fragment = Fragment;
      if (isValueImportSpecifier(Portal)) analysis.components.portal = Portal;
      if (isValueImportSpecifier(For)) analysis.components.for = For;
      if (isValueImportSpecifier(Component)) analysis.components.component = Component;
    }

    if (isJsxElementNode(node)) {
      if (getTagName(node) === 'host') {
        const componentImportId = analysis.components.component?.name;
        if (componentImportId) {
          const parentClass = findClassThatExtendsModuleExport(node, componentImportId),
            tagName = findStaticProp(parentClass, 'tagName');
          if (tagName?.initializer) {
            analysis.tagNames.set(node, tagName.initializer);
          }
        }
      }

      jsxNodes.push(node);
      return;
    } else if (ts.isJsxFragment(node)) {
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
