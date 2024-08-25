import ts from 'typescript';

import type { Transformer } from '../transformer';
import { Runtime } from './runtime';
import { RuntimeVariables } from './runtime-var';

export function domTransformer(): Transformer {
  return {
    name: '@maverick-js/dom',
    transform({ code, sourceFile, jsx, ctx }) {
      const vars = new RuntimeVariables(),
        runtime = new Runtime(),
        delegatedEvents = new Set<string>();

      // overwriteNode(code, t.root, printNode(node, sourceFile));
    },
  };
}
