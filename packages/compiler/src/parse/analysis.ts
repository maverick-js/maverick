import type ts from 'typescript';

export interface ParseAnalysis {
  /** Whether the following components have been imported from "maverick.js". */
  components: {
    fragment?: ts.ImportSpecifier;
    portal?: ts.ImportSpecifier;
    for?: ts.ImportSpecifier;
  };
}
