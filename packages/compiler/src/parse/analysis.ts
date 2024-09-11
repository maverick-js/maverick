import type { JsxElementNode } from '@maverick-js/ts';
import type ts from 'typescript';

export interface ParseAnalysis {
  /** Whether the following components have been imported from "maverick.js". */
  components: {
    fragment?: ts.ImportSpecifier;
    portal?: ts.ImportSpecifier;
    for?: ts.ImportSpecifier;
    component?: ts.ImportSpecifier;
  };
  /**
   * Map of `<host>` JSX element nodes to their corresponding `tagName` initializer on the
   * class component.
   */
  tagNames: WeakMap<JsxElementNode, ts.Expression>;
}
