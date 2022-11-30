import ts from 'typescript';

import { LogLevel, reportDiagnosticByNode } from '../../utils/logger';
import { TS_NODE } from '../meta/component';
import {
  findPropertyAssignment,
  getPropertyAssignmentValue,
  getValueNode,
  isCallExpression,
  isExportedVariableStatement,
} from '../utils/walk';
import type { AnalyzePlugin, ElementDefintionNode } from './AnalyzePlugin';

export function createDiscoverPlugin(): AnalyzePlugin {
  let checker: ts.TypeChecker;
  return {
    name: 'maverick/discover',
    async init(program: ts.Program) {
      checker = program.getTypeChecker();
    },
    async discover(sourceFile: ts.SourceFile) {
      const definitions: ElementDefintionNode[] = [];

      ts.forEachChild(sourceFile, (node: ts.Node) => {
        let exportVar: ts.VariableDeclaration | undefined;

        if (
          isExportedVariableStatement(node) &&
          (exportVar = node.declarationList.declarations[0]) &&
          ts.isIdentifier(exportVar.name) &&
          exportVar.initializer &&
          isCallExpression(exportVar.initializer, 'defineElement')
        ) {
          const declaration = exportVar.initializer.arguments[0],
            isObjectLiteral = declaration && ts.isObjectLiteralExpression(declaration),
            tagNameNode = isObjectLiteral && findPropertyAssignment(declaration, 'tagName'),
            tagName = isObjectLiteral
              ? getValueNode(checker, getPropertyAssignmentValue(checker, declaration, 'tagName'))
              : undefined;

          if (!tagNameNode) {
            reportDiagnosticByNode('element def is missing `tagName`', exportVar, LogLevel.Warn);
          } else if (!tagName || !ts.isStringLiteral(tagName)) {
            reportDiagnosticByNode(
              'element def `tagName` must be a string literal',
              tagNameNode,
              LogLevel.Warn,
            );
          } else {
            definitions.push({
              name: exportVar.name.escapedText as string,
              tagName: {
                [TS_NODE]: tagNameNode,
                name: tagName.text,
              },
              statement: node,
              variable: exportVar,
              call: exportVar.initializer,
              declaration,
            });
          }
        }
      });

      return definitions;
    },
  };
}
