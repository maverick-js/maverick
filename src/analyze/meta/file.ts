import normalizePath from 'normalize-path';
import ts from 'typescript';

import { type FileMeta, TS_NODE } from './component';

export function buildFileMeta(node: ts.Node): FileMeta {
  const file = node.getSourceFile();
  return {
    [TS_NODE]: file,
    path: normalizePath(file.fileName),
  };
}
