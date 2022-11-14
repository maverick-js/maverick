import ts from 'typescript';

import { getDeclaration } from '../utils/declaration';
import { getDocs } from '../utils/docs';
import { buildTypeMeta } from '../utils/types';
import {
  getPropertyAssignmentValue,
  getValueNode,
  isCallExpression,
  walkProperties,
  walkSignatures,
} from '../utils/walk';
import { type DocTagMeta, type EventMeta, TS_NODE } from './component';
import { buildMetaFromDocTags, getDocTags, hasDocTag } from './doctags';

export function buildEventsMeta(
  checker: ts.TypeChecker,
  root: ts.ObjectLiteralExpression,
  parentDocTags?: DocTagMeta[],
) {
  const meta = new Map<string, EventMeta>(),
    defs = getPropertyAssignmentValue(checker, root, 'events');

  if (parentDocTags?.length) {
    const events = buildMetaFromDocTags(
      parentDocTags,
      'event',
      '@event playing - Fired when media playback begins.',
    );

    for (const event of events) {
      meta.set(event.name, {
        ...event,
        type: { serialized: 'DOMEvent' },
      });
    }
  }

  if (defs && isCallExpression(defs, 'defineEvents')) {
    const signature = defs.typeArguments?.[0] ? defs.typeArguments[0] : undefined;
    if (signature) {
      const members = walkSignatures(checker, signature);
      for (const [name, prop] of members.props) {
        const isTypeReference =
            prop.type && ts.isTypeReferenceNode(prop.type) && ts.isIdentifier(prop.type.typeName),
          docs =
            getDocs(checker, prop.name as ts.Identifier) ??
            (isTypeReference ? getDocs(checker, prop.type.typeName) : undefined),
          doctags =
            getDocTags(prop) ??
            (isTypeReference ? getDocTags(getDeclaration(checker, prop.type.typeName)) : undefined),
          type = buildTypeMeta(checker, prop, prop.type);

        let internal!: EventMeta['internal'],
          deprecated!: EventMeta['deprecated'],
          bubbles!: EventMeta['bubbles'],
          composed!: EventMeta['composed'],
          cancellable!: EventMeta['cancellable'];

        if (doctags) {
          if (hasDocTag(doctags, 'internal')) internal = true;
          if (hasDocTag(doctags, 'deprecated')) deprecated = true;
          if (hasDocTag(doctags, 'bubbles')) bubbles = true;
          if (hasDocTag(doctags, 'composed')) composed = true;
          if (hasDocTag(doctags, 'cancellable')) cancellable = true;
        }

        meta.set(name, {
          [TS_NODE]: prop,
          name,
          type,
          docs,
          doctags,
          bubbles,
          composed,
          cancellable,
          internal,
          deprecated,
        });
      }
    }
  } else if (defs) {
    const members = walkProperties(checker, defs);

    for (const [name, node] of members.props) {
      const value = getValueNode(checker, node.value) ?? node.value,
        isDefineProp = isCallExpression(value, 'defineEvent'),
        definition = ts.isObjectLiteralExpression(value)
          ? value
          : isDefineProp && getValueNode(checker, value.arguments[1]),
        docs = getDocs(checker, node.assignment.name as ts.Identifier),
        doctags = getDocTags(node.assignment);

      let internal!: EventMeta['internal'],
        deprecated!: EventMeta['deprecated'],
        eventInit: Pick<EventMeta, 'bubbles' | 'composed' | 'cancellable'> = {};

      if (doctags) {
        if (hasDocTag(doctags, 'internal')) internal = true;
        if (hasDocTag(doctags, 'deprecated')) deprecated = true;
        if (hasDocTag(doctags, 'bubbles')) eventInit.bubbles = true;
        if (hasDocTag(doctags, 'composed')) eventInit.composed = true;
        if (hasDocTag(doctags, 'cancellable')) eventInit.cancellable = true;
      }

      const generic = isDefineProp && value.typeArguments?.[0] ? value.typeArguments[0] : undefined,
        type =
          !generic && ts.isObjectLiteralExpression(value)
            ? { serialized: 'DOMEvent' }
            : buildTypeMeta(checker, value, generic);

      if (definition && ts.isObjectLiteralExpression(definition)) {
        const props = ['bubbles', 'composed', 'cancellable'] as const;
        for (const prop of props) {
          if (!(prop in eventInit)) {
            const init = getValueNode(
              checker,
              getPropertyAssignmentValue(checker, definition, prop),
            );

            if (init && init.kind !== ts.SyntaxKind.FalseKeyword) {
              eventInit[prop] = true;
            }
          }
        }
      }

      meta.set(name, {
        [TS_NODE]: node.assignment,
        name,
        type,
        docs,
        doctags,
        ...eventInit,
        internal,
        deprecated,
      });
    }
  }

  return meta.size > 0 ? Array.from(meta.values()) : undefined;
}
