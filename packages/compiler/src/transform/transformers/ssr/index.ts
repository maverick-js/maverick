import ts from 'typescript';

import type { Transformer } from '../transformer';

export function ssrTransformer(): Transformer {
  return {
    name: '@maverick-js/ssr',
    transform({ code, sourceFile, jsx, ctx }) {},
  };
}
