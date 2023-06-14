import ts from 'typescript';

import { LogLevel, reportDiagnosticByNode } from '../../utils/logger';
import { escapeQuotes } from '../../utils/str';
import { TS_NODE } from '../meta/component';
import { buildCSSPartsMeta } from '../meta/cssparts';
import { buildCSSVarsMeta } from '../meta/cssvars';
import { getDocTags } from '../meta/doctags';
import type { AttrsMeta } from '../meta/element';
import { buildEventsMeta } from '../meta/events';
import { buildFileMeta } from '../meta/file';
import { buildMembersMeta } from '../meta/members';
import { buildPropsMeta } from '../meta/props';
import { buildSlotsMeta } from '../meta/slots';
import { buildStateMeta } from '../meta/state';
import { getDocs } from '../utils/docs';
import { getProperties } from '../utils/walk';
import type { AnalyzePlugin, ComponentNode, ElementNode } from './analyze-plugin';

export function createBuildPlugin(): AnalyzePlugin {
  let checker: ts.TypeChecker;
  return {
    name: 'maverick/build',
    async init(program: ts.Program) {
      checker = program.getTypeChecker();
    },
    async buildElement(node: ElementNode) {
      const attrs: AttrsMeta = {};

      if (node.attrs) {
        const props = getProperties(checker, node.attrs.initializer!);
        for (const [propName, assignment] of props) {
          const attr = ts.isStringLiteral(assignment.initializer)
            ? assignment.initializer
            : getProperties(checker, assignment.initializer).get('attr')?.initializer;

          if (!attr || (!ts.isStringLiteral(attr) && attr.kind !== ts.SyntaxKind.FalseKeyword)) {
            reportDiagnosticByNode('expected string or false', assignment, LogLevel.Warn);
            continue;
          }

          attrs[propName] = {
            [TS_NODE]: assignment,
            attr: ts.isStringLiteral(attr) ? escapeQuotes(attr.getText()) : false,
          };
        }
      }

      return {
        [TS_NODE]: node.root,
        file: buildFileMeta(node.root),
        name: node.name,
        docs: getDocs(checker, node.root.name!),
        doctags: getDocTags(node.root),
        tag: {
          [TS_NODE]: node.tag.node,
          name: node.tag.name,
        },
        component: {
          [TS_NODE]: node.component.node,
          name: node.component.name,
        },
        attrs: Object.keys(attrs).length ? attrs : undefined,
      };
    },
    async buildComponent(node: ComponentNode) {
      let doctags = getDocTags(node.root),
        filteredDocTags = doctags?.filter(
          (tag) => tag.name !== 'slot' && tag.name !== 'cssvar' && tag.name !== 'csspart',
        );

      return {
        [TS_NODE]: node.root,
        name: node.name,
        file: buildFileMeta(node.root),
        docs: getDocs(checker, node.root.name!),
        doctags: filteredDocTags?.length ? filteredDocTags : undefined,
        props: buildPropsMeta(checker, node.props, node.types.props),
        events: buildEventsMeta(checker, node.types.events),
        cssvars: buildCSSVarsMeta(checker, node.types.cssvars, doctags),
        cssparts: buildCSSPartsMeta(doctags),
        slots: buildSlotsMeta(doctags),
        state: buildStateMeta(checker, node.state, node.types.state),
        members: buildMembersMeta(checker, node.types.root),
      };
    },
  };
}
