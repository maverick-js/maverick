import ts from 'typescript';

import { getDocs } from '../utils/docs';
import { buildTypeMeta } from '../utils/types';
import {
  getPropertyAssignmentValue,
  getReturnExpression,
  getValueNode,
  isCallExpression,
  walkProperties,
  walkSignatures,
} from '../utils/walk';
import { type CSSVarMeta, type DocTagMeta, TS_NODE } from './component';
import { buildMetaFromDocTags, findDocTag, getDocTags, hasDocTag } from './doctags';

export function buildCSSVarsMeta(
  checker: ts.TypeChecker,
  root: ts.ObjectLiteralExpression,
  parentDocTags?: DocTagMeta[],
) {
  const meta = new Map<string, CSSVarMeta>(),
    defs = getValueNode(checker, getPropertyAssignmentValue(checker, root, 'cssvars'));

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

  if (defs && isCallExpression(defs, 'defineCSSVars')) {
    const signature = defs.typeArguments?.[0] ? defs.typeArguments[0] : undefined;
    if (signature) {
      const members = walkSignatures(checker, signature);
      for (const [name, prop] of members.props) {
        const docs = getDocs(checker, prop.name as ts.Identifier),
          doctags = getDocTags(prop),
          type = buildTypeMeta(checker, prop, prop.type);

        let internal!: CSSVarMeta['internal'],
          required!: CSSVarMeta['required'],
          deprecated!: CSSVarMeta['deprecated'],
          readonly!: CSSVarMeta['readonly'];

        if (doctags) {
          if (hasDocTag(doctags, 'internal')) internal = true;
          if (hasDocTag(doctags, 'deprecated')) deprecated = true;
          if (hasDocTag(doctags, 'required')) required = true;
          if (hasDocTag(doctags, 'readonly')) readonly = true;
        }

        meta.set(name, {
          [TS_NODE]: prop,
          name,
          type,
          docs,
          doctags,
          internal,
          deprecated,
          readonly,
          required,
        });
      }
    }
  } else if (defs && (ts.isFunctionDeclaration(defs) || ts.isArrowFunction(defs))) {
    const expression = getReturnExpression(defs);
    if (expression) walkCSSVars(checker, expression, meta);
  } else if (defs) {
    walkCSSVars(checker, defs, meta);
  }

  return meta.size > 0 ? Array.from(meta.values()) : undefined;
}

function walkCSSVars(checker: ts.TypeChecker, root: ts.Node, meta: Map<string, CSSVarMeta>) {
  const members = walkProperties(checker, root);

  for (const [name, node] of members.props) {
    const value = getValueNode(checker, node.value) ?? node.value,
      isDefineProp = isCallExpression(value, 'defineCSSVar'),
      initial = isDefineProp ? getValueNode(checker, value.arguments[0]) : value,
      docs = getDocs(checker, node.assignment.name as ts.Identifier),
      doctags = getDocTags(node.assignment);

    let internal!: CSSVarMeta['internal'],
      $default!: CSSVarMeta['default'],
      required!: CSSVarMeta['required'],
      deprecated!: CSSVarMeta['deprecated'],
      readonly!: CSSVarMeta['readonly'];

    if (doctags) {
      if (hasDocTag(doctags, 'internal')) internal = true;
      if (hasDocTag(doctags, 'deprecated')) deprecated = true;
      if (hasDocTag(doctags, 'required')) required = true;
      if (hasDocTag(doctags, 'readonly')) readonly = true;
      $default =
        findDocTag(doctags, 'default')?.text ?? findDocTag(doctags, 'defaultValue')?.text ?? '';
    }

    if (initial && ts.isArrowFunction(initial)) readonly = true;
    if (!$default) $default = initial?.getText() ?? '';

    const generic = isDefineProp && value.typeArguments?.[0] ? value.typeArguments[0] : undefined,
      type = buildTypeMeta(checker, value, generic);

    meta.set(name, {
      [TS_NODE]: node.assignment,
      name,
      default: $default,
      type,
      docs,
      doctags,
      internal,
      required,
      deprecated,
      readonly,
    });
  }
}
