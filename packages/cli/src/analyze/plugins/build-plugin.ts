import ts from 'typescript';

import { buildAttrsMeta } from '../meta/attrs';
import { TS_NODE } from '../meta/component';
import { buildCSSPartsMeta } from '../meta/cssparts';
import { buildCSSVarsMeta } from '../meta/cssvars';
import { getDocTags } from '../meta/doctags';
import { buildEventsMeta } from '../meta/events';
import { buildFileMeta } from '../meta/file';
import { buildMembersMeta } from '../meta/members';
import { buildPartsMeta } from '../meta/parts';
import { buildPropsMeta } from '../meta/props';
import { buildSlotsMeta } from '../meta/slots';
import { buildStateMeta } from '../meta/state';
import { getDocs } from '../utils/docs';
import type { AnalyzePlugin, ComponentNode, ElementNode } from './analyze-plugin';

export function createBuildPlugin(): AnalyzePlugin {
  let checker: ts.TypeChecker;
  return {
    name: 'maverick/build',
    async init(program: ts.Program) {
      checker = program.getTypeChecker();
    },
    async buildElement(node: ElementNode) {
      let doctags = getDocTags(node.root),
        filteredDoctags = doctags?.filter((tag) => tag.name !== 'slot' && tag.name !== 'csspart');
      return {
        [TS_NODE]: node.root,
        file: buildFileMeta(node.root),
        name: node.name,
        docs: getDocs(checker, node.root.name!),
        doctags: filteredDoctags?.length ? filteredDoctags : undefined,
        tag: {
          [TS_NODE]: node.tag.node,
          name: node.tag.name,
        },
        component: node.component
          ? { [TS_NODE]: node.component.node, name: node.component.name }
          : undefined,
        attrs: buildAttrsMeta(checker, node.attrs),
        cssparts: buildCSSPartsMeta(doctags),
        slots: buildSlotsMeta(doctags),
      };
    },
    async buildComponent(node: ComponentNode) {
      let doctags = getDocTags(node.root),
        filteredDoctags = doctags?.filter((tag) => tag.name !== 'cssvar' && tag.name !== 'part');
      return {
        [TS_NODE]: node.root,
        name: node.name,
        file: buildFileMeta(node.root),
        docs: getDocs(checker, node.root.name!),
        doctags: filteredDoctags?.length ? filteredDoctags : undefined,
        props: buildPropsMeta(checker, node.props, node.types.props),
        events: buildEventsMeta(checker, node.types.events),
        parts: buildPartsMeta(doctags),
        cssvars: buildCSSVarsMeta(checker, node.types.cssvars, doctags),
        state: buildStateMeta(checker, node.state, node.types.state),
        members: buildMembersMeta(checker, node.types.root, node.state, node.types.state),
      };
    },
  };
}
