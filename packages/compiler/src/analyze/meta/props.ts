import ts from 'typescript';

import { escapeQuotes } from '../../utils/print';
import { camelToKebabCase } from '../../utils/str';
import { getDocs } from '../utils/docs';
import { buildTypeMeta } from '../utils/types';
import { getProperties, getPropertyAssignmentValue, getValueNode } from '../utils/walk';
import { type PropMeta, TS_NODE } from './component';
import { findDocTag, getDocTags, hasDocTag } from './doctags';

export interface PropMetaInfo {
  attribute?: string;
  reflect?: boolean;
  value?: string | false;
  type: ts.Type;
}

export function buildPropsMeta(
  checker: ts.TypeChecker,
  definition: ts.ObjectLiteralExpression,
  typeRoot?: ts.Type,
): PropMeta[] | undefined {
  if (!typeRoot) return;

  const meta: PropMeta[] = [],
    propTypes = checker.getPropertiesOfType(typeRoot);

  if (propTypes.length > 0) {
    let props = getValueNode(checker, getPropertyAssignmentValue(checker, definition, 'props'));

    if (props && !ts.isObjectLiteralExpression(props)) {
      props = undefined;
    }

    for (const symbol of propTypes) {
      const signature = symbol.declarations?.[0];
      if (!signature || !ts.isPropertySignature(signature) || !signature.name) continue;

      const name = escapeQuotes(signature.name.getText()),
        type = checker.getTypeOfSymbol(symbol),
        valueNode = props ? getPropertyAssignmentValue(checker, props, name) : null,
        value =
          valueNode &&
          (ts.isVariableDeclaration(valueNode) ||
            ts.isPropertyDeclaration(valueNode) ||
            ts.isPropertyAssignment(valueNode))
            ? getValueNode(checker, valueNode.initializer) ?? valueNode
            : null;

      let info: PropMetaInfo = {
        type,
      };

      if (value) {
        if (ts.isCallExpression(value) && value.arguments[0]) {
          const declaration = getValueNode(checker, value.arguments[0]);
          if (declaration && ts.isObjectLiteralExpression(declaration)) {
            const val = getPropertyAssignmentValue(checker, declaration, 'value');

            info.value =
              (val as ts.PropertyAssignment)?.initializer?.getText() ??
              val?.getText() ??
              'undefined';

            const attr = getValueNode(
                checker,
                getPropertyAssignmentValue(checker, declaration, 'attribute'),
              ),
              reflect = getValueNode(
                checker,
                getPropertyAssignmentValue(checker, declaration, 'reflect'),
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
          }
        } else {
          info.attribute = camelToKebabCase(name);
          info.value = ts.isPropertyAssignment(value)
            ? value.initializer.getText()
            : value.getText();
        }
      } else {
        info.attribute = camelToKebabCase(name);
      }

      const propMeta = buildPropMeta(checker, name, signature, info);
      if (propMeta) meta.push(propMeta);
    }
  }

  return meta.length > 0 ? meta : undefined;
}

export function buildPropMeta(
  checker: ts.TypeChecker,
  name: string,
  node:
    | ts.PropertyDeclaration
    | ts.GetAccessorDeclaration
    | ts.SetAccessorDeclaration
    | ts.PropertySignature,
  info: PropMetaInfo,
): PropMeta {
  const identifier = node?.name as ts.Identifier | undefined,
    symbol = identifier ? checker.getSymbolAtLocation(identifier) : undefined,
    isGetAccessor = node && ts.isGetAccessor(node),
    hasSetAccessor =
      node && ts.isGetAccessor(node)
        ? !!symbol?.declarations!.some(ts.isSetAccessorDeclaration)
        : undefined,
    docs = identifier ? getDocs(checker, identifier) : undefined,
    doctags = node ? getDocTags(node) : undefined,
    readonly =
      !!(node as ts.PropertyDeclaration)?.modifiers?.some(
        (mode) => mode.kind === ts.SyntaxKind.ReadonlyKeyword,
      ) ||
      (isGetAccessor && !hasSetAccessor) ||
      (!hasSetAccessor && doctags && hasDocTag(doctags, 'readonly'));

  let internal!: PropMeta['internal'],
    deprecated!: PropMeta['deprecated'],
    required!: PropMeta['required'],
    $default!: PropMeta['default'],
    attribute!: PropMeta['attribute'],
    reflect!: PropMeta['reflect'];

  if (doctags) {
    if (hasDocTag(doctags, 'internal')) internal = true;
    if (hasDocTag(doctags, 'deprecated')) deprecated = true;
    if (hasDocTag(doctags, 'required')) required = true;
    $default =
      findDocTag(doctags, 'default')?.text ?? findDocTag(doctags, 'defaultValue')?.text ?? '';
  }

  if (info && !readonly) {
    attribute = info.attribute;
    reflect = info.reflect;
  }

  if (!$default && info?.value) {
    $default = info.value;
  }

  return {
    [TS_NODE]: node,
    name,
    default: $default?.length ? $default : undefined,
    type: buildTypeMeta(checker, info.type),
    docs,
    doctags,
    required,
    readonly: readonly ? true : undefined,
    attribute,
    reflect,
    internal,
    deprecated,
  };
}
