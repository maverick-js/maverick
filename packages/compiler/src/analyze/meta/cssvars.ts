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
  const meta = new Map<string, CSSVarMeta>();

  let vars: ts.Node | undefined;

  const setup = getValueNode(
    checker,
    getPropertyAssignmentValue(checker, declarationRoot, 'setup'),
  );

  // Find `host.setCSSVars(...)`
  if (
    setup &&
    (ts.isMethodDeclaration(setup) || ts.isArrowFunction(setup)) &&
    setup.body &&
    ts.isBlock(setup.body)
  ) {
    function findSetCSSVars(node: ts.Node) {
      if (
        ts.isCallExpression(node) &&
        ts.isPropertyAccessExpression(node.expression) &&
        ts.isIdentifier(node.expression.expression) &&
        node.expression.expression.escapedText === 'host' &&
        ts.isIdentifier(node.expression.name) &&
        node.expression.name.escapedText === 'setCSSVars' &&
        node.arguments[0]
      ) {
        vars = getValueNode(checker, node.arguments[0]);
      }

      ts.forEachChild(node, findSetCSSVars);
    }

    ts.forEachChild(setup.body, findSetCSSVars);
  }

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
      const signature = prop.signature;
      if (!prop.type && !signature.type) continue;

      const valueNode = props?.props.has(name)
          ? getValueNode(checker, props.props.get(name)!.value)
          : null,
        docs = getDocs(checker, signature.name as ts.Identifier),
        doctags = getDocTags(signature),
        type = buildTypeMeta(checker, signature.type!, prop.type);

      let internal!: CSSVarMeta['internal'],
        required!: CSSVarMeta['required'],
        deprecated!: CSSVarMeta['deprecated'],
        $default!: CSSVarMeta['default'],
        optional: CSSVarMeta['optional'] = !!signature.questionToken,
        readonly: CSSVarMeta['readonly'] =
          !!signature.modifiers?.some((mod) => mod.kind === ts.SyntaxKind.ReadonlyKeyword) ||
          (!!valueNode && (ts.isMethodDeclaration(valueNode) || ts.isArrowFunction(valueNode)));

      if (doctags) {
        if (hasDocTag(doctags, 'internal')) internal = true;
        if (hasDocTag(doctags, 'deprecated')) deprecated = true;
        if (hasDocTag(doctags, 'required')) required = true;
        if (!readonly && hasDocTag(doctags, 'readonly')) readonly = true;
        if (!optional && hasDocTag(doctags, 'optional')) optional = true;
        $default =
          findDocTag(doctags, 'default')?.text ?? findDocTag(doctags, 'defaultValue')?.text ?? '';
      }

      if (!$default && valueNode) {
        $default = valueNode.getText();
      }

      meta.set(name, {
        [TS_NODE]: signature,
        name,
        default: $default,
        type,
        docs,
        doctags,
        internal,
        deprecated,
        readonly: readonly ? true : undefined,
        optional: optional ? true : undefined,
        required,
      });
    }
  }

  return meta.size > 0 ? Array.from(meta.values()) : undefined;
}
