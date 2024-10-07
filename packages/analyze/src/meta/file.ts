import { normalize } from 'pathe';
import type ts from 'typescript';

import type { FileMeta } from './component';
import { TS_NODE_SYMBOL } from './symbols';

export function buildFileMeta(node: ts.Node): FileMeta {
  const file = node.getSourceFile();
  return {
    [TS_NODE_SYMBOL]: file,
    path: normalize(file.fileName),
  };
}
