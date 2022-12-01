import ts from 'typescript';

import type { TypeMeta } from '../meta/component';

export function buildTypeMeta(checker: ts.TypeChecker, typeNode: ts.TypeNode): TypeMeta {
  const type = checker.getTypeAtLocation(typeNode),
    union = resolveTypeUnion(checker, type),
    serialized = serializeType(checker, type);
  return {
    serialized,
    union: union.length > 1 ? union : undefined,
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

const TYPE_FORMAT_FLAGS =
  ts.TypeFormatFlags.UseSingleQuotesForStringLiteralType |
  ts.TypeFormatFlags.NoTruncation |
  ts.TypeFormatFlags.InTypeAlias |
  ts.TypeFormatFlags.InElementType;

export function serializeType(
  checker: ts.TypeChecker,
  type: ts.Type,
  flags?: ts.TypeFormatFlags,
): string {
  return checker.typeToString(type, undefined, flags ?? TYPE_FORMAT_FLAGS);
}

export function resolvePrimitiveType(type: ts.Type) {
  const isAny = isType(type, isAnyType);
  if (isAny) return undefined;

  const str = isType(type, isStringType);
  const num = isType(type, isNumberType);
  const bool = isType(type, isBooleanType);

  if (Number(str) + Number(num) + Number(bool) > 1) return undefined;

  if (str) return 'string';
  if (num) return 'number';
  if (bool) return 'boolean';

  return undefined;
}

const isType = (type: ts.Type, is: (type: ts.Type) => boolean) => {
  return type.isUnion() ? type.types.some((t) => isType(t, is)) : is(type);
};

export function isBooleanType(t: ts.Type) {
  return (t.flags & (ts.TypeFlags.Boolean | ts.TypeFlags.BooleanLike)) > 0;
}

export function isNumberType(t: ts.Type) {
  return (
    (t.flags & (ts.TypeFlags.Number | ts.TypeFlags.NumberLike | ts.TypeFlags.NumberLiteral)) > 0
  );
}

export function isStringType(t: ts.Type) {
  return (
    (t.flags & (ts.TypeFlags.String | ts.TypeFlags.StringLike | ts.TypeFlags.StringLiteral)) > 0
  );
}

export function isAnyType(t: ts.Type) {
  return (t.flags & (t.flags & ts.TypeFlags.Any)) > 0;
}
