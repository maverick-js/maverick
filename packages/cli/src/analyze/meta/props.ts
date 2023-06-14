import ts from 'typescript';

import { escapeQuotes } from '../../utils/str';
import { getDocs } from '../utils/docs';
import { buildTypeMeta } from '../utils/types';
import { getPropertiesAndGetters } from '../utils/walk';
import { type PropMeta, TS_NODE } from './component';
import { findDocTag, getDocTags, hasDocTag } from './doctags';

export interface PropMetaInfo {
  value?: string | false;
  type: ts.Type;
}

export function buildPropsMeta(
  checker: ts.TypeChecker,
  staticProp: ts.PropertyDeclaration | undefined,
  typeRoot: ts.Type | undefined,
): PropMeta[] | undefined {
  if (!typeRoot) return;

  const meta: PropMeta[] = [],
    propTypes = checker.getPropertiesOfType(typeRoot);

  if (propTypes.length > 0) {
    const values = staticProp?.initializer
      ? getPropertiesAndGetters(checker, staticProp.initializer)
      : null;

    for (const symbol of propTypes) {
      const signature = symbol.declarations?.[0];
      if (!signature || !ts.isPropertySignature(signature)) continue;

      const name = escapeQuotes(signature.name.getText()),
        type = checker.getTypeOfSymbol(symbol),
        value = values?.get(name);

      let info: PropMetaInfo = {
        type,
      };

      if (value) {
        info.value = ts.isPropertyAssignment(value) ? value.initializer.getText() : value.getText();
      }

      const propMeta = buildPropMeta(checker, name, signature, info);
      if (propMeta) meta.push(propMeta);
    }
  }

  return meta.length > 0 ? meta : undefined;
}

const filteredTagNames = new Set<string>([
  'readonly',
  'internal',
  'deprecated',
  'required',
  'default',
  'defaultValue',
]);

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
    filteredDoctags = doctags?.filter((tag) => !filteredTagNames.has(tag.name)),
    readonly =
      !!(node as ts.PropertyDeclaration)?.modifiers?.some(
        (mode) => mode.kind === ts.SyntaxKind.ReadonlyKeyword,
      ) ||
      (isGetAccessor && !hasSetAccessor) ||
      (!hasSetAccessor && doctags && hasDocTag(doctags, 'readonly'));

  let internal!: PropMeta['internal'],
    deprecated!: PropMeta['deprecated'],
    required!: PropMeta['required'],
    defaultValue!: PropMeta['default'];

  if (doctags) {
    if (hasDocTag(doctags, 'internal')) internal = true;
    if (hasDocTag(doctags, 'deprecated')) deprecated = true;
    if (hasDocTag(doctags, 'required')) required = true;
    defaultValue =
      findDocTag(doctags, 'default')?.text ?? findDocTag(doctags, 'defaultValue')?.text ?? '';
  }

  if (!defaultValue && info?.value) {
    defaultValue = info.value;
  }

  if (!defaultValue && ts.isPropertyDeclaration(node) && node.initializer) {
    defaultValue = node.initializer.getText();
  }

  return {
    [TS_NODE]: node,
    name,
    default: defaultValue?.length ? defaultValue : undefined,
    type: buildTypeMeta(checker, info.type),
    docs,
    doctags: filteredDoctags?.length ? filteredDoctags : undefined,
    required,
    readonly: readonly ? true : undefined,
    internal,
    deprecated,
  };
}
