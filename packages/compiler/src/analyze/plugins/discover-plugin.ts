import ts from 'typescript';

import { LogLevel, reportDiagnosticByNode } from '../../utils/logger';
import { TS_NODE } from '../meta/component';
import {
  findPropertyAssignment,
  getHeritage,
  getPropertyAssignmentValue,
  getValueNode,
  isCallExpression,
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
        if (!ts.isClassDeclaration(node) || !node.name || !node.heritageClauses) return;

        const heritage = getHeritage(checker, node),
          component = heritage.get('Component');

        if (!component || !component.getSourceFile().fileName.includes('maverick')) return;

        let rootType = checker.getTypeAtLocation(node)!,
          apiSymbol = checker.getPropertyOfType(rootType, 'ts__api'),
          api: ElementDefintionNode['api'] = {};

        const ts__api = apiSymbol && checker.getTypeOfSymbol(apiSymbol);
        if (ts__api && ts__api.flags & ts.TypeFlags.Union) {
          const apiType = (ts__api as ts.UnionType).types[1];
          if (apiType) {
            api.root = apiType;
            const props = checker.getPropertiesOfType(apiType),
              validName = /props|events|cssvars|store/;
            for (const symbol of props) {
              const name = symbol.escapedName as string;
              if (validName.test(name)) {
                api[name] = checker.getTypeOfSymbol(symbol);
              }
            }
          }
        }

        let el: ts.PropertyDeclaration | undefined;

        for (const node of Array.from(heritage.values())) {
          el = node.members.find(
            (member) =>
              ts.isPropertyDeclaration(member) &&
              member.modifiers &&
              member.modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.StaticKeyword) &&
              ts.isIdentifier(member.name) &&
              member.name.escapedText === 'el',
          ) as ts.PropertyDeclaration;

          if (el) break;
        }

        if (!el) {
          reportDiagnosticByNode('missing static `el` property', node, LogLevel.Warn);
          return;
        }

        if (!el.initializer) {
          reportDiagnosticByNode('missing static `el` definition', el, LogLevel.Warn);
          return;
        }

        if (!isCallExpression(el.initializer, 'defineElement')) {
          reportDiagnosticByNode('expected `defineElement`', el.initializer, LogLevel.Warn);
          return;
        }

        const definition = el.initializer.arguments[0];

        if (!definition || !ts.isObjectLiteralExpression(definition)) {
          reportDiagnosticByNode(
            'expected object',
            el.initializer.arguments?.[0] ?? el.initializer,
            LogLevel.Warn,
          );
          return;
        }

        const tagNameNode = findPropertyAssignment(definition, 'tagName'),
          tagName = getValueNode(
            checker,
            getPropertyAssignmentValue(checker, definition, 'tagName'),
          );

        if (!tagNameNode) {
          reportDiagnosticByNode('missing `tagName`', definition, LogLevel.Warn);
          return;
        }

        if (!tagName || !ts.isStringLiteral(tagName)) {
          reportDiagnosticByNode('`tagName` must be a string literal', tagNameNode, LogLevel.Warn);
          return;
        }

        definitions.push({
          name: node.name.escapedText as string,
          root: { node, type: rootType },
          tag: { [TS_NODE]: tagNameNode, name: tagName.text },
          el: { node: el, definition },
          api,
        });
      });

      return definitions;
    },
  };
}
