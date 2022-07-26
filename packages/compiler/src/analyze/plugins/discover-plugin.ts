import ts from 'typescript';

import { LogLevel, reportDiagnosticByNode } from '../../utils/logger';
import { TS_NODE } from '../meta/component';
import { getDeclaration } from '../utils/declaration';
import {
  findPropertyAssignment,
  getPropertyAssignmentValue,
  getValueNode,
  isCallExpression,
  isExportedVariableStatement,
  walkSignatures,
} from '../utils/walk';
import type { AnalyzePlugin, ElementDefintionNode } from './AnalyzePlugin';

const ignoredTypeIdentifiers = new Set(['HTMLElement', 'HTMLCustomElement']);

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
          isCallExpression(exportVar.initializer, 'defineCustomElement') &&
          exportVar.initializer.typeArguments?.[0] &&
          ts.isTypeReferenceNode(exportVar.initializer.typeArguments[0]) &&
          ts.isIdentifier(exportVar.initializer.typeArguments[0].typeName)
        ) {
          const declaration = exportVar.initializer.arguments[0],
            rootType = getDeclaration(checker, exportVar.initializer.typeArguments[0].typeName),
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
          } else if (
            !rootType ||
            (!ts.isInterfaceDeclaration(rootType) && !ts.isTypeAliasDeclaration(rootType))
          ) {
            reportDiagnosticByNode(
              'type passed to `defineCustomElement` must be an interface or type alias',
              exportVar.initializer.typeArguments[0],
              LogLevel.Warn,
            );
          } else {
            const members = walkSignatures(checker, rootType, undefined, ignoredTypeIdentifiers);
            const CustomElement = members.heritage.get('HTMLCustomElement');

            if (!CustomElement || !ts.isExpressionWithTypeArguments(CustomElement)) {
              reportDiagnosticByNode(
                'type given to `defineCustomElement` must extend `HTMLCustomElement`',
                exportVar.initializer.typeArguments[0],
                LogLevel.Warn,
              );

              return;
            }

            definitions.push({
              name: rootType.name.escapedText as string,
              tag: {
                [TS_NODE]: tagNameNode,
                name: tagName.text,
              },
              statement: node,
              variable: exportVar,
              call: exportVar.initializer,
              declaration,
              members,
              types: {
                root: rootType,
                props: CustomElement.typeArguments?.[0] as ts.TypeLiteralNode,
                events: CustomElement.typeArguments?.[1] as ts.TypeLiteralNode,
                cssvars: CustomElement.typeArguments?.[2] as ts.TypeLiteralNode,
              },
            });
          }
        }
      });

      return definitions;
    },
  };
}
