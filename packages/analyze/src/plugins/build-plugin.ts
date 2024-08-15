import ts from 'typescript';

import { buildAttrsMeta } from '../meta/attrs';
import { buildCSSPartsMeta } from '../meta/cssparts';
import { buildCSSVarsMeta } from '../meta/cssvars';
import { getDocTags } from '../meta/doctags';
import { buildEventsMeta } from '../meta/events';
import { buildFileMeta } from '../meta/file';
import { buildGenericsMeta } from '../meta/generics';
import { buildMembersMeta } from '../meta/members';
import { buildPartsMeta } from '../meta/parts';
import { buildPropMeta, buildPropsMeta, resolvePropTags } from '../meta/props';
import type { ReactCallbackMeta, ReactPropMeta } from '../meta/react';
import { buildSlotsMeta } from '../meta/slots';
import { buildStateMeta } from '../meta/state';
import { TS_NODE } from '../meta/symbols';
import { getDocs } from '../utils/docs';
import { buildTypeMeta, serializeType } from '../utils/types';
import type {
  AnalyzePlugin,
  ComponentNode,
  CustomElementNode,
  ReactComponentNode,
} from './analyze-plugin';

export function createBuildPlugin(): AnalyzePlugin {
  let checker: ts.TypeChecker;
  return {
    name: 'maverick/build',
    async init(program: ts.Program) {
      checker = program.getTypeChecker();
    },
    async buildComponentMeta(node: ComponentNode) {
      let doctags = getDocTags(node.root),
        filteredDoctags = doctags?.filter((tag) => tag.name !== 'cssvar' && tag.name !== 'part');
      return {
        [TS_NODE]: node.root,
        type: 'component',
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
        generics: buildGenericsMeta(checker, node.types.props, node.types.state, node.types.events),
      };
    },
    async buildCustomElementMeta(node: CustomElementNode) {
      let doctags = getDocTags(node.root),
        filteredDoctags = doctags?.filter((tag) => tag.name !== 'slot' && tag.name !== 'csspart');
      return {
        [TS_NODE]: node.root,
        type: 'element',
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
    async buildReactComponentMeta(node: ReactComponentNode) {
      const props: ReactPropMeta[] = [],
        callbacks: ReactCallbackMeta[] = [];

      if (node.types.props) {
        for (const prop of node.types.props.getProperties()) {
          if (isThirdPartyType(prop)) continue;

          const signature = prop.declarations?.[0];
          if (!signature) continue;

          if (isReactProp(prop.name)) {
            if (ts.isPropertySignature(signature)) {
              const meta = buildPropMeta(checker, prop.name, signature, {
                type: checker.getTypeOfSymbol(prop),
              });
              if (meta) props.push(meta);
            }
          } else if (isReactCallback(prop.name)) {
            const callback = buildReactCallback(checker, signature);
            if (callback) callbacks.push(callback);
          }
        }
      }

      return {
        [TS_NODE]: node.root,
        type: 'react',
        file: buildFileMeta(node.root),
        namespace: node.namespace,
        exports: node.exports,
        name: node.name,
        displayName: node.displayName,
        docs: getDocs(checker, node.identifier),
        doctags: getDocTags(node.statement ?? node.root),
        instance: node.instance,
        attributes: node.attributes,
        props: props?.length ? props : undefined,
        propsType: node.types.props ? serializeType(checker, node.types.props) : undefined,
        callbacks: callbacks?.length ? callbacks : undefined,
        ref: node.types.ref ? { type: buildTypeMeta(checker, node.types.ref) } : undefined,
      };
    },
  };
}

const ignoredReactProps = new Set(['style', 'part', 'ref']);
function isReactProp(name: string) {
  return !isReactCallback(name) && !ignoredReactProps.has(name);
}

function isReactCallback(name: string) {
  return name.startsWith('on');
}

function isReactCallbackNode(node: ts.Node): node is ts.PropertySignature | ts.MethodSignature {
  return (
    ts.isMethodSignature(node) ||
    (ts.isPropertySignature(node) && !!node.type && ts.isFunctionTypeNode(node.type))
  );
}

const cwd = process.cwd();
function isThirdPartyType(prop: ts.Symbol) {
  const parent = prop.declarations?.[0].parent,
    file = parent?.getSourceFile().fileName;
  return file && !file.startsWith(cwd);
}

function buildReactCallback(checker: ts.TypeChecker, node: ts.Node): ReactCallbackMeta | undefined {
  if (!isReactCallbackNode(node)) return;

  let identifier = node.name as ts.Identifier,
    doctags = getDocTags(node),
    { internal, deprecated } = resolvePropTags(doctags),
    parameters: ts.NodeArray<ts.ParameterDeclaration> | undefined;

  if (ts.isMethodSignature(node)) {
    parameters = node.parameters;
  } else if (ts.isPropertySignature(node) && node.type && ts.isFunctionTypeNode(node.type)) {
    parameters = node.type.parameters;
  }

  return {
    [TS_NODE]: node,
    name: identifier.escapedText as string,
    docs: getDocs(checker, identifier),
    doctags,
    type: buildTypeMeta(checker, checker.getTypeAtLocation(node)),
    parameters: parameters
      ?.filter((param) => ts.isIdentifier(param.name) && param.type)
      .map((param) => ({
        [TS_NODE]: param,
        name: (param.name as ts.Identifier).escapedText as string,
        type: buildTypeMeta(checker, checker.getTypeAtLocation(param)),
      })),
    internal,
    deprecated,
  };
}
