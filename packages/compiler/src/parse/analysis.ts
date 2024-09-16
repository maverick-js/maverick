import type ts from 'typescript';

export interface ParseAnalysis {
  /** Whether the following components have been imported from "maverick.js". */
  components: {
    Fragment?: ts.ImportSpecifier;
    Portal?: ts.ImportSpecifier;
    For?: ts.ImportSpecifier;
    Host?: ts.ImportSpecifier;
  };
}
