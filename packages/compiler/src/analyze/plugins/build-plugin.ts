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
  const identifier = def.variable.name as ts.Identifier;
  const doctags = getDocTags(def.statement);
  return {
    [TS_NODE]: def.statement,
    name: def.name,
    tagname: def.tagName,
    file: buildFileMeta(def.statement),
    shadow: buildShadowRootMeta(checker, def.declaration),
    docs: getDocs(checker, identifier),
    doctags,
    props: buildPropsMeta(checker, def.declaration),
    events: buildEventsMeta(checker, def.declaration, doctags),
    cssvars: buildCSSVarsMeta(checker, def.declaration, doctags),
    cssparts: buildCSSPartsMeta(doctags),
    slots: buildSlotsMeta(doctags),
    members: buildMembersMeta(checker, def.declaration),
  };
}

function buildShadowRootMeta(checker: ts.TypeChecker, declaration: ts.ObjectLiteralExpression) {
  const prop = findPropertyAssignment(declaration, 'shadowRoot');
  const value = prop && getValueNode(checker, prop);
  return value && value?.kind !== ts.SyntaxKind.FalseKeyword;
}
