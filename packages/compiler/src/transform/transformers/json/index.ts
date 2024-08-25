import ts from 'typescript';

import type { Transformer } from '../transformer';

export function jsonTransformer(): Transformer {
  return {
    name: '@maverick-js/json',
    transform({ code, sourceFile, jsx, ctx }) {},
  };
}
