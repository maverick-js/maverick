import ts from 'typescript';

import type { Transformer } from '../transformer';

export const JSONTransformer: Transformer = {
  name: '@maverick-js/json',
  transform({ code, sourceFile, jsx, ctx }) {},
};
