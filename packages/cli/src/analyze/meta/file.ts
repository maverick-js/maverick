import { normalize } from 'pathe';
import type ts from 'typescript';

import { type FileMeta, TS_NODE } from './component';

export function buildFileMeta(node: ts.Node): FileMeta {
  const file = node.getSourceFile();
  return {
    [TS_NODE]: file,
    path: normalize(file.fileName),
  };
}
