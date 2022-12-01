import ts from 'typescript';

import type { ElementDefintionNode } from '../plugins/AnalyzePlugin';
import { getDocs } from '../utils/docs';
import { buildTypeMeta } from '../utils/types';
import {
  getPropertyAssignmentValue,
  getValueNode,
  walkProperties,
  walkSignatures,
} from '../utils/walk';
import { type CSSVarMeta, type DocTagMeta, TS_NODE } from './component';
import { buildMetaFromDocTags, findDocTag, getDocTags, hasDocTag } from './doctags';

export function buildCSSVarsMeta(
  checker: ts.TypeChecker,
  declarationRoot: ts.ObjectLiteralExpression,
  typeRoot?: ElementDefintionNode['types']['cssvars'],
  parentDocTags?: DocTagMeta[],
) {
  const meta = new Map<string, CSSVarMeta>(),
    vars = getValueNode(checker, getPropertyAssignmentValue(checker, declarationRoot, 'cssvars'));

  if (parentDocTags?.length) {
    const cssvars = buildMetaFromDocTags(
      parentDocTags,
      'cssvar',
      '@cssvar --bg-color - The background color of this component.',
    );

    for (const cssvar of cssvars) {
      meta.set(cssvar.name, cssvar);
    }
  }

  if (typeRoot) {
    const props = vars ? walkProperties(checker, vars) : null,
      members = walkSignatures(checker, typeRoot);

    for (const [name, prop] of members.props) {
      if (!prop.type) continue;

      const valueNode = props?.props.has(name)
          ? getValueNode(checker, props.props.get(name)!.value)
          : null,
        docs = getDocs(checker, prop.name as ts.Identifier),
        doctags = getDocTags(prop),
        type = buildTypeMeta(checker, prop.type);

      let internal!: CSSVarMeta['internal'],
        required!: CSSVarMeta['required'],
        deprecated!: CSSVarMeta['deprecated'],
        $default!: CSSVarMeta['default'],
        readonly: CSSVarMeta['readonly'] = valueNode ? ts.isArrowFunction(valueNode) : false;

      if (doctags) {
        if (hasDocTag(doctags, 'internal')) internal = true;
        if (hasDocTag(doctags, 'deprecated')) deprecated = true;
        if (hasDocTag(doctags, 'required')) required = true;
        if (hasDocTag(doctags, 'readonly')) readonly = true;
        $default =
          findDocTag(doctags, 'default')?.text ?? findDocTag(doctags, 'defaultValue')?.text ?? '';
      }

      if (!$default && valueNode) {
        $default = valueNode.getText();
      }

      meta.set(name, {
        [TS_NODE]: prop,
        name,
        default: $default,
        type,
        docs,
        doctags,
        internal,
        deprecated,
        readonly: readonly ? true : undefined,
        required,
      });
    }
  }

  return meta.size > 0 ? Array.from(meta.values()) : undefined;
}
