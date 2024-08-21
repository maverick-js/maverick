import ts from 'typescript';

import type { Transformer } from '../transformer';

export const SSRTransformer: Transformer = {
  name: '@maverick-js/ssr',
  transform({ code, sourceFile, jsx, ctx }) {},
};
