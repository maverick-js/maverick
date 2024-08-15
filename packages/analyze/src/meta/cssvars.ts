import ts from 'typescript';

import { escapeQuotes } from '../../utils/str';
import { getDocs } from '../utils/docs';
import { buildTypeMeta } from '../utils/types';
import type { CSSVarMeta, DocTagMeta } from './component';
import { buildMetaFromDocTags, findDocTag, getDocTags, hasDocTag } from './doctags';
import { TS_NODE } from './symbols';

const filteredTagNames = new Set([
  'internal',
  'required',
  'deprecated',
  'default',
  'defaultValue',
  'optional',
  'readonly',
]);

export function buildCSSVarsMeta(
  checker: ts.TypeChecker,
  typeRoot?: ts.Type,
  parentDocTags?: DocTagMeta[],
) {
  const meta = new Map<string, CSSVarMeta>();

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
    for (const symbol of checker.getPropertiesOfType(typeRoot)) {
      const signature = symbol.declarations?.[0];
      if (!signature || !ts.isPropertySignature(signature) || !signature.name) continue;

      const name = escapeQuotes(signature.name.getText()),
        docs = getDocs(checker, signature.name as ts.Identifier),
        doctags = getDocTags(signature),
        filteredDoctags = doctags?.filter((tag) => !filteredTagNames.has(tag.name)),
        type = buildTypeMeta(checker, checker.getTypeOfSymbol(symbol));

      let internal!: CSSVarMeta['internal'],
        required!: CSSVarMeta['required'],
        deprecated!: CSSVarMeta['deprecated'],
        $default!: CSSVarMeta['default'],
        optional: CSSVarMeta['optional'] = !!signature.questionToken,
        readonly: CSSVarMeta['readonly'] = !!signature.modifiers?.some(
          (mod) => mod.kind === ts.SyntaxKind.ReadonlyKeyword,
        );

      if (doctags) {
        if (hasDocTag(doctags, 'internal')) internal = true;
        if (hasDocTag(doctags, 'deprecated')) deprecated = true;
        if (hasDocTag(doctags, 'required')) required = true;
        if (!readonly && hasDocTag(doctags, 'readonly')) readonly = true;
        if (!optional && hasDocTag(doctags, 'optional')) optional = true;
        $default =
          findDocTag(doctags, 'default')?.text ?? findDocTag(doctags, 'defaultValue')?.text ?? '';
      }

      meta.set(name, {
        [TS_NODE]: signature,
        name,
        default: $default,
        type,
        docs,
        doctags: filteredDoctags?.length ? filteredDoctags : undefined,
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
