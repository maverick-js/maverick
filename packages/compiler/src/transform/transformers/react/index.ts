import ts from 'typescript';

import type { Transformer } from '../transformer';

export const ReactTransformer: Transformer = {
  name: '@maverick-js/react',
  transform({ code, sourceFile, jsx, ctx }) {},
};
