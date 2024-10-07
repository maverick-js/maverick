import ts from 'typescript';

import { escapeQuotes } from '../../utils/str';
import { getDeclaration } from '../utils/declaration';
import { getDocs } from '../utils/docs';
import { buildTypeMeta, serializeType } from '../utils/types';
import type { EventMeta } from './component';
import { getDocTags, hasDocTag } from './doctags';
import { TS_NODE_SYMBOL } from './symbols';

const filteredTagNames = new Set(['internal', 'deprecated', 'bubbles', 'composed', 'cancellable']);

export function buildEventsMeta(checker: ts.TypeChecker, typesRoot?: ts.Type) {
  if (!typesRoot) return;

  const meta = new Map<string, EventMeta>();

  for (const symbol of checker.getPropertiesOfType(typesRoot)) {
    const signature = symbol.declarations?.[0];
    if (!signature || !ts.isPropertySignature(signature) || !signature.name) continue;

    const name = escapeQuotes(signature.name.getText()),
      isTypeReference =
        signature.type &&
        ts.isTypeReferenceNode(signature.type!) &&
        ts.isIdentifier(signature.type.typeName),
      declaration = isTypeReference ? getDeclaration(checker, signature.type.typeName) : undefined,
      docs =
        getDocs(checker, signature.name as ts.Identifier) ??
        (isTypeReference ? getDocs(checker, signature.type.typeName) : undefined),
      doctags = getDocTags(signature) ?? (isTypeReference ? getDocTags(declaration) : undefined),
      filteredDoctags = doctags?.filter((tag) => !filteredTagNames.has(tag.name)),
      type = buildTypeMeta(checker, checker.getTypeOfSymbol(symbol));

    let internal!: EventMeta['internal'],
      deprecated!: EventMeta['deprecated'],
      bubbles!: EventMeta['bubbles'],
      composed!: EventMeta['composed'],
      cancellable!: EventMeta['cancellable'];

    const detailType = signature.type
        ? checker.getPropertyOfType(checker.getTypeAtLocation(signature.type!), 'detail')
        : null,
      detail =
        detailType && detailType.declarations?.[0]
          ? buildTypeMeta(
              checker,
              checker.getTypeOfSymbolAtLocation(detailType, detailType.declarations[0]),
            )
          : {
              concise: 'unknown',
              primitive: 'unknown',
              full: 'unknown',
            };

    if (doctags) {
      if (hasDocTag(doctags, 'internal')) internal = true;
      if (hasDocTag(doctags, 'deprecated')) deprecated = true;
      if (hasDocTag(doctags, 'bubbles')) bubbles = true;
      if (hasDocTag(doctags, 'composed')) composed = true;
      if (hasDocTag(doctags, 'cancellable')) cancellable = true;
    }

    meta.set(name, {
      [TS_NODE_SYMBOL]: signature,
      name,
      type,
      detail,
      docs,
      doctags: filteredDoctags?.length ? filteredDoctags : undefined,
      bubbles,
      composed,
      cancellable,
      internal,
      deprecated,
    });
  }

  return meta.size > 0 ? Array.from(meta.values()) : undefined;
}
