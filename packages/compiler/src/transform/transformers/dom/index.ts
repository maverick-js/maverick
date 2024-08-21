import ts from 'typescript';

import type { Transformer } from '../transformer';

export const DOMTransformer: Transformer = {
  name: '@maverick-js/dom',
  transform({ code, sourceFile, jsx, ctx }) {
    /** Top-level variable declarations. */
    // variables: ts.VariableDeclaration[];
    /** Runtime import specifiers. */
    // runtime: Set<string>;
    // Delegate event listeners
    // overwriteNode(
    //   code,
    //   t.root,
    //   printer.printNode(
    //     ts.EmitHint.Unspecified,
    //     transformer.transform(t, ctx),
    //     t.root.getSourceFile(),
    //   ),
    // );
  },
};
