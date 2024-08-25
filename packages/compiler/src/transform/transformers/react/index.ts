import ts from 'typescript';

import type { Transformer } from '../transformer';

export function reactTransformer(): Transformer {
  return {
    name: '@maverick-js/react',
    transform({ code, sourceFile, nodes, ctx }) {},
  };
}
