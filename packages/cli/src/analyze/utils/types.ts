import ts from 'typescript';

import type { TypeMeta } from '../meta/component';

const CONCISE_TYPE_FORMAT_FLAGS =
  ts.TypeFormatFlags.UseSingleQuotesForStringLiteralType |
  ts.TypeFormatFlags.NoTruncation |
  ts.TypeFormatFlags.InElementType;

const FULL_TYPE_FORMAT_FLAGS =
  ts.TypeFormatFlags.UseSingleQuotesForStringLiteralType |
  ts.TypeFormatFlags.NoTypeReduction |
  ts.TypeFormatFlags.NoTruncation |
  ts.TypeFormatFlags.InTypeAlias |
  ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope;

export function buildTypeMeta(checker: ts.TypeChecker, type: ts.Type): TypeMeta {
  return {
    primitive: resolvePrimitiveType(type),
    concise: serializeType(checker, type, CONCISE_TYPE_FORMAT_FLAGS),
    full: serializeType(checker, type, FULL_TYPE_FORMAT_FLAGS),
  };
}

export function resolveTypeUnion(checker: ts.TypeChecker, type: ts.Type): string[] {
  if (!type.isUnion()) return [];

  const parts = new Set<string>();
  parseTypeParts(checker, type, parts);

  if (parts.has('true') && parts.has('false')) {
    parts.delete('true');
    parts.delete('false');
    parts.add('boolean');
  }

  let sortedParts = Array.from(parts.keys()).sort();

  if (sortedParts.length > 1) {
    sortedParts = sortedParts.map((p) => (p.indexOf('=>') >= 0 ? `(${p})` : p));
  }

  if (sortedParts.length > 20) {
    return [serializeType(checker, type)];
  }

  return sortedParts;
}

export function parseTypeParts(checker: ts.TypeChecker, type: ts.Type, parts: Set<string>): void {
  if (type.isUnion()) {
    for (const part of type.types) {
      parseTypeParts(checker, part, parts);
    }
  } else {
    parts.add(serializeType(checker, type));
  }
}

export function serializeType(
  checker: ts.TypeChecker,
  type: ts.Type,
  flags: ts.TypeFormatFlags = CONCISE_TYPE_FORMAT_FLAGS,
): string {
  return checker.typeToString(type, undefined, flags);
}

export function resolvePrimitiveType(type: ts.Type) {
  if (isNeverType(type)) {
    return 'never';
  } else if (isAnyType(type)) {
    return 'any';
  } else if (isSymbolType(type)) {
    return 'symbol';
  } else if (isUnknownType(type)) {
    return 'unknown';
  } else if (type.getCallSignatures().length) {
    return 'function';
  }

  const str = isType(type, isStringType),
    num = isType(type, isNumberType),
    bool = isType(type, isBooleanType);

  if (str && num && bool) return 'mixed';
  else if (str && num) return 'mixed';
  else if (str && bool) return 'mixed';
  else if (num && bool) return 'mixed';
  else if (str) return 'string';
  else if (num) return 'number';
  else if (bool) return 'boolean';

  if (isType(type, isObjectType)) {
    return 'object';
  }

  return 'unknown';
}

function isType(type: ts.Type, is: (type: ts.Type) => boolean) {
  return type.isUnion() ? type.types.some((t) => isType(t, is)) : is(type);
}

const BOOLEAN_FLAGS = ts.TypeFlags.Boolean | ts.TypeFlags.BooleanLike;
export function isBooleanType(t: ts.Type) {
  return (t.flags & BOOLEAN_FLAGS) > 0;
}

const NUMBER_FLAGS = ts.TypeFlags.Number | ts.TypeFlags.NumberLike | ts.TypeFlags.NumberLiteral;
export function isNumberType(t: ts.Type) {
  return (t.flags & NUMBER_FLAGS) > 0;
}

const STRING_FLAGS = ts.TypeFlags.String | ts.TypeFlags.StringLike | ts.TypeFlags.StringLiteral;
export function isStringType(t: ts.Type) {
  return (t.flags & STRING_FLAGS) > 0;
}

const SYMBOL_FLAGS =
  ts.TypeFlags.ESSymbol | ts.TypeFlags.ESSymbolLike | ts.TypeFlags.UniqueESSymbol;
export function isSymbolType(t: ts.Type) {
  return (t.flags & SYMBOL_FLAGS) > 0;
}

const OBJECT_FLAGS = ts.TypeFlags.Object;
export function isObjectType(t: ts.Type) {
  return (t.flags & OBJECT_FLAGS) > 0;
}

export function isAnyType(t: ts.Type) {
  return (t.flags & ts.TypeFlags.Any) > 0;
}

export function isNeverType(t: ts.Type) {
  return (t.flags & ts.TypeFlags.Never) > 0;
}

export function isUnknownType(t: ts.Type) {
  return (t.flags & ts.TypeFlags.Unknown) > 0;
}
