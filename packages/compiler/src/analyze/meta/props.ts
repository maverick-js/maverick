import ts from 'typescript';

import { escapeQuotes } from '../../utils/print';
import { camelToKebabCase } from '../../utils/str';
import type { ElementDefintionNode } from '../plugins/AnalyzePlugin';
import { getDocs } from '../utils/docs';
import { buildTypeMeta } from '../utils/types';
import {
  getPropertyAssignmentValue,
  getValueNode,
  walkProperties,
  walkSignatures,
} from '../utils/walk';
import { type PropMeta, TS_NODE } from './component';
import { findDocTag, getDocTags, hasDocTag } from './doctags';

export interface PropMetaInfo {
  attribute?: string;
  reflect?: boolean;
  value?: string | false;
  type?: ts.Type;
}

export function buildPropsMeta(
  checker: ts.TypeChecker,
  declarationRoot: ts.ObjectLiteralExpression,
  typeRoot?: ElementDefintionNode['types']['props'],
): PropMeta[] | undefined {
  if (!typeRoot) return;

  const meta: PropMeta[] = [],
    members = walkSignatures(checker, typeRoot);

  if (members.props.size > 0) {
    const props = getPropertyAssignmentValue(checker, declarationRoot, 'props'),
      defs = props ? walkProperties(checker, props) : null;

    for (const [name, prop] of members.props) {
      const signature = prop.signature;
      if (!signature.type) continue;

      const valueNode = defs?.props.get(name),
        value = valueNode ? getValueNode(checker, valueNode.value) ?? valueNode.value : null,
        definition = value && ts.isObjectLiteralExpression(value) ? value : false;

      let info: PropMetaInfo = {
        type: prop.type,
      };

      if (definition) {
        info.value =
          getPropertyAssignmentValue(checker, definition, 'initial')?.getText() ?? 'undefined';

        const attr = getValueNode(
            checker,
            getPropertyAssignmentValue(checker, definition, 'attribute'),
          ),
          reflect = getValueNode(
            checker,
            getPropertyAssignmentValue(checker, definition, 'reflect'),
          );

        if (!attr || attr.kind !== ts.SyntaxKind.FalseKeyword) {
          info.attribute =
            attr?.kind === ts.SyntaxKind.StringLiteral
              ? escapeQuotes(attr.getText())
              : camelToKebabCase(name);
        }

        if (reflect && reflect.kind !== ts.SyntaxKind.FalseKeyword) {
          info.reflect = true;
        }
      } else {
        info.attribute = camelToKebabCase(name);
      }

      const propMeta = buildPropMeta(checker, name, valueNode?.assignment, signature, info);
      if (propMeta) meta.push(propMeta);
    }
  }

  return meta.length > 0 ? meta : undefined;
}

export function buildPropMeta(
  checker: ts.TypeChecker,
  name: string,
  declaration:
    | ts.VariableDeclaration
    | ts.PropertyAssignment
    | ts.GetAccessorDeclaration
    | ts.PropertySignature
    | ts.ShorthandPropertyAssignment
    | undefined,
  signature: ts.PropertySignature,
  info?: PropMetaInfo,
): PropMeta | undefined {
  const identifier = declaration?.name as ts.Identifier | undefined,
    sigIdentifier = signature.name as ts.Identifier,
    symbol = identifier ? checker.getSymbolAtLocation(identifier) : undefined,
    isGetAccessor = declaration && ts.isGetAccessor(declaration),
    hasSetAccessor =
      declaration && ts.isGetAccessor(declaration)
        ? !!symbol?.declarations!.some(ts.isSetAccessorDeclaration)
        : undefined,
    docs =
      getDocs(checker, sigIdentifier) ?? (identifier ? getDocs(checker, identifier) : undefined),
    doctags = getDocTags(signature) ?? (declaration ? getDocTags(declaration) : undefined),
    readonly =
      !!signature.modifiers?.some((mod) => mod.kind === ts.SyntaxKind.ReadonlyKeyword) ||
      (isGetAccessor && !hasSetAccessor) ||
      (!hasSetAccessor && doctags && hasDocTag(doctags, 'readonly'));

  let internal!: PropMeta['internal'],
    deprecated!: PropMeta['deprecated'],
    required!: PropMeta['required'],
    $default!: PropMeta['default'],
    attribute!: PropMeta['attribute'],
    reflect!: PropMeta['reflect'],
    accessor!: PropMeta['accessor'];

  if (doctags) {
    if (hasDocTag(doctags, 'internal')) internal = true;
    if (hasDocTag(doctags, 'deprecated')) deprecated = true;
    if (hasDocTag(doctags, 'required')) required = true;
    $default =
      findDocTag(doctags, 'default')?.text ?? findDocTag(doctags, 'defaultValue')?.text ?? '';
  }

  if (isGetAccessor || hasSetAccessor) {
    accessor = {
      get: isGetAccessor ? true : undefined,
      set: hasSetAccessor ? true : undefined,
    };
  }

  if (info && !readonly) {
    attribute = info.attribute;
    reflect = info.reflect;
  }

  if (!$default && info?.value) {
    $default = info.value;
  }

  return {
    [TS_NODE]: signature,
    name,
    default: $default?.length ? $default : undefined,
    type: buildTypeMeta(checker, signature.type!, info?.type),
    docs,
    doctags,
    required,
    readonly: readonly ? true : undefined,
    attribute,
    reflect,
    internal,
    deprecated,
    accessor,
  };
}
