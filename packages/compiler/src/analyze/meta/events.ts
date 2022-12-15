import ts from 'typescript';

import type { ElementDefintionNode } from '../plugins/AnalyzePlugin';
import { getDeclaration } from '../utils/declaration';
import { getDocs } from '../utils/docs';
import { buildTypeMeta } from '../utils/types';
import { walkSignatures } from '../utils/walk';
import { type EventMeta, TS_NODE } from './component';
import { getDocTags, hasDocTag } from './doctags';

export function buildEventsMeta(
  checker: ts.TypeChecker,
  typesRoot?: ElementDefintionNode['types']['events'],
) {
  if (!typesRoot) return;

  const meta = new Map<string, EventMeta>(),
    members = walkSignatures(checker, typesRoot);

  for (const [name, prop] of members.props) {
    const signature = prop.signature;
    if (!prop.type && !signature.type) continue;

    const isTypeReference =
        signature.type &&
        ts.isTypeReferenceNode(signature.type!) &&
        ts.isIdentifier(signature.type.typeName),
      declaration = isTypeReference ? getDeclaration(checker, signature.type.typeName) : undefined,
      docs =
        getDocs(checker, signature.name as ts.Identifier) ??
        (isTypeReference ? getDocs(checker, signature.type.typeName) : undefined),
      doctags = getDocTags(signature) ?? (isTypeReference ? getDocTags(declaration) : undefined),
      type = buildTypeMeta(checker, signature.type!, prop.type);

    let internal!: EventMeta['internal'],
      deprecated!: EventMeta['deprecated'],
      bubbles!: EventMeta['bubbles'],
      composed!: EventMeta['composed'],
      cancellable!: EventMeta['cancellable'];

    const domEvent = type.serialized.startsWith('DOMEvent')
      ? type.serialized
      : declaration && ts.isInterfaceDeclaration(declaration)
      ? declaration.heritageClauses?.[0]?.types
          .find(
            (type) =>
              ts.isExpressionWithTypeArguments(type) &&
              ts.isIdentifier(type.expression) &&
              (type.expression.escapedText as string).startsWith('DOMEvent'),
          )
          ?.getText() ?? 'unknown'
      : 'unknown';

    const detail = domEvent.match(/DOMEvent<(.*)>/)?.[1] ?? domEvent;

    if (doctags) {
      if (hasDocTag(doctags, 'internal')) internal = true;
      if (hasDocTag(doctags, 'deprecated')) deprecated = true;
      if (hasDocTag(doctags, 'bubbles')) bubbles = true;
      if (hasDocTag(doctags, 'composed')) composed = true;
      if (hasDocTag(doctags, 'cancellable')) cancellable = true;
    }

    meta.set(name, {
      [TS_NODE]: signature,
      name,
      type,
      detail,
      docs,
      doctags,
      bubbles,
      composed,
      cancellable,
      internal,
      deprecated,
    });
  }

  return meta.size > 0 ? Array.from(meta.values()) : undefined;
}
