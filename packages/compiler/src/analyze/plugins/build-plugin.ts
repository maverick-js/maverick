import ts from 'typescript';

import { type ComponentMeta, TS_NODE } from '../meta/component';
import { buildCSSPartsMeta } from '../meta/cssparts';
import { buildCSSVarsMeta } from '../meta/cssvars';
import { getDocTags } from '../meta/doctags';
import { buildEventsMeta } from '../meta/events';
import { buildFileMeta } from '../meta/file';
import { buildMembersMeta } from '../meta/members';
import { buildPropsMeta } from '../meta/props';
import { buildSlotsMeta } from '../meta/slots';
import { buildStoreMeta } from '../meta/store';
import { getDocs } from '../utils/docs';
import { findPropertyAssignment, getValueNode } from '../utils/walk';
import type { AnalyzePlugin, ElementDefintionNode } from './AnalyzePlugin';

export function createBuildPlugin(): AnalyzePlugin {
  let checker: ts.TypeChecker;
  return {
    name: 'maverick/build',
    async init(program: ts.Program) {
      checker = program.getTypeChecker();
    },
    async build(def: ElementDefintionNode) {
      return buildComponentMeta(checker, def);
    },
  };
}

export function buildComponentMeta(
  checker: ts.TypeChecker,
  def: ElementDefintionNode,
): ComponentMeta {
  let doctags = getDocTags(def.root.node),
    store = buildStoreMeta(checker, def.api.store),
    members = buildMembersMeta(checker, def.root, store);
  return {
    [TS_NODE]: def.root.node,
    name: def.name,
    tag: def.tag,
    definition: { [TS_NODE]: def.el.definition },
    file: buildFileMeta(def.root.node),
    shadow: buildShadowRootMeta(checker, def.el.definition),
    docs: getDocs(checker, def.root.node.name!),
    doctags,
    props: buildPropsMeta(checker, def.el.definition, def.api.props),
    events: buildEventsMeta(checker, def.api.events),
    cssvars: buildCSSVarsMeta(checker, def.api.cssvars, doctags),
    cssparts: buildCSSPartsMeta(doctags),
    slots: buildSlotsMeta(doctags),
    store,
    members,
  };
}

function buildShadowRootMeta(checker: ts.TypeChecker, definition: ts.ObjectLiteralExpression) {
  const prop = findPropertyAssignment(definition, 'shadowRoot');
  const value = prop && getValueNode(checker, prop);
  return value && value?.kind !== ts.SyntaxKind.FalseKeyword;
}
