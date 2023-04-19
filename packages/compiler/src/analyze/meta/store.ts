import type ts from 'typescript';

import { serializeType } from '../utils/types';
import { type StoreMeta, TS_NODE } from './component';

export function buildStoreMeta(checker: ts.TypeChecker, type?: ts.Type): StoreMeta | undefined {
  if (!type) return;

  const node = type.symbol.declarations?.[0];
  if (!node) return;

  return {
    [TS_NODE]: node,
    factory: type.symbol.escapedName + '',
    record: serializeType(
      checker,
      checker.getTypeOfSymbol(checker.getPropertyOfType(type, 'record')!),
    ),
  };
}
